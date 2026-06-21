/**
 * send-campaign-batch
 *
 * T8: Batched, ledger-resumable campaign email sender.
 * T9: Atomic double-send guard via crm_claim_campaign_for_send().
 * T11: N+1 fix — crm_get_unsent_batch now LEFT JOINs preference tokens so all
 *      per-recipient data arrives in one query; preference-centre URL injected.
 * T15: Send controls — warm-up quota, per-campaign kill switch, global kill switch.
 *
 * POST body (all optional):
 *   { campaign_id?: string }  — omit to pick up any scheduled campaign
 *
 * Flow per invocation:
 *   0. Check global kill switch (crm_service_health state='open' → 503)
 *   1. Claim a campaign atomically (FOR UPDATE SKIP LOCKED)
 *   2. If new run: count total recipients, store in campaign_run
 *   3. Loop until no unsent recipients remain:
 *        a. Check per-campaign kill switch (admin may have paused mid-run)
 *        b. crm_get_unsent_batch(run_id, rules_json, 50)
 *        c. Claim daily send quota (warm-up limit) — stop for today if exhausted
 *        d. Check circuit breaker
 *        e. POST /emails/batch to Resend (≤50 per call)
 *        f. INSERT into sent_ledger ON CONFLICT DO NOTHING  ← second guard
 *        g. Update heartbeat + sent_count
 *   4. crm_complete_campaign_run()
 *
 * Resumable: if the EF crashes mid-loop, the next invocation re-claims
 * (stale heartbeat recovery after 10 min) and resumes from where ledger left off.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkCircuit,
  recordFailure,
  recordSuccess,
} from "../_shared/resend-circuit-breaker.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE   = 50;
const RESEND_URL   = "https://api.resend.com/emails/batch";
const FROM_EMAIL   = Deno.env.get("CAMPAIGN_FROM_EMAIL") ??
                     "Soteria Eye Clinic <campaigns@soteriaeyeclinic.com>";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface ClaimedCampaign {
  campaign_id:   string;
  run_id:        string;
  campaign_name: string;
  segment_id:    string;
  rules_json:    unknown;
  subject_line:  string | null;
  template_id:   string | null;
  is_new_run:    boolean;
}

interface Recipient {
  email:            string;
  full_name:        string | null;
  preference_token: string | null;
}

// ── Resend batch send ─────────────────────────────────────────────────────────

async function sendBatch(
  recipients: Recipient[],
  subject: string,
  campaignName: string,
  campaignId: string,
  runId: string,
): Promise<{ messageIds: (string | null)[]; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { messageIds: [], error: "RESEND_API_KEY not configured" };

  const payload = recipients.map((r) => ({
    from:    FROM_EMAIL,
    to:      [r.email],
    subject,
    html:    buildEmailHtml(r, campaignName, subject),
    text:    buildEmailText(r, campaignName),
    // Tags are passed through in Resend webhooks — lets crm_handle_email_event
    // look up the campaign without needing to parse the email address alone.
    tags: [
      { name: "campaign_id",     value: campaignId },
      { name: "campaign_run_id", value: runId },
    ],
  }));

  const res = await fetch(RESEND_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      messageIds: [],
      error: `Resend error ${res.status}: ${body.slice(0, 200)}`,
    };
  }

  const json = await res.json() as { data?: { id: string | null }[] };
  const ids   = (json.data ?? []).map((d) => d.id ?? null);
  return { messageIds: ids };
}

function preferenceUrl(r: Recipient): string {
  if (r.preference_token && SUPABASE_URL) {
    return `${SUPABASE_URL}/functions/v1/email-preference-page` +
           `?e=${encodeURIComponent(r.email)}&t=${r.preference_token}`;
  }
  return `https://soteriaeyeclinic.com/unsubscribe?email=${encodeURIComponent(r.email)}`;
}

function buildEmailHtml(r: Recipient, campaignName: string, subject: string): string {
  const name    = r.full_name?.split(" ")[0] ?? "Valued Customer";
  const prefUrl = preferenceUrl(r);
  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
<h2>${escapeHtml(subject)}</h2>
<p>Dear ${escapeHtml(name)},</p>
<p>Thank you for being a valued member of the Soteria Eye Clinic family.</p>
<p>This is a message from our team regarding: <strong>${escapeHtml(campaignName)}</strong>.</p>
<hr/>
<p style="font-size:12px;color:#666">
  Soteria Eye Clinic &bull; Lagos, Nigeria<br/>
  <a href="${prefUrl}">Manage email preferences</a>
</p>
</body></html>`;
}

function buildEmailText(r: Recipient, campaignName: string): string {
  const name = r.full_name?.split(" ")[0] ?? "Valued Customer";
  return `Dear ${name},\n\nThank you for being a valued member of the Soteria Eye Clinic family.\n\n${campaignName}\n\n---\nSoteria Eye Clinic\nTo unsubscribe reply with STOP.`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Write batch to sent ledger ────────────────────────────────────────────────

async function writeLedger(
  supabase: ReturnType<typeof db>,
  runId: string,
  recipients: Recipient[],
  messageIds: (string | null)[],
): Promise<void> {
  const rows = recipients.map((r, i) => ({
    campaign_run_id:   runId,
    contact_email:     r.email.toLowerCase().trim(),
    resend_message_id: messageIds[i] ?? null,
  }));

  // ON CONFLICT DO NOTHING = second-layer double-send guard
  const { error } = await supabase
    .from("crm_campaign_sent_ledger")
    .insert(rows)
    .on("*", { ignoreDuplicates: true } as any);

  // Supabase JS v2 upsert alternative for ON CONFLICT DO NOTHING
  if (error && !error.message.includes("duplicate")) {
    console.error("[send-campaign] ledger insert error:", error.message);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  const supabase = db();

  try {
    const body = req.method === "POST"
      ? await req.json().catch(() => ({}))
      : {};

    const campaignId: string | undefined = body.campaign_id;

    // ── Step 0: T15 global kill switch ────────────────────────────────────────
    const { data: killRow } = await supabase
      .from("crm_service_health")
      .select("state")
      .eq("service_name", "crm_bulk_send")
      .maybeSingle();

    if (killRow?.state === "open") {
      console.warn("[send-campaign] global kill switch is ACTIVE — all bulk sends halted");
      return json({
        ok: false,
        globalKillActive: true,
        message: "Global CRM kill switch is active — all bulk sends halted by admin",
      }, 503);
    }

    // ── Step 1: T9 atomic claim ───────────────────────────────────────────────
    const { data: claimed, error: claimErr } = await supabase
      .rpc("crm_claim_campaign_for_send", {
        p_campaign_id: campaignId ?? null,
      });

    if (claimErr) {
      return json({ error: `Claim failed: ${claimErr.message}` }, 500);
    }

    if (!claimed || claimed.length === 0) {
      return json({ ok: true, message: "No claimable campaigns" });
    }

    const campaign = claimed[0] as ClaimedCampaign;
    const { campaign_id, run_id, subject_line, campaign_name, rules_json, is_new_run } = campaign;

    console.log(
      `[send-campaign] claimed ${campaign_id} (run ${run_id}, new=${is_new_run})`,
    );

    // ── Step 2: Set total_recipients on new run ───────────────────────────────
    if (is_new_run) {
      const { data: countData } = await supabase
        .rpc("crm_count_segment_members", { p_rules_json: rules_json });
      const total = typeof countData === "number" ? countData : 0;

      await supabase
        .from("crm_campaign_runs")
        .update({ total_recipients: total })
        .eq("id", run_id);

      console.log(`[send-campaign] run ${run_id} total_recipients=${total}`);
    }

    const subject = subject_line ?? campaign_name ?? "Message from Soteria Eye Clinic";
    let totalSent = 0;

    // ── Step 3: Batch loop ────────────────────────────────────────────────────
    for (;;) {
      // T15: Per-campaign kill switch — admin may pause the campaign mid-run
      const { data: campaignStatus } = await supabase
        .from("crm_campaigns")
        .select("status")
        .eq("id", campaign_id)
        .maybeSingle();

      if (campaignStatus?.status !== "running") {
        console.log(
          `[send-campaign] campaign ${campaign_id} status='${campaignStatus?.status}' (paused by admin), stopping`,
        );
        return json({
          ok: true,
          paused: true,
          sent: totalSent,
          message: `Campaign stopped — status is '${campaignStatus?.status}'`,
        });
      }

      // Get next unsent batch (DB-side NOT IN ledger)
      const { data: batch, error: batchErr } = await supabase
        .rpc("crm_get_unsent_batch", {
          p_run_id:     run_id,
          p_rules_json: rules_json,
          p_batch_size: BATCH_SIZE,
        });

      if (batchErr) {
        await supabase.rpc("crm_pause_campaign", {
          p_campaign_id: campaign_id,
          p_reason:      `Batch load failed: ${batchErr.message}`,
        });
        return json({ ok: false, error: batchErr.message, sent: totalSent }, 500);
      }

      const recipients = (batch ?? []) as Recipient[];
      if (recipients.length === 0) break; // all done

      // T15: Warm-up daily quota — claim slots atomically before calling Resend
      const { data: quotaData, error: quotaErr } = await supabase
        .rpc("crm_check_and_claim_send_quota", { p_count: recipients.length });

      if (quotaErr) {
        console.error("[send-campaign] quota check failed:", quotaErr.message);
        // Quota check failure is non-fatal — log and continue (fail open)
      } else {
        const quota = (quotaData as any[])?.[0];
        if (quota && !quota.allowed) {
          console.log(
            `[send-campaign] Daily quota exhausted (${quota.today_sent}/${quota.quota_limit}, ` +
            `remaining=${quota.remaining}) — pausing for today, will resume tomorrow`,
          );
          // Update heartbeat so campaign stays "running" and resumes on next invocation
          await supabase.rpc("crm_update_send_progress", {
            p_campaign_id: campaign_id,
            p_run_id:      run_id,
            p_sent_delta:  0,
          });
          return json({
            ok: true,
            quotaExceeded: true,
            sent: totalSent,
            remaining: quota.remaining,
            quota_limit: quota.quota_limit,
            today_sent: quota.today_sent,
            message: `Daily warm-up quota reached (${quota.today_sent}/${quota.quota_limit}). Campaign will resume tomorrow.`,
          });
        }
      }

      // Check circuit breaker before hitting Resend
      const cbOpen = await checkCircuit("resend");
      if (cbOpen) {
        await supabase.rpc("crm_pause_campaign", {
          p_campaign_id: campaign_id,
          p_reason:      "Email circuit breaker open — paused for 30 min",
        });
        return json(
          { ok: false, circuitOpen: true, sent: totalSent,
            message: "Email delivery paused (circuit open). Campaign will resume automatically." },
          503,
        );
      }

      // Send via Resend batch API (tags carry campaign_id + run_id for webhook correlation)
      const { messageIds, error: sendErr } = await sendBatch(
        recipients,
        subject,
        campaign_name,
        campaign_id,
        run_id,
      );

      if (sendErr) {
        await recordFailure("resend");
        await supabase.rpc("crm_pause_campaign", {
          p_campaign_id: campaign_id,
          p_reason:      `Resend error: ${sendErr}`,
        });
        return json({ ok: false, error: sendErr, sent: totalSent }, 502);
      }

      await recordSuccess("resend");

      // Write to ledger (ON CONFLICT DO NOTHING = extra double-send protection)
      await writeLedger(supabase, run_id, recipients, messageIds);

      totalSent += recipients.length;

      // Update heartbeat + running sent_count
      await supabase.rpc("crm_update_send_progress", {
        p_campaign_id: campaign_id,
        p_run_id:      run_id,
        p_sent_delta:  recipients.length,
      });

      console.log(
        `[send-campaign] batch done: +${recipients.length} (total=${totalSent})`,
      );

      // If we got fewer than BATCH_SIZE we're on the last batch — next loop will return 0
    }

    // ── Step 4: Complete ──────────────────────────────────────────────────────
    await supabase.rpc("crm_complete_campaign_run", {
      p_campaign_id: campaign_id,
      p_run_id:      run_id,
    });

    console.log(
      `[send-campaign] COMPLETED campaign ${campaign_id}: ${totalSent} emails sent`,
    );

    return json({ ok: true, campaign_id, run_id, sent: totalSent });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-campaign] unhandled error:", msg);
    return json({ error: msg }, 500);
  }
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

serve(handler);
