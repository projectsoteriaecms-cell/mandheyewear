import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("CAMPAIGN_FROM_EMAIL") || "M&H Eyewear <offers@mandheyewear.com>";
const LOGO_URL = "https://soteriaeyeclinic.vercel.app/mh-logo.png";

const BRAND_COLORS = {
  primary: "#0F1B2E",
  accent: "#D4AF37",
  text: "#2C2C2C",
  lightText: "#666666",
  background: "#F8F8F8",
  white: "#FFFFFF",
  lightGold: "rgba(212, 175, 55, 0.1)",
};

interface PromotionRequest {
  recipient_email: string;
  recipient_name?: string;
  promotion_title: string;
  promotion_description: string;
  discount_percentage?: string;
  offer_code?: string;
  valid_until: string;
  cta_link: string;
  cta_text?: string;
  hero_image?: string;
}

function buildPromotionEmailHtml(data: PromotionRequest): string {
  const discountBadge = data.discount_percentage
    ? `<div style="background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%); color: white; padding: 15px 30px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: 700;">
        ${data.discount_percentage}% OFF
      </div>`
    : '';

  const offerCode = data.offer_code
    ? `<div style="background: ${BRAND_COLORS.lightGold}; border: 2px dashed ${BRAND_COLORS.accent}; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
        <p style="font-size: 13px; color: ${BRAND_COLORS.lightText}; margin-bottom: 10px;">Use Code</p>
        <p style="font-size: 20px; font-weight: 700; color: ${BRAND_COLORS.accent}; letter-spacing: 2px;">${data.offer_code}</p>
      </div>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${data.promotion_title} - Special Offer</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
        .header {
          background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.primary}dd 100%);
          padding: 40px 30px;
          text-align: center;
          border-bottom: 4px solid ${BRAND_COLORS.accent};
        }
        .logo-img {
          max-width: 280px;
          height: auto;
          margin-bottom: 10px;
        }
        .promo-badge {
          display: inline-block;
          background: linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%);
          color: white;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          margin-top: 15px;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: ${BRAND_COLORS.text};
          margin-bottom: 15px;
        }
        .body-text {
          font-size: 15px;
          color: ${BRAND_COLORS.lightText};
          line-height: 1.8;
          margin-bottom: 20px;
        }
        .hero-image {
          width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
          display: block;
        }
        .promotion-title {
          font-size: 26px;
          font-weight: 700;
          color: ${BRAND_COLORS.primary};
          margin: 25px 0 15px 0;
          text-align: center;
        }
        .promotion-description {
          font-size: 15px;
          color: ${BRAND_COLORS.text};
          line-height: 1.8;
          margin-bottom: 20px;
          text-align: center;
        }
        .validity {
          background: #E8F5E9;
          border-left: 4px solid #4CAF50;
          padding: 15px 20px;
          border-radius: 6px;
          margin: 20px 0;
        }
        .validity-text {
          font-size: 13px;
          color: #2E7D32;
          font-weight: 500;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, #c9a227 100%);
          color: ${BRAND_COLORS.primary};
          padding: 16px 50px;
          font-size: 16px;
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
        .cta-section {
          text-align: center;
          margin: 35px 0;
        }
        .benefits {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin: 30px 0;
        }
        .benefit-box {
          background: ${BRAND_COLORS.lightGold};
          padding: 20px;
          border-radius: 8px;
          text-align: center;
        }
        .benefit-icon {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .benefit-text {
          font-size: 13px;
          color: ${BRAND_COLORS.text};
          font-weight: 500;
        }
        .divider {
          border: 0;
          border-top: 2px solid ${BRAND_COLORS.lightGold};
          margin: 30px 0;
        }
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
        }
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
          .logo-img {
            max-width: 200px;
          }
          .promotion-title {
            font-size: 22px;
          }
          .benefits {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="container">
          <!-- Header -->
          <div class="header">
            <img src="${LOGO_URL}" alt="M&H Eyewear & Opticals" class="logo-img" style="width: 280px; max-width: 100%;">
            <div class="promo-badge">🎉 EXCLUSIVE OFFER</div>
          </div>

          <!-- Content -->
          <div class="content">
            ${data.recipient_name ? `<p class="greeting">Hi ${data.recipient_name},</p>` : '<p class="greeting">Hello,</p>'}

            <p class="body-text">
              We have an amazing offer just for you! Discover premium designer frames at unbeatable prices.
            </p>

            ${data.hero_image ? `<img src="${data.hero_image}" alt="${data.promotion_title}" class="hero-image">` : ''}

            <!-- Promotion Title & Discount -->
            <h2 class="promotion-title">${data.promotion_title}</h2>
            ${discountBadge}

            <!-- Promotion Description -->
            <p class="promotion-description">
              ${data.promotion_description}
            </p>

            <!-- Offer Code -->
            ${offerCode}

            <!-- Validity -->
            <div class="validity">
              <p class="validity-text">⏰ Valid until ${data.valid_until}</p>
            </div>

            <!-- CTA Button -->
            <div class="cta-section">
              <a href="${data.cta_link}" class="cta-button">${data.cta_text || "Shop Now"}</a>
            </div>

            <!-- Benefits -->
            <div class="benefits">
              <div class="benefit-box">
                <div class="benefit-icon">👓</div>
                <div class="benefit-text">Premium Designer Frames</div>
              </div>
              <div class="benefit-box">
                <div class="benefit-icon">✨</div>
                <div class="benefit-text">Expert Eye Care</div>
              </div>
              <div class="benefit-box">
                <div class="benefit-icon">🚚</div>
                <div class="benefit-text">Fast Delivery</div>
              </div>
              <div class="benefit-box">
                <div class="benefit-icon">💯</div>
                <div class="benefit-text">100% Satisfaction</div>
              </div>
            </div>

            <p class="body-text" style="text-align: center; color: ${BRAND_COLORS.lightText}; font-size: 13px;">
              Don't miss out on this limited-time offer. Stock is limited!
            </p>

            <hr class="divider">

            <p class="body-text" style="text-align: center; font-weight: 500;">
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
              <a href="https://mandheyewear.com/shop">Shop</a> •
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
    const data: PromotionRequest = await req.json();

    if (!data.recipient_email || !data.promotion_title || !data.cta_link) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: CORS }
      );
    }

    const emailHtml = buildPromotionEmailHtml(data);
    const emailResponse = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          from: FROM_EMAIL,
          to: [data.recipient_email],
          subject: `🎉 ${data.promotion_title} - Special Offer Inside!`,
          html: emailHtml,
          text: `${data.promotion_title}: ${data.promotion_description}`,
          tags: [
            { name: "type", value: "promotion" },
            { name: "offer", value: data.offer_code ? data.offer_code.toLowerCase() : "no_code" },
          ],
        },
      ]),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: errorData }),
        { status: 500, headers: CORS }
      );
    }

    const result = await emailResponse.json();
    return new Response(
      JSON.stringify({ success: true, message: "Promotion email sent", data: result }),
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
