/**
 * fire-scheduled-triggers
 *
 * Called daily by pg_cron at 08:00 UTC (09:00 WAT) via pg_net HTTP POST.
 * Fires all active daily re-engagement triggers not yet run today,
 * then kicks off send-campaign-batch for each created campaign.
 *
 * Security: X-Cron-Secret header must match CRON_SECRET env var.
 *   Set with: supabase secrets set CRON_SECRET=<random-string>
 *   And in DB:  ALTER DATABASE postgres SET "app.cron_secret" = '<same-string>';
 *
 * verify_jwt = false (not a user request — validated by CRON_SECRET instead).
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL     = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET      = Deno.env.get("CRON_SECRET") ?? "";

interface TriggerResult {
  trigger_id:    string;
  trigger_name:  string;
  contact_count: number;
  campaign_id:   string | null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  // Validate the cron secret — reject anything that doesn't match
  const incoming = req.headers.get("x-cron-secret") ?? "";
  if (!CRON_SECRET || incoming !== CRON_SECRET) {
    console.warn("[fire-scheduled-triggers] Unauthorized: bad or missing X-Cron-Secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // 1. Fire all active daily triggers not yet run today
    const { data: fired, error: fireErr } = await db.rpc("crm_auto_fire_triggers");
    if (fireErr) throw fireErr;

    const results = (fired ?? []) as TriggerResult[];
    console.log(`[fire-scheduled-triggers] Fired ${results.length} trigger(s)`);

    // 2. Kick off send-campaign-batch for each new campaign
    const sendResults: { campaign_id: string; http_status: number }[] = [];

    for (const r of results) {
      if (!r.campaign_id || r.contact_count === 0) continue;

      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/send-campaign-batch`,
        {
          method: "POST",
          headers: {
            "Content-Type":  "application/json",
            "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ campaign_id: r.campaign_id }),
        },
      );

      sendResults.push({ campaign_id: r.campaign_id, http_status: res.status });
      console.log(
        `[fire-scheduled-triggers] send-campaign-batch campaign=${r.campaign_id} status=${res.status}`,
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        triggers_fired:  results.length,
        campaigns_sent:  sendResults.filter(s => s.http_status < 300).length,
        details: results.map(r => ({
          trigger_name:  r.trigger_name,
          contact_count: r.contact_count,
          campaign_id:   r.campaign_id,
          send_status:   sendResults.find(s => s.campaign_id === r.campaign_id)?.http_status ?? null,
        })),
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[fire-scheduled-triggers] Error:", msg);
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
