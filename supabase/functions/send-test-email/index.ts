import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("CAMPAIGN_FROM_EMAIL") || "M&H Eyewear <campaigns@mandheyewear.com>";

// M&H Logo - using a CDN-hosted version (update with your actual URL)
const LOGO_URL = "https://soteriaeyeclinic.vercel.app/mh-logo.png";

// Brand colors matching M&H
const BRAND_COLORS = {
  primary: "#0F1B2E",      // Navy blue
  accent: "#D4AF37",       // Gold
  text: "#2C2C2C",
  lightText: "#666666",
  background: "#F8F8F8",
  white: "#FFFFFF",
  lightGold: "rgba(212, 175, 55, 0.1)",
};

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function sanitizeTagValue(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .substring(0, 100);
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
      <title>${subject || "Campaign from M&H Eyewear & Opticals"}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
          line-height: 1.6;
          color: ${BRAND_COLORS.text};
          background-color: ${BRAND_COLORS.background};
        }
        .email-wrapper {
          background-color: ${BRAND_COLORS.background};
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: ${BRAND_COLORS.white};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        /* Header Section */
        .header {
          background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primary}dd 100%);
          padding: 40px 30px;
          text-align: center;
          border-bottom: 4px solid ${BRAND_COLORS.accent};
        }
        .logo-img {
          max-width: 280px;
          height: auto;
          margin-bottom: 20px;
          display: block;
        }
        .header-tagline {
          color: ${BRAND_COLORS.accent};
          font-size: 14px;
          letter-spacing: 2px;
          font-weight: 500;
          margin-top: 15px;
        }

        /* Content Area */
        .content {
          padding: 40px 30px;
        }

        /* Test Badge */
        .test-badge {
          display: inline-block;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          margin-bottom: 25px;
        }

        /* Greeting */
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: ${BRAND_COLORS.text};
          margin-bottom: 15px;
        }

        /* Body Text */
        .body-text {
          font-size: 15px;
          color: ${BRAND_COLORS.lightText};
          line-height: 1.8;
          margin-bottom: 20px;
        }

        /* Section Title */
        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: ${BRAND_COLORS.primary};
          margin: 30px 0 15px 0;
          border-left: 4px solid ${BRAND_COLORS.accent};
          padding-left: 15px;
        }

        /* Call to Action */
        .cta-section {
          text-align: center;
          margin: 35px 0;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, #c9a227 100%);
          color: ${BRAND_COLORS.primary};
          padding: 14px 45px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
        }

        /* Benefits Section */
        .benefits {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 35px 0;
          padding: 30px;
          background: ${BRAND_COLORS.lightGold};
          border-radius: 8px;
        }
        .benefit-item {
          text-align: center;
        }
        .benefit-icon {
          font-size: 36px;
          display: block;
          margin-bottom: 12px;
        }
        .benefit-title {
          font-size: 15px;
          font-weight: 700;
          color: ${BRAND_COLORS.primary};
          margin-bottom: 8px;
        }
        .benefit-text {
          font-size: 13px;
          color: ${BRAND_COLORS.lightText};
          line-height: 1.5;
        }

        /* Divider */
        .divider {
          border: 0;
          border-top: 2px solid ${BRAND_COLORS.lightGold};
          margin: 30px 0;
        }

        /* Footer */
        .footer {
          background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primary}dd 100%);
          padding: 35px 30px;
          text-align: center;
          color: ${BRAND_COLORS.accent};
          border-top: 4px solid ${BRAND_COLORS.accent};
        }
        .footer-text {
          font-size: 13px;
          line-height: 1.8;
          margin-bottom: 15px;
        }
        .footer-links {
          font-size: 12px;
        }
        .footer-links a {
          color: ${BRAND_COLORS.accent};
          text-decoration: none;
          margin: 0 8px;
          transition: opacity 0.2s;
        }
        .footer-links a:hover {
          opacity: 0.8;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .container {
            border-radius: 0;
          }
          .header {
            padding: 30px 20px;
          }
          .content {
            padding: 30px 20px;
          }
          .benefits {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 15px;
          }
          .section-title {
            font-size: 18px;
          }
          .logo-img {
            max-width: 200px;
          }
          .cta-button {
            font-size: 14px;
            padding: 12px 35px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <!-- Header with Logo -->
          <div class="header">
            <img src="${LOGO_URL}" alt="M&H Eyewear & Opticals" class="logo-img" style="width: 280px; max-width: 100%;">
            <div class="header-tagline">PREMIUM EYE CARE & DESIGNER FRAMES</div>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Test Badge -->
            <div>
              <span class="test-badge">✓ TEST EMAIL PREVIEW</span>
            </div>

            <!-- Greeting -->
            <p class="greeting">Hello,</p>
            <p class="body-text">
              This is a preview of your campaign: <strong>"${campaignName}"</strong>. If you're seeing this, your email delivery system is working perfectly!
            </p>

            <!-- Campaign Title -->
            <h2 class="section-title">${subject || "Campaign Preview"}</h2>

            <!-- Campaign Description -->
            <p class="body-text">
              This test email demonstrates the professional M&H Eyewear & Opticals brand template that will be used for all your campaigns. The template is fully responsive and optimized for all devices and email clients.
            </p>

            <!-- CTA Button -->
            <div class="cta-section">
              <a href="https://mandheyewear.com" class="cta-button">Explore Our Collection</a>
            </div>

            <!-- Benefits -->
            <div class="benefits">
              <div class="benefit-item">
                <span class="benefit-icon">👓</span>
                <div class="benefit-title">Premium Frames</div>
                <div class="benefit-text">Designer eyewear for every style</div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">👁️</span>
                <div class="benefit-title">Expert Care</div>
                <div class="benefit-text">Professional optometric services</div>
              </div>
              <div class="benefit-item">
                <span class="benefit-icon">✨</span>
                <div class="benefit-title">Quality Service</div>
                <div class="benefit-text">Excellence in everything we do</div>
              </div>
            </div>

            <!-- Divider -->
            <hr class="divider">

            <!-- Closing -->
            <p class="body-text" style="text-align: center; font-weight: 500; color: ${BRAND_COLORS.text};">
              Thank you for choosing M&H Eyewear & Opticals<br>
              <span style="color: ${BRAND_COLORS.accent}; font-size: 14px;">Your Vision, Our Mission</span>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              © 2026 M&H Eyewear & Opticals. All rights reserved.
            </p>
            <div class="footer-links">
              <a href="https://mandheyewear.com">Website</a> •
              <a href="https://mandheyewear.com/locations">Store Locator</a> •
              <a href="https://mandheyewear.com/contact">Contact</a> •
              <a href="https://mandheyewear.com/unsubscribe">Unsubscribe</a>
            </div>
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
            { name: "campaign_name", value: sanitizeTagValue(campaign.name) },
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
