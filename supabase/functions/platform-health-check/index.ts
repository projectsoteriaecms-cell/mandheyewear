/**
 * platform-health-check
 *
 * Called every 15 minutes by pg_cron via pg_net HTTP POST. Three jobs:
 *   1. Alert check -- error spikes, stuck unverified signups, failed emails.
 *      Sends ONE summary email if anything newly triggered (60min dedup
 *      lives in the platform_check_alerts() RPC, not here).
 *   2. Backfill -- creates a default profile/role row for any auth.users
 *      missing one. Purely additive.
 *   3. Retry -- re-sends failed signup-confirmation emails via
 *      auth.resend() (generates a fresh OTP; capped at 3 attempts / 24h,
 *      enforced by the platform_get_retryable_signup_emails() RPC).
 *
 * Security: X-Cron-Secret header must match CRON_SECRET env var (same
 * secret already used by fire-scheduled-triggers). verify_jwt = false.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL      = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET       = Deno.env.get("CRON_SECRET") ?? "";
const RESEND_API_KEY    = Deno.env.get("RESEND_API_KEY") ?? "";
const ADMIN_ALERT_EMAIL = Deno.env.get("ADMIN_ALERT_EMAIL") ?? "";
const FROM_ADDRESS      = "M&H Eyewear <alerts@soteriaeyeclinic.com>";

interface Alert {
  type: string;
  detail: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const incoming = req.headers.get("x-cron-secret") ?? "";
  if (!CRON_SECRET || incoming !== CRON_SECRET) {
    console.warn("[platform-health-check] Unauthorized: bad or missing X-Cron-Secret");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const summary: Record<string, unknown> = {};

  // 1. Alerts
  try {
    const { data: alerts, error } = await db.rpc("platform_check_alerts");
    if (error) throw error;
    const newAlerts = (alerts ?? []) as Alert[];
    summary.alerts_triggered = newAlerts.length;

    if (newAlerts.length > 0 && ADMIN_ALERT_EMAIL && RESEND_API_KEY) {
      const html = `
        <h2>Platform health alert</h2>
        <ul>${newAlerts.map((a) => `<li><strong>${a.type}</strong>: ${a.detail}</li>`).join("")}</ul>
        <p>Check the observability dashboard for details: /admin/observability</p>
      `;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [ADMIN_ALERT_EMAIL],
          subject: `M&H Eyewear: ${newAlerts.length} platform alert(s)`,
          html,
        }),
      });
      summary.alert_email_sent = res.ok;
      if (!res.ok) console.error("[platform-health-check] alert email send failed", await res.text());
    }
  } catch (err) {
    console.error("[platform-health-check] alert check failed", err);
    summary.alert_check_error = err instanceof Error ? err.message : String(err);
  }

  // 2. Backfill
  try {
    const { data, error } = await db.rpc("platform_backfill_missing_records");
    if (error) throw error;
    summary.backfill = data;
  } catch (err) {
    console.error("[platform-health-check] backfill failed", err);
    summary.backfill_error = err instanceof Error ? err.message : String(err);
  }

  // 3. Retry failed signup emails
  try {
    const { data: retryable, error } = await db.rpc("platform_get_retryable_signup_emails");
    if (error) throw error;
    const rows = (retryable ?? []) as { id: string; recipient_email: string }[];

    let retried = 0;
    let succeeded = 0;
    for (const row of rows) {
      retried++;
      const { error: resendErr } = await db.auth.resend({
        type: "signup",
        email: row.recipient_email,
      });
      await db.rpc("platform_mark_email_retried", {
        p_id: row.id,
        p_success: !resendErr,
        p_error: resendErr?.message ?? null,
      });
      if (!resendErr) succeeded++;
    }
    summary.emails_retried = retried;
    summary.emails_retry_succeeded = succeeded;
  } catch (err) {
    console.error("[platform-health-check] email retry failed", err);
    summary.retry_error = err instanceof Error ? err.message : String(err);
  }

  // Log the run itself so it shows up in the observability activity feed.
  try {
    await db.from("platform_events").insert({
      session_id: "system",
      event_type: "remediation.run",
      severity: "info",
      context: summary,
    });
  } catch {
    // best-effort; never block the response on this
  }

  console.log("[platform-health-check] run summary:", JSON.stringify(summary));

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { "Content-Type": "application/json" },
  });
});
