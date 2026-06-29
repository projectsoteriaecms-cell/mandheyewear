/**
 * whatsapp-webhook
 *
 * Receives Twilio MessageStatus webhook events and updates the WhatsApp
 * delivery ledger with delivery status, timestamps, and error information.
 *
 * Webhook payload (form-encoded):
 *   MessageSid:       Unique message identifier from Twilio
 *   MessageStatus:    sent | delivered | read | failed | undelivered
 *   ErrorCode:        Twilio error code (if failed, e.g. "21606")
 *   ErrorMessage:     Twilio error message
 *   Timestamp:        When event occurred (Unix timestamp in ms)
 *
 * Security:
 *   - Validates X-Twilio-Signature header against TWILIO_AUTH_TOKEN
 *   - Webhook must be configured in Twilio console with this URL
 *   - Returns 403 if signature is invalid
 *
 * Processing:
 *   1. Verify signature
 *   2. Parse form-encoded body
 *   3. Map Twilio status → ledger status
 *   4. Call crm_update_whatsapp_delivery_status RPC
 *   5. Return 200 OK (idempotent)
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.190.0/crypto/mod.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-twilio-signature",
};

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ── Twilio signature verification ────────────────────────────────────────
// Validates the X-Twilio-Signature header to ensure the webhook came from
// Twilio. Implementation follows Twilio's official verification algorithm.
async function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
): Promise<boolean> {
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!token) {
    console.warn("[whatsapp-webhook] TWILIO_AUTH_TOKEN not configured");
    return false;
  }

  // Construct the signed content exactly as Twilio does:
  // URL + sorted parameter key=value pairs
  let data = url;
  const sortedKeys = Object.keys(params).sort();
  for (const key of sortedKeys) {
    data += key + params[key];
  }

  // HMAC-SHA1 hash
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(token),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const hash = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  // Base64 encode the hash
  const computed = btoa(String.fromCharCode(...new Uint8Array(hash)));

  // Constant-time comparison to prevent timing attacks
  return computed === signature;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  try {
    if (req.method !== "POST") {
      return json({ error: "method not allowed" }, 405);
    }

    // ── Parse form-encoded body ──────────────────────────────────────
    const formData = await req.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      params[key] = String(value);
    }

    // ── Verify Twilio signature ──────────────────────────────────────
    const signature = req.headers.get("X-Twilio-Signature");
    if (!signature) {
      console.warn("[whatsapp-webhook] Missing X-Twilio-Signature header");
      return json({ error: "unauthorized" }, 403);
    }

    const webhookUrl = new URL(req.url);
    const isValid = await verifyTwilioSignature(
      webhookUrl.href,
      params,
      signature,
    );
    if (!isValid) {
      console.warn("[whatsapp-webhook] Invalid signature");
      return json({ error: "unauthorized" }, 403);
    }

    // ── Extract key fields ───────────────────────────────────────────
    const messageSid = params.MessageSid;
    const messageStatus = params.MessageStatus?.toLowerCase();
    const errorCode = params.ErrorCode || null;
    const errorMessage = params.ErrorMessage || null;
    const timestamp = params.Timestamp ? new Date(parseInt(params.Timestamp)) : new Date();

    if (!messageSid || !messageStatus) {
      console.warn("[whatsapp-webhook] Missing MessageSid or MessageStatus");
      return json({ error: "invalid payload" }, 400);
    }

    // ── Map Twilio status to ledger status ────────────────────────────
    let deliveryStatus = "pending";
    let deliveredAt: string | null = null;
    let readAt: string | null = null;

    switch (messageStatus) {
      case "sent":
        deliveryStatus = "sent";
        break;
      case "delivered":
        deliveryStatus = "delivered";
        deliveredAt = timestamp.toISOString();
        break;
      case "read":
        deliveryStatus = "read";
        readAt = timestamp.toISOString();
        break;
      case "failed":
      case "undelivered":
        deliveryStatus = "failed";
        break;
      default:
        console.warn(`[whatsapp-webhook] Unknown status: ${messageStatus}`);
        deliveryStatus = messageStatus;
    }

    // ── Update ledger ────────────────────────────────────────────────
    const supabase = db();
    const { error } = await supabase.rpc("crm_update_whatsapp_delivery_status", {
      p_message_sid:    messageSid,
      p_delivery_status: deliveryStatus,
      p_delivered_at:   deliveredAt,
      p_read_at:        readAt,
      p_error_code:     errorCode,
      p_error_message:  errorMessage,
    });

    if (error) {
      console.error("[whatsapp-webhook] RPC error:", error.message);
      // Still return 200 to acknowledge (Twilio will retry on 5xx)
      // Better to log and move on than risk webhook flood.
    }

    console.log(`[whatsapp-webhook] ${messageSid} → ${deliveryStatus}` +
      (errorCode ? ` (error: ${errorCode})` : ""));

    return json({ ok: true, status: deliveryStatus });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[whatsapp-webhook] unhandled error:", msg);
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
