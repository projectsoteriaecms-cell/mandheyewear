import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// React Email components via CDN
const REACT_EMAIL_URL = "https://cdn.jsdelivr.net/npm/@react-email/render@0.0.12";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("CAMPAIGN_FROM_EMAIL") || "M&H Eyewear <campaigns@mandheyewear.com>";

// Brand colors matching M&H
const BRAND_COLORS = {
  primary: "#0F1B2E",      // Navy blue
  accent: "#D4AF37",       // Gold
  text: "#333333",
  lightText: "#666666",
  background: "#F5F5F5",
  white: "#FFFFFF",
};

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function buildCampaignEmailHtml(
  campaignName: string,
  subject: string,
  recipientEmail: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: ${BRAND_COLORS.text};
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${BRAND_COLORS.background};
          padding: 20px 0;
        }
        .header {
          background-color: ${BRAND_COLORS.primary};
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          color: ${BRAND_COLORS.accent};
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .logo-subtitle {
          color: ${BRAND_COLORS.accent};
          font-size: 14px;
          letter-spacing: 2px;
        }
        .content {
          background-color: ${BRAND_COLORS.white};
          padding: 40px 20px;
        }
        .hero {
          background-color: ${BRAND_COLORS.primary};
          color: ${BRAND_COLORS.accent};
          padding: 30px 20px;
          text-align: center;
          margin-bottom: 30px;
        }
        .hero-title {
          font-size: 28px;
          font-weight: bold;
          margin: 0;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: ${BRAND_COLORS.accent};
          margin-bottom: 15px;
        }
        .greeting {
          font-size: 16px;
          font-weight: bold;
          color: ${BRAND_COLORS.text};
          margin-bottom: 15px;
        }
        .body-text {
          font-size: 15px;
          color: ${BRAND_COLORS.text};
          line-height: 1.6;
          margin-bottom: 15px;
        }
        .cta-button {
          display: inline-block;
          background-color: ${BRAND_COLORS.accent};
          color: ${BRAND_COLORS.primary};
          padding: 14px 40px;
          font-size: 16px;
          font-weight: bold;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .benefits {
          background-color: ${BRAND_COLORS.background};
          padding: 30px 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: center;
        }
        .benefit-item {
          padding: 15px;
        }
        .benefit-icon {
          font-size: 32px;
          display: block;
          margin-bottom: 10px;
        }
        .benefit-title {
          font-size: 16px;
          font-weight: bold;
          color: ${BRAND_COLORS.accent};
          margin-bottom: 8px;
        }
        .benefit-text {
          font-size: 13px;
          color: ${BRAND_COLORS.lightText};
        }
        .footer {
          background-color: ${BRAND_COLORS.primary};
          padding: 30px 20px;
          text-align: center;
          color: ${BRAND_COLORS.accent};
          font-size: 12px;
        }
        .footer-links {
          margin-top: 10px;
        }
        .footer-links a {
          color: ${BRAND_COLORS.accent};
          text-decoration: none;
          margin: 0 10px;
        }
        .test-badge {
          display: inline-block;
          background-color: #4CAF50;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        @media (max-width: 600px) {
          .benefits {
            grid-template-columns: 1fr;
          }
          .hero-title {
            font-size: 20px;
          }
          .logo {
            font-size: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="logo">👁️ M&H</div>
          <div class="logo-subtitle">EYEWEAR & OPTICALS</div>
        </div>

        <!-- Hero Section -->
        <div class="hero">
          <h1 class="hero-title">Test Email - Campaign Preview</h1>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Test Badge -->
          <div style="text-align: center;">
            <span class="test-badge">✓ TEST EMAIL</span>
          </div>

          <!-- Greeting -->
          <div class="section">
            <p class="greeting">Hello,</p>
            <p class="body-text">
              This is a test preview of your campaign: <strong>"${campaignName}"</strong>
            </p>
          </div>

          <!-- Campaign Info -->
          <div class="section">
            <h2 class="section-title">${subject || "Campaign Preview"}</h2>
            <p class="body-text">
              If you're seeing this email, it means your campaign is ready to send!
              The email delivery system is working perfectly.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center;">
            <a href="https://mandheyewear.com" class="cta-button">Visit Our Website</a>
          </div>

          <!-- Benefits -->
          <div class="benefits">
            <div class="benefit-item">
              <span class="benefit-icon">👓</span>
              <div class="benefit-title">Premium Frames</div>
              <div class="benefit-text">Designer eyewear curated for style</div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">👁️</span>
              <div class="benefit-title">Expert Care</div>
              <div class="benefit-text">Professional eye care services</div>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">✨</span>
              <div class="benefit-title">Quality Service</div>
              <div class="benefit-text">Excellence in every interaction</div>
            </div>
          </div>

          <!-- Closing -->
          <div class="section" style="padding-top: 20px; text-align: center;">
            <p class="body-text">
              Best regards,<br>
              <strong style="color: ${BRAND_COLORS.accent};">M&H Eyewear & Opticals Team</strong>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p style="margin-bottom: 10px;">© 2026 M&H Eyewear & Opticals. All rights reserved.</p>
          <div class="footer-links">
            <a href="https://mandheyewear.com">Website</a> •
            <a href="mailto:contact@mandheyewear.com">Contact</a> •
            <a href="https://mandheyewear.com/unsubscribe">Unsubscribe</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS });
  }

  try {
    const { campaign_id, test_email } = await req.json();

    if (!campaign_id || !test_email) {
      return new Response(
        JSON.stringify({ error: "campaign_id and test_email are required" }),
        { status: 400, headers: CORS }
      );
    }

    const supabase = db();

    // Fetch campaign
    const { data: campaign, error: campError } = await supabase
      .from("crm_campaigns")
      .select("id, name, subject_line, template_id")
      .eq("id", campaign_id)
      .single();

    if (campError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: CORS }
      );
    }

    // Send via Resend
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: CORS }
      );
    }

    const emailHtml = buildCampaignEmailHtml(
      campaign.name,
      campaign.subject_line || "Campaign Test",
      test_email
    );

    const emailResponse = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          from: FROM_EMAIL,
          to: [test_email],
          subject: campaign.subject_line || "M&H Eyewear - Test Email",
          html: emailHtml,
          text: `Test email for campaign: ${campaign.name}. If you're seeing this, the email delivery system is working!`,
          tags: [
            { name: "campaign_id", value: campaign_id },
            { name: "is_test", value: "true" },
            { name: "campaign_name", value: campaign.name },
          ],
        },
      ]),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend error:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send email via Resend", details: errorData }),
        { status: 500, headers: CORS }
      );
    }

    const resendData = await emailResponse.json();

    // Log to audit trail
    const { error: auditError } = await supabase
      .from("campaign_send_audit")
      .insert({
        campaign_id,
        recipient_email: test_email.toLowerCase().trim(),
        subject_line: campaign.subject_line,
        template_id: campaign.template_id,
        had_marketing_consent: true,
        is_test_send: true,
        sent_at: new Date().toISOString(),
      });

    if (auditError) {
      console.error("Audit log error:", auditError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Test email sent to ${test_email}`,
        campaign_id,
        test_email,
        resend_data: resendData,
      }),
      { status: 200, headers: CORS }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: CORS }
    );
  }
});
