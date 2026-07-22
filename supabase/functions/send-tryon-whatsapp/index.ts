/**
 * send-tryon-whatsapp
 *
 * Delivers a virtual try-on result to WhatsApp via Meta's Cloud API (direct --
 * not Twilio).
 *
 * Why this function exists at all: the capture modal has always offered
 * WhatsApp as a contact channel and told the visitor "we'll follow up on
 * WhatsApp with your result", but nothing was ever sent. Those leads got
 * silence.
 *
 * Two constraints shape the implementation.
 *
 * TEMPLATE REQUIRED. Handing over a number on a website is not a
 * user-initiated WhatsApp conversation, so there is no free 24-hour service
 * window -- the first business message MUST be a pre-approved template. The
 * template needs an IMAGE header to carry the try-on result.
 *
 * SERVER-SIDE SIGNING. try-on-results is a private bucket whose read policies
 * admit only staff or the owning signed-in user, so an anonymous visitor
 * cannot sign their own upload (createSignedUrl returns "Object not found").
 * Signing happens here with the service role. Meta fetches the URL itself, so
 * a signed URL works without making the bucket public.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GRAPH_VERSION = "v21.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN") ?? "";
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const TEMPLATE_NAME = Deno.env.get("WHATSAPP_TRYON_TEMPLATE") ?? "tryon_result";
const TEMPLATE_LANG = Deno.env.get("WHATSAPP_TRYON_TEMPLATE_LANG") ?? "en";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Body {
  phone: string;
  /** Storage path in try-on-results. Signed here, never signed on the client. */
  imagePath?: string | null;
  frameName?: string | null;
  fullName?: string | null;
  leadId?: string | null;
}

/**
 * Meta wants a bare international number: digits only, country code, no '+'.
 * Nigerian numbers are commonly entered as 080..., which is the local form of
 * +23480... -- passing that through unmodified silently fails to deliver.
 */
export function normalizeNigerianPhone(raw: string): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("234")) return digits.length >= 13 ? digits : null;
  // Local trunk form: 0803... -> 234803...
  if (digits.startsWith("0")) {
    const rest = digits.slice(1);
    return rest.length >= 10 ? `234${rest}` : null;
  }
  // Already trunk-less: 803... -> 234803...
  if (digits.length >= 10) return `234${digits}`;
  return null;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      // Config gap, not a caller error -- surfaced clearly so a missing secret
      // is obvious in logs rather than looking like a delivery failure.
      console.error("[send-tryon-whatsapp] WhatsApp credentials not configured");
      return json({ error: "WhatsApp is not configured" }, 503);
    }

    const { phone, imagePath, frameName, fullName, leadId }: Body = await req.json();

    const to = normalizeNigerianPhone(phone);
    if (!to) return json({ error: "A valid phone number is required" }, 400);

    // Sign the stored result for Meta to fetch.
    let imageUrl: string | null = null;
    if (imagePath) {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      const { data: signed, error: signErr } = await admin.storage
        .from("try-on-results")
        // 24h: Meta fetches within seconds, but a retry on their side should
        // not hit a dead link.
        .createSignedUrl(imagePath, 24 * 60 * 60);
      if (signErr) {
        console.error("[send-tryon-whatsapp] signing failed:", signErr.message);
      }
      imageUrl = signed?.signedUrl ?? null;
    }

    if (!imageUrl) {
      // The whole point is delivering the picture; a text-only fallback would
      // burn a paid conversation to send nothing of value.
      return json({ error: "No try-on image available to send" }, 422);
    }

    const components = [
      {
        type: "header",
        parameters: [{ type: "image", image: { link: imageUrl } }],
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: (fullName || "there").slice(0, 60) },
          { type: "text", text: (frameName || "your frame").slice(0, 60) },
        ],
      },
    ];

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: TEMPLATE_NAME,
            language: { code: TEMPLATE_LANG },
            components,
          },
        }),
      },
    );

    const payload = await res.json().catch(() => ({}));

    if (!res.ok) {
      const detail = payload?.error?.message ?? `HTTP ${res.status}`;
      console.error("[send-tryon-whatsapp] Meta send failed:", JSON.stringify(payload));
      return json({ error: `WhatsApp send failed: ${detail}` }, 502);
    }

    const messageId = payload?.messages?.[0]?.id ?? null;
    console.log("[send-tryon-whatsapp] sent", { to, messageId, leadId });

    // Best-effort observability: the send is already done, so a logging
    // failure must not turn a delivered message into a reported error.
    try {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
      await admin.from("platform_events").insert({
        session_id: "system",
        event_type: "tryon.whatsapp_sent",
        severity: "info",
        context: { leadId, frameName, messageId, provider: "meta_cloud_api" },
      });
    } catch (err) {
      console.error("[send-tryon-whatsapp] event log failed:", err);
    }

    return json({ success: true, messageId });
  } catch (error) {
    console.error("[send-tryon-whatsapp] unexpected error:", error);
    return json(
      { error: error instanceof Error ? error.message : "Unexpected error" },
      500,
    );
  }
});
