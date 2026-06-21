/**
 * process-segment-queue
 *
 * Processes one pending segment eval job per invocation.
 *
 * Trigger modes:
 *   - POST /process-segment-queue            → claim next pending job
 *   - POST /process-segment-queue { segment_id } → enqueue + claim a specific segment
 *
 * Retry schedule (exponential backoff):
 *   attempt 1 → immediate  (no delay)
 *   attempt 2 → +2 min
 *   attempt 3 → +8 min
 *   attempt 4+ → status='failed', no further auto-retry (admin manual trigger needed)
 *
 * Evaluation: calls crm_eval_segment_rules(rules JSONB) RPC which validates
 * the rule tree against an allowlist and executes a parameterized SQL query.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Retry delays in milliseconds, indexed by attempt_count after failure. */
const RETRY_DELAYS_MS = [0, 2 * 60_000, 8 * 60_000];

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface EvalJob {
  segment_id: string;
  status: string;
  attempt_count: number;
  max_attempts: number;
  last_error: string | null;
  next_retry_at: string | null;
  completed_at: string | null;
  enqueued_at: string;
  updated_at: string;
}

/**
 * Evaluate a segment by calling crm_eval_segment_rules RPC.
 *
 * The RPC validates all field names and operators against a hardcoded allowlist
 * and constructs a parameterized SQL query — no injection surface.
 *
 * Returns the count of matching non-suppressed contacts with marketing consent,
 * or -1 as a sentinel for static segments (member count maintained externally).
 */
async function evaluateSegment(segmentId: string): Promise<number> {
  const supabase = db();

  // Fetch the segment rules (column is rules_json, is_dynamic added in migration 000007)
  const { data: segment, error: segErr } = await supabase
    .from("crm_segments")
    .select("rules_json, is_dynamic")
    .eq("id", segmentId)
    .single();

  if (segErr) throw new Error(`Segment fetch failed: ${segErr.message}`);

  // is_dynamic defaults to true; treat undefined (pre-migration) as dynamic
  const isDynamic = segment.is_dynamic !== false;
  if (!isDynamic) {
    // Static segments: member count is maintained manually, nothing to evaluate
    return -1; // sentinel: skip member_count update
  }

  // Call crm_eval_segment_rules to get matching contacts, then count the rows.
  // The RPC validates field names + operators and enforces is_suppressed=false AND marketing_consent=true.
  const emptyTree = { type: "group", operator: "AND", conditions: [] };
  const { data: rows, error: evalErr } = await supabase
    .rpc("crm_eval_segment_rules", { p_rules: segment.rules_json ?? emptyTree })
    .select("email");

  if (evalErr) throw new Error(`Segment eval failed: ${evalErr.message}`);
  return (rows ?? []).length;
}

async function markSucceeded(segmentId: string, memberCount: number) {
  const supabase = db();
  const now = new Date().toISOString();

  // Update queue row
  await supabase
    .from("crm_segment_eval_queue")
    .update({ status: "succeeded", completed_at: now, last_error: null, updated_at: now })
    .eq("segment_id", segmentId);

  // Update segment member count + staleness timestamp (skip if static sentinel)
  if (memberCount >= 0) {
    await supabase
      .from("crm_segments")
      .update({ member_count: memberCount, last_evaluated_at: now })
      .eq("id", segmentId);
  } else {
    await supabase
      .from("crm_segments")
      .update({ last_evaluated_at: now })
      .eq("id", segmentId);
  }
}

async function markFailed(job: EvalJob, errorMsg: string) {
  const supabase = db();
  const now = new Date().toISOString();
  const attempt = job.attempt_count; // already incremented when claimed

  if (attempt >= job.max_attempts) {
    // Exhausted retries → terminal failure
    await supabase
      .from("crm_segment_eval_queue")
      .update({
        status: "failed",
        last_error: errorMsg,
        completed_at: now,
        updated_at: now,
      })
      .eq("segment_id", job.segment_id);
    console.error(
      `[segment-eval] segment ${job.segment_id} failed after ${attempt} attempts: ${errorMsg}`,
    );
    return;
  }

  // Schedule retry with exponential backoff
  const delayMs = RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
  const nextRetry = new Date(Date.now() + delayMs).toISOString();

  await supabase
    .from("crm_segment_eval_queue")
    .update({
      status: "pending",
      last_error: errorMsg,
      next_retry_at: nextRetry,
      updated_at: now,
    })
    .eq("segment_id", job.segment_id);

  console.warn(
    `[segment-eval] segment ${job.segment_id} attempt ${attempt} failed — retry at ${nextRetry}: ${errorMsg}`,
  );
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = db();
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    // If a specific segment_id was provided, enqueue it first
    if (body.segment_id) {
      const { error: enqErr } = await supabase.rpc("crm_enqueue_segment_eval", {
        p_segment_id: body.segment_id,
      });
      if (enqErr) throw new Error(`Enqueue failed: ${enqErr.message}`);
    }

    // Claim the next ready job
    const { data: jobs, error: claimErr } = await supabase.rpc(
      "crm_claim_segment_eval_job",
    );

    if (claimErr) throw new Error(`Claim failed: ${claimErr.message}`);
    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, message: "No pending jobs" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    const job = jobs[0] as EvalJob;
    console.log(
      `[segment-eval] processing segment ${job.segment_id} (attempt ${job.attempt_count})`,
    );

    let memberCount: number;
    try {
      memberCount = await evaluateSegment(job.segment_id);
    } catch (evalErr: any) {
      await markFailed(job, evalErr.message ?? String(evalErr));
      return new Response(
        JSON.stringify({ ok: false, error: evalErr.message, segment_id: job.segment_id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    await markSucceeded(job.segment_id, memberCount);

    return new Response(
      JSON.stringify({ ok: true, segment_id: job.segment_id, member_count: memberCount }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  } catch (err: any) {
    console.error("[segment-eval] unhandled error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
    );
  }
};

serve(handler);
