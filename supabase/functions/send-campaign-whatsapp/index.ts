/**
 * send-campaign-whatsapp
 *
 * T20: Optional per-campaign WhatsApp channel via Twilio.
 *
 * A campaign with whatsapp_enabled=true delivers its whatsapp_body to every
 * segment member that has a phone number AND holds a WhatsApp opt-in —
 * in PARALLEL with the email send, not as a bounce fallback.
 * Fully decoupled from the email state machine: its own ledger
 * (crm_campaign_whatsapp_ledger) is the double-send guard and its own
 * counters live on crm_campaigns.
 *
 * Opt-in gating: a recipient must hold EITHER newsletter subscription (the
 * email-keyed opt-in) OR whatsapp_opted_in — WhatsApp-channel marketing consent
 * captured at the try-on gate (marketing_consent AND consent_channel='whatsapp').
 * Phone-only leads have no email, so newsletter subscription is impossible for
 * them and the WhatsApp consent is their only valid basis. Recipients holding
 * neither are recorded as "no whatsapp opt-in" and skipped.
 *
 * POST body:
 *   { campaign_id: string }   — required (explicit trigger from admin UI)
 *
 * Flow per invocation:
 *   0. Global kill switch (crm_service_health 'crm_bulk_send' state='open' → 503)
 *   1. Read WhatsApp config. If !whatsapp_enabled → no-op {skipped}.
 *   2. If Twilio not configured → no-op {whatsappDisabled} (channel ships dark).
 *   3. Loop until no unsent phones remain:
 *        a. crm_get_unsent_whatsapp_batch(campaign_id, rules, N)
 *        b. For each recipient:
 *           - GATE: skip if !is_newsletter_subscriber && !whatsapp_opted_in
 *           - send via Twilio Messages API (sequential)
 *           - INSERT ledger rows (sent/failed/skipped) ON CONFLICT DO NOTHING
 *        c. bump whatsapp_sent_count / whatsapp_failed_count + heartbeat
 *   4. crm_complete_whatsapp()
 *
 * Resumable: ledger NOT IN means a crashed/re-invoked run never re-sends.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BATCH_SIZE = 50;

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

interface WaConfig {
  campaign_id:      string;
  campaign_name:    string;
  whatsapp_enabled: boolean;
  whatsapp_body:    string | null;
  content_sid:      string | null;
  rules_json:       unknown;
}

interface WaRecipient {
  phone:                    string;
  full_name:                string | null;
  is_newsletter_subscriber: boolean;
  /** WhatsApp-channel marketing consent captured at the try-on gate
   *  (marketing_consent AND consent_channel='whatsapp'). The opt-in basis for
   *  phone-only leads, who can never be newsletter subscribers. */
  whatsapp_opted_in:        boolean;
}

interface SendOutcome {
  phone:    string;
  sid:      string | null;
  ok:       boolean;
  error:    string | null;
}

// ── Phone normalization (Nigeria-first, best effort) ───────────────────────────
// Returns E.164 without the whatsapp: prefix, or null if it can't be salvaged.
function normalizePhone(raw: string): string | null {
  let s = raw.trim().replace(/[^\d+]/g, "");
  if (!s) return null;
  if (s.startsWith("+")) return s.length >= 8 ? s : null;
  if (s.startsWith("00")) s = s.slice(2);
  if (s.startsWith("234")) return `+${s}`;
  if (s.startsWith("0")) return `+234${s.slice(1)}`;       // local NG → +234
  if (s.length === 10) return `+234${s}`;                   // bare NG subscriber number
  return `+${s}`;                                           // assume already country-prefixed
}

// ── Twilio config ──────────────────────────────────────────────────────────────
function twilioConfig() {
  const sid   = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  const from  = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. "whatsapp:+14155238886"
  if (!sid || !token || !from) return null;
  return { sid, token, from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}` };
}

// ── Personalize body ───────────────────────────────────────────────────────────
function renderBody(body: string, r: WaRecipient): string {
  const name = r.full_name?.split(" ")[0] ?? "there";
  return body.replace(/\{\{\s*name\s*\}\}/gi, name);
}

// ── Send one WhatsApp message via Twilio ───────────────────────────────────────
async function sendOne(
  cfg: NonNullable<ReturnType<typeof twilioConfig>>,
  to: string,
  body: string,
  contentSid: string | null,
): Promise<{ sid: string | null; error: string | null }> {
  const form = new URLSearchParams();
  form.set("From", cfg.from);
  form.set("To", `whatsapp:${to}`);
  // A pre-approved Content template (required outside the 24h session window)
  // takes precedence; otherwise send a freeform body (sandbox / in-session).
  if (contentSid) form.set("ContentSid", contentSid);
  else form.set("Body", body);

  const auth = btoa(`${cfg.sid}:${cfg.token}`);
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${cfg.sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type":  "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    },
  );

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return { sid: null, error: `Twilio ${res.status}: ${txt.slice(0, 180)}` };
  }
  const json = await res.json() as { sid?: string };
  return { sid: json.sid ?? null, error: null };
}

// ── Write ledger batch ─────────────────────────────────────────────────────────
async function writeLedger(
  supabase: ReturnType<typeof db>,
  campaignId: string,
  outcomes: SendOutcome[],
): Promise<void> {
  if (outcomes.length === 0) return;
  const rows = outcomes.map((o) => ({
    campaign_id:        campaignId,
    contact_phone:      o.phone,
    twilio_message_sid: o.sid,
    status:             o.ok ? "sent" : "failed",
    error_message:      o.error,
  }));

  const { error } = await supabase
    .from("crm_campaign_whatsapp_ledger")
    .upsert(rows, { onConflict: "campaign_id,contact_phone", ignoreDuplicates: true });

  if (error && !error.message.includes("duplicate")) {
    console.error("[send-wa] ledger insert error:", error.message);
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  const supabase = db();

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const campaignId: string | undefined = body.campaign_id;
    if (!campaignId) return json({ error: "campaign_id is required" }, 400);

    // ── Step 0: global kill switch (shared with email bulk send) ──────────────
    const { data: killRow } = await supabase
      .from("crm_service_health")
      .select("state")
      .eq("service_name", "crm_bulk_send")
      .maybeSingle();

    if (killRow?.state === "open") {
      return json({
        ok: false,
        globalKillActive: true,
        message: "Global CRM kill switch is active — all bulk sends halted",
      }, 503);
    }

    // ── Step 1: read config ───────────────────────────────────────────────────
    const { data: cfgRows, error: cfgErr } = await supabase
      .rpc("crm_whatsapp_campaign_config", { p_campaign_id: campaignId });

    if (cfgErr) return json({ error: `Config load failed: ${cfgErr.message}` }, 500);
    const cfg = (cfgRows as WaConfig[] | null)?.[0];
    if (!cfg) return json({ ok: true, message: "Campaign not found" });

    if (!cfg.whatsapp_enabled) {
      return json({ ok: true, skipped: true, message: "WhatsApp channel not enabled for this campaign" });
    }

    if (!cfg.whatsapp_body && !cfg.content_sid) {
      return json({ ok: false, error: "WhatsApp enabled but no body or content template configured" }, 422);
    }

    // ── Step 2: optional channel — no-op if Twilio not configured ─────────────
    const twilio = twilioConfig();
    if (!twilio) {
      console.warn("[send-wa] Twilio env not configured — channel disabled");
      return json({
        ok: true,
        whatsappDisabled: true,
        message: "WhatsApp channel is enabled on the campaign but Twilio is not configured on this environment.",
      });
    }

    const messageBody = cfg.whatsapp_body ?? "";
    let totalSent = 0;
    let totalFailed = 0;

    // ── Step 3: batch loop ────────────────────────────────────────────────────
    for (;;) {
      const { data: batch, error: batchErr } = await supabase
        .rpc("crm_get_unsent_whatsapp_batch", {
          p_campaign_id: campaignId,
          p_rules_json:  cfg.rules_json,
          p_batch_size:  BATCH_SIZE,
        });

      if (batchErr) {
        return json({ ok: false, error: batchErr.message, sent: totalSent, failed: totalFailed }, 500);
      }

      const recipients = (batch ?? []) as WaRecipient[];
      if (recipients.length === 0) break;

      const outcomes: SendOutcome[] = [];
      for (const r of recipients) {
        // Gate: require a real opt-in on SOME channel. Newsletter subscription
        // is email-keyed, so a phone-only WhatsApp lead can never satisfy it --
        // for them the opt-in basis is WhatsApp-channel marketing consent given
        // at the try-on gate. Either one is a genuine, auditable consent record;
        // contacts with neither are still skipped.
        if (!r.is_newsletter_subscriber && !r.whatsapp_opted_in) {
          // Record as skipped so we don't reconsider this contact every run.
          outcomes.push({ phone: r.phone, sid: null, ok: false, error: "no whatsapp opt-in" });
          continue;
        }

        const normalized = normalizePhone(r.phone);
        if (!normalized) {
          // Record as failed so we don't reconsider this phone every run.
          outcomes.push({ phone: r.phone, sid: null, ok: false, error: "unparseable phone number" });
          continue;
        }
        const { sid, error } = await sendOne(
          twilio,
          normalized,
          renderBody(messageBody, r),
          cfg.content_sid,
        );
        // Ledger keyed by the ORIGINAL phone (matches segment eval output) so the
        // NOT IN resume filter works; normalized form goes to Twilio only.
        outcomes.push({ phone: r.phone, sid, ok: !error, error });
      }

      await writeLedger(supabase, campaignId, outcomes);

      const sent   = outcomes.filter((o) => o.ok).length;
      const failed = outcomes.length - sent;
      totalSent   += sent;
      totalFailed += failed;

      await supabase.rpc("crm_update_whatsapp_progress", {
        p_campaign_id:  campaignId,
        p_sent_delta:   sent,
        p_failed_delta: failed,
      });

      console.log(`[send-wa] batch: +${sent} sent, +${failed} failed (total ${totalSent}/${totalSent + totalFailed})`);
    }

    // ── Step 4: complete ──────────────────────────────────────────────────────
    await supabase.rpc("crm_complete_whatsapp", { p_campaign_id: campaignId });

    console.log(`[send-wa] COMPLETED ${campaignId}: ${totalSent} sent, ${totalFailed} failed`);
    return json({ ok: true, campaign_id: campaignId, sent: totalSent, failed: totalFailed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[send-wa] unhandled error:", msg);
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
