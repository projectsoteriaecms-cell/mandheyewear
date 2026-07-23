import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  checkCircuit,
  recordFailure,
  recordSuccess,
} from "../_shared/resend-circuit-breaker.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// The try-on-results bucket is private, so the email needs a signed URL. A
// generous TTL: the lead image is retained ~60 days, and an email link should
// keep working for a good while after it lands, not go dead in an hour.
const SIGNED_URL_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface FrameDetails {
  id?: string;
  name?: string;
  color?: string;
  style?: string;
  price?: number;
  sku?: string;
}

interface TryOnEmailRequest {
  email: string;
  fullName?: string | null;
  frameDetails?: FrameDetails;
  /** Storage path in try-on-results. Signed here into the email's <img>. */
  imagePath?: string | null;
  /** Fallback only, used when imagePath is absent (storage upload failed). */
  tryOnImageBase64?: string;
  /** Set by the client when the vto_email_leads DB insert failed (Gap 1). */
  dbInsertFailed?: boolean;
  dbErrorMessage?: string;
}

/** Fire-and-forget Slack alert. Never throws — alert failures must not block the user. */
async function sendSlackAlert(message: string): Promise<void> {
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not configured — alert suppressed:", message);
    return;
  }
  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });
    if (!res.ok) {
      console.error("Slack alert HTTP error:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Slack alert delivery failed:", err);
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const {
      email,
      frameDetails,
      imagePath,
      tryOnImageBase64,
      dbInsertFailed,
      dbErrorMessage,
    }: TryOnEmailRequest = await req.json();

    // Validate required fields
    if (!email) {
      throw new Error("Email is required");
    }

    // Sign the stored result for the email. This is the primary path: a short
    // https link the email client fetches, instead of a giant base64 blob that
    // Gmail clips and renders broken. base64 remains only as a fallback for
    // when no path was provided (storage upload failed on the client).
    let imageUrl: string | null = null;
    if (imagePath) {
      try {
        const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        const { data: signed, error: signErr } = await admin.storage
          .from("try-on-results")
          .createSignedUrl(imagePath, SIGNED_URL_TTL_SECONDS);
        if (signErr) {
          console.error("[send-tryon-result] signing failed:", signErr.message);
        }
        imageUrl = signed?.signedUrl ?? null;
      } catch (err) {
        console.error("[send-tryon-result] signing threw:", err);
      }
    }
    // Fallback to inline base64 only if we could not sign a stored image.
    if (!imageUrl && tryOnImageBase64) {
      imageUrl = tryOnImageBase64;
    }

    // Gap 1 alert: DB insert failed on the client — user still gets their result
    // but we need ops visibility. Fire-and-forget so it never blocks email send.
    if (dbInsertFailed) {
      void sendSlackAlert(
        `🚨 *VTO Lead DB Insert Failed*\n` +
          `• Email: ${email}\n` +
          `• Frame: ${frameDetails?.name ?? "unknown"}\n` +
          `• Error: ${dbErrorMessage ?? "unknown error"}\n` +
          `• Time: ${new Date().toISOString()}\n` +
          `_User received their result but this lead was NOT saved to vto_email_leads._`,
      );
    }

    const frameName = frameDetails?.name || "Your Frame";
    const framePrice = frameDetails?.price
      ? `₦${frameDetails.price.toLocaleString()}`
      : "";
    const frameColor = frameDetails?.color || "";
    // Deep-link to the specific frame's product page. Was pointing at
    // soteriaeyeclinic.lovable.app/eyewear/<id> -- both the wrong (old) domain
    // AND a route that does not exist (the real route is /product/:id), so the
    // "Shop This Frame" button went nowhere. Now the live domain + real route.
    const SITE = "https://mandheyewear.com";
    const productLink = frameDetails?.id
      ? `${SITE}/product/${frameDetails.id}`
      : `${SITE}/shop`;

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Virtual Try-On Result</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header -->
    <tr>
      <td style="padding: 30px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
        <h1 style="margin: 0; color: #d4af37; font-size: 24px; font-weight: 600;">M&H Eyewear</h1>
        <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">Virtual Try-On</p>
      </td>
    </tr>

    <!-- Hero Image (Try-On Result) -->
    ${imageUrl ? `
    <tr>
      <td style="padding: 0;">
        <img src="${imageUrl}" alt="Your Virtual Try-On" style="width: 100%; height: auto; display: block;">
      </td>
    </tr>
    ` : ""}

    <!-- Frame Details -->
    <tr>
      <td style="padding: 30px 20px; text-align: center;">
        <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 22px; font-weight: 600;">${frameName}</h2>
        ${frameColor ? `<p style="margin: 0 0 8px; color: #666666; font-size: 14px;">${frameColor}</p>` : ""}
        ${framePrice ? `<p style="margin: 0; color: #d4af37; font-size: 20px; font-weight: 600;">${framePrice}</p>` : ""}
      </td>
    </tr>

    ${imageUrl ? `
    <!-- Download the clean image -->
    <tr>
      <td style="padding: 0 20px 20px; text-align: center;">
        <a href="${imageUrl}" download="my-tryon.jpg" target="_blank" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
          ⬇ Download Your Try-On
        </a>
        <p style="margin: 10px 0 0; color: #999999; font-size: 12px;">On phone: tap and hold the image above to save it.</p>
      </td>
    </tr>
    ` : ""}

    <!-- Primary CTA -->
    <tr>
      <td style="padding: 0 20px 20px; text-align: center;">
        <a href="${productLink}" style="display: inline-block; padding: 14px 40px; background-color: #ffffff; color: #1a1a2e; text-decoration: none; font-size: 16px; font-weight: 600; border: 2px solid #1a1a2e; border-radius: 8px;">
          Shop This Frame
        </a>
      </td>
    </tr>

    <!-- Secondary CTA -->
    <tr>
      <td style="padding: 0 20px 30px; text-align: center;">
        <a href="${SITE}/shop" style="display: inline-block; padding: 12px 30px; background-color: #ffffff; color: #1a1a2e; text-decoration: none; font-size: 14px; font-weight: 500; border: 2px solid #1a1a2e; border-radius: 8px;">
          Browse All Frames
        </a>
      </td>
    </tr>

    <!-- Try Another Frame CTA -->
    <tr>
      <td style="padding: 0 20px 30px; text-align: center;">
        <a href="${SITE}/try-on" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">
          ✨ Try more frames with Virtual Try-On
        </a>
      </td>
    </tr>

    <!-- Divider -->
    <tr>
      <td style="padding: 0 20px;">
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 0;">
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 30px 20px; text-align: center; background-color: #f9f9f9;">
        <p style="margin: 0 0 16px; color: #666666; font-size: 13px;">
          Visit us at our locations in Lagos and Ibadan
        </p>
        <p style="margin: 0 0 8px; color: #666666; font-size: 12px;">
          📧 info@soteriaeyeclinic.com | 📞 +234 XXX XXX XXXX
        </p>
        <p style="margin: 16px 0 0; color: #999999; font-size: 11px;">
          This email was sent because you requested your virtual try-on result.<br>
          <a href="${SITE}/privacy" style="color: #999999;">Privacy Policy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Circuit breaker check — open after 3 consecutive Resend failures
    const circuit = await checkCircuit("resend");
    if (!circuit.allowed) {
      console.warn("Resend circuit open — rejecting call:", circuit.reason);
      void sendSlackAlert(
        `⚠️ *VTO Email Skipped — Resend Circuit Open*\n` +
          `• Recipient: ${email}\n` +
          `• Reason: ${circuit.reason}\n` +
          `• Time: ${new Date().toISOString()}`,
      );
      return new Response(
        JSON.stringify({ error: circuit.reason, circuitOpen: true }),
        { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } },
      );
    }

    // Send email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // notify.mandheyewear.com was never verified in Resend -- every send
        // failed with a 403 domain_not_found, which is what kept tripping
        // the circuit breaker. mandheyewear.com IS verified (auth-email-hook
        // sends from it successfully), so this now matches that.
        from: "M&H Eyewear <noreply@mandheyewear.com>",
        to: [email],
        subject: `Your Virtual Try-On: ${frameName} 🕶️`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Resend API error:", errorText);
      const { tripped } = await recordFailure("resend");
      if (tripped) {
        void sendSlackAlert(
          `🚨 *Resend Circuit Tripped — VTO Emails Paused*\n` +
            `• 3 consecutive failures — circuit is now OPEN\n` +
            `• Last error: ${errorText}\n` +
            `• Cooldown: 30 minutes\n` +
            `• Time: ${new Date().toISOString()}\n` +
            `_Manually reset: update crm_service_health set state='closed', failure_count=0 where service_name='resend'_`,
        );
      }
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const emailResponse = await res.json();
    console.log("VTO email sent successfully:", emailResponse);
    void recordSuccess("resend");

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-tryon-result function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
};

serve(handler);
