/**
 * resend-webhook
 *
 * T13: Receives Resend event webhooks, verifies the Svix HMAC-SHA256 signature,
 * then calls crm_handle_email_event() which provides:
 *   - Idempotent dedup via UNIQUE(provider_event_id) — safe for at-least-once delivery
 *   - Campaign run counter updates (opened/clicked/bounced)
 *   - Auto-suppression on hard bounce, complaint, or unsubscribe
 *
 * Environment variables required:
 *   RESEND_WEBHOOK_SECRET  — the "whsec_..." signing secret from the Resend dashboard
 *
 * Svix signature algorithm:
 *   signed_content = "{svix-id}.{svix-timestamp}.{raw_body}"
 *   key            = base64_decode(secret.replace("whsec_", ""))
 *   expected_sig   = "v1," + base64_encode(HMAC-SHA256(key, signed_content))
 *   The svix-signature header contains one or more space-separated "v1,<b64>" values.
 *
 * Returns 200 immediately on success or duplicate event (Resend retries on non-2xx).
 * Returns 401 on signature mismatch, 400 on missing headers, 500 on DB error.
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

// ── Svix signature verification ───────────────────────────────────────────────

function base64Decode(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function base64Encode(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}

async function verifySvixSignature(
  rawBody: string,
  headers: Headers,
  secret: string,
): Promise<{ ok: boolean; reason?: string }> {
  const msgId        = headers.get("svix-id");
  const msgTimestamp = headers.get("svix-timestamp");
  const msgSig       = headers.get("svix-signature");

  if (!msgId || !msgTimestamp || !msgSig) {
    return { ok: false, reason: "missing_svix_headers" };
  }

  // Reject timestamps more than 5 minutes old (replay protection)
  const now = Math.floor(Date.now() / 1000);
  const ts  = parseInt(msgTimestamp, 10);
  if (isNaN(ts) || Math.abs(now - ts) > 300) {
    return { ok: false, reason: "stale_timestamp" };
  }

  // Import the key: strip "whsec_" prefix, base64-decode
  const keyBytes = base64Decode(secret.replace(/^whsec_/, ""));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Compute expected signature
  const signedContent  = `${msgId}.${msgTimestamp}.${rawBody}`;
  const sigBytes       = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(signedContent),
  );
  const expectedSig = `v1,${base64Encode(sigBytes)}`;

  // The header may contain multiple space-separated signatures (key rotation)
  const provided = msgSig.split(" ").map((s) => s.trim());
  if (!provided.includes(expectedSig)) {
    return { ok: false, reason: "signature_mismatch" };
  }

  return { ok: true };
}

// ── Resend event payload types ────────────────────────────────────────────────

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    email_id:  string;
    from:      string;
    to:        string[];
    subject:   string;
    click?: { link: string };
    bounce?: { message: string };
    tags?: Record<string, string>;
  };
}

// ── Main handler ──────────────────────────────────────────────────────────────

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  // Only POST is valid for webhooks
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not configured");
    return json({ error: "Webhook secret not configured" }, 500);
  }

  // Read raw body (must be done before any streaming)
  const rawBody = await req.text();

  // ── Verify Svix signature (T13) ───────────────────────────────────────────
  const { ok: sigOk, reason: sigReason } = await verifySvixSignature(
    rawBody,
    req.headers,
    webhookSecret,
  );

  if (!sigOk) {
    console.warn(`[resend-webhook] signature verification failed: ${sigReason}`);
    return json({ error: `Signature invalid: ${sigReason}` }, 401);
  }

  // Parse payload
  let payload: ResendWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const { type, created_at, data } = payload;
  const providerEventId = req.headers.get("svix-id") ?? `${type}-${data?.email_id}-${created_at}`;

  console.log(`[resend-webhook] event=${type} email_id=${data?.email_id} svix_id=${providerEventId}`);

  // ── Call crm_handle_email_event via service-role client ───────────────────
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: result, error: dbErr } = await supabase.rpc(
    "crm_handle_email_event",
    {
      p_provider_event_id: providerEventId,
      p_resend_email_id:   data?.email_id ?? "",
      p_event_type:        type,
      p_occurred_at:       created_at ?? new Date().toISOString(),
      p_link_clicked:      data?.click?.link ?? null,
      p_metadata:          JSON.parse(rawBody),  // store full payload for auditing
    },
  );

  if (dbErr) {
    console.error("[resend-webhook] DB error:", dbErr.message);
    // Return 500 so Resend retries — but avoid infinite retry for unrecoverable errors
    return json({ error: dbErr.message }, 500);
  }

  const outcome = result as any;
  console.log("[resend-webhook] handled:", JSON.stringify(outcome));

  // Always return 200 so Resend does not retry (duplicate detection is DB-side)
  return json({ ok: true, ...outcome });
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

serve(handler);
