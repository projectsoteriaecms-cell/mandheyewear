import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
  frameDetails?: FrameDetails;
  tryOnImageBase64?: string;
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

    const { email, frameDetails, tryOnImageBase64 }: TryOnEmailRequest = await req.json();

    // Validate required fields
    if (!email) {
      throw new Error("Email is required");
    }

    const frameName = frameDetails?.name || "Your Frame";
    const framePrice = frameDetails?.price 
      ? `₦${frameDetails.price.toLocaleString()}` 
      : "";
    const frameColor = frameDetails?.color || "";
    const productLink = frameDetails?.id 
      ? `https://soteriaeyeclinic.lovable.app/eyewear/${frameDetails.id}` 
      : "https://soteriaeyeclinic.lovable.app/eyewear";

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
        <h1 style="margin: 0; color: #d4af37; font-size: 24px; font-weight: 600;">Soteria Eye Clinic</h1>
        <p style="margin: 8px 0 0; color: #ffffff; font-size: 14px; opacity: 0.9;">M&H Opticians</p>
      </td>
    </tr>

    <!-- Hero Image (Try-On Result) -->
    ${tryOnImageBase64 ? `
    <tr>
      <td style="padding: 0;">
        <img src="${tryOnImageBase64}" alt="Your Virtual Try-On" style="width: 100%; height: auto; display: block;">
      </td>
    </tr>
    ` : ''}

    <!-- Frame Details -->
    <tr>
      <td style="padding: 30px 20px; text-align: center;">
        <h2 style="margin: 0 0 8px; color: #1a1a2e; font-size: 22px; font-weight: 600;">${frameName}</h2>
        ${frameColor ? `<p style="margin: 0 0 8px; color: #666666; font-size: 14px;">${frameColor}</p>` : ''}
        ${framePrice ? `<p style="margin: 0; color: #d4af37; font-size: 20px; font-weight: 600;">${framePrice}</p>` : ''}
      </td>
    </tr>

    <!-- Primary CTA -->
    <tr>
      <td style="padding: 0 20px 20px; text-align: center;">
        <a href="${productLink}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
          Shop This Frame
        </a>
      </td>
    </tr>

    <!-- Secondary CTA -->
    <tr>
      <td style="padding: 0 20px 30px; text-align: center;">
        <a href="https://soteriaeyeclinic.lovable.app/eyewear" style="display: inline-block; padding: 12px 30px; background-color: #ffffff; color: #1a1a2e; text-decoration: none; font-size: 14px; font-weight: 500; border: 2px solid #1a1a2e; border-radius: 8px;">
          Browse All Frames
        </a>
      </td>
    </tr>

    <!-- Try Another Frame CTA -->
    <tr>
      <td style="padding: 0 20px 30px; text-align: center;">
        <a href="https://soteriaeyeclinic.lovable.app/try-on" style="color: #d4af37; text-decoration: none; font-size: 14px; font-weight: 500;">
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
          <a href="https://soteriaeyeclinic.lovable.app/privacy" style="color: #999999;">Privacy Policy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Soteria Eye Clinic <noreply@notify.mandheyewear.com>",
        to: [email],
        subject: `Your Virtual Try-On: ${frameName} 🕶️`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const emailResponse = await res.json();
    console.log("VTO email sent successfully:", emailResponse);

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
      }
    );
  }
};

serve(handler);
