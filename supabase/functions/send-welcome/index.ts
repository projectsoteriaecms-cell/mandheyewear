import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("CAMPAIGN_FROM_EMAIL") || "M&H Eyewear <hello@mandheyewear.com>";
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

interface WelcomeRequest {
  recipient_email: string;
  recipient_name: string;
  welcome_message?: string;
  first_time_discount?: string;
  booking_link: string;
  shop_link?: string;
}

function buildWelcomeEmailHtml(data: WelcomeRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to M&H Eyewear & Opticals</title>
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
          padding: 50px 30px;
          text-align: center;
          border-bottom: 4px solid ${BRAND_COLORS.accent};
        }
        .logo-img {
          max-width: 280px;
          height: auto;
          margin-bottom: 20px;
        }
        .welcome-emoji {
          font-size: 48px;
          margin: 15px 0;
        }
        .welcome-text {
          color: ${BRAND_COLORS.accent};
          font-size: 24px;
          font-weight: 700;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 22px;
          font-weight: 700;
          color: ${BRAND_COLORS.text};
          margin-bottom: 20px;
        }
        .body-text {
          font-size: 15px;
          color: ${BRAND_COLORS.lightText};
          line-height: 1.8;
          margin-bottom: 20px;
        }
        .intro-box {
          background: ${BRAND_COLORS.lightGold};
          border-left: 4px solid ${BRAND_COLORS.accent};
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .intro-title {
          font-size: 16px;
          font-weight: 700;
          color: ${BRAND_COLORS.primary};
          margin-bottom: 10px;
        }
        .intro-text {
          font-size: 14px;
          color: ${BRAND_COLORS.text};
          line-height: 1.7;
        }
        .discount-banner {
          background: linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, #c9a227 100%);
          color: ${BRAND_COLORS.primary};
          padding: 30px;
          border-radius: 8px;
          text-align: center;
          margin: 30px 0;
        }
        .discount-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .discount-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .discount-code {
          font-size: 14px;
          background: rgba(15, 27, 46, 0.2);
          padding: 10px 20px;
          border-radius: 6px;
          letter-spacing: 2px;
          font-weight: 600;
          display: inline-block;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 30px 0;
        }
        .feature {
          text-align: center;
        }
        .feature-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }
        .feature-title {
          font-size: 14px;
          font-weight: 700;
          color: ${BRAND_COLORS.primary};
          margin-bottom: 5px;
        }
        .feature-desc {
          font-size: 12px;
          color: ${BRAND_COLORS.lightText};
        }
        .cta-section {
          text-align: center;
          margin: 35px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 40px;
          margin: 8px;
          font-size: 15px;
          font-weight: 700;
          text-decoration: none;
          border-radius: 6px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .button-primary {
          background: linear-gradient(135deg, ${BRAND_COLORS.accent} 0%, #c9a227 100%);
          color: ${BRAND_COLORS.primary};
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.25);
        }
        .button-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.35);
        }
        .button-secondary {
          background: ${BRAND_COLORS.white};
          color: ${BRAND_COLORS.accent};
          border: 2px solid ${BRAND_COLORS.accent};
        }
        .button-secondary:hover {
          background: ${BRAND_COLORS.lightGold};
        }
        .next-steps {
          background: #E3F2FD;
          border-left: 4px solid #1976D2;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .next-steps-title {
          font-weight: 700;
          color: #0D47A1;
          margin-bottom: 15px;
        }
        .step {
          font-size: 14px;
          color: #1565C0;
          margin-bottom: 10px;
          padding-left: 25px;
          position: relative;
        }
        .step::before {
          content: "→";
          position: absolute;
          left: 0;
          font-weight: 700;
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
            padding: 40px 20px;
          }
          .content {
            padding: 30px 20px;
          }
          .logo-img {
            max-width: 200px;
          }
          .features {
            grid-template-columns: 1fr;
          }
          .button {
            display: block;
            margin: 10px 0;
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
            <div class="welcome-emoji">👋</div>
            <div class="welcome-text">Welcome to M&H!</div>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Welcome, ${data.recipient_name}!</p>

            <p class="body-text">
              ${data.welcome_message || "We're thrilled to have you join the M&H Eyewear & Opticals family! Get ready to discover premium designer frames and exceptional eye care services."}
            </p>

            <!-- Welcome Box -->
            <div class="intro-box">
              <div class="intro-title">Why Choose M&H?</div>
              <div class="intro-text">
                We offer premium designer eyewear, expert optometric care, and personalized service to help you see the world in the best possible way.
              </div>
            </div>

            <!-- Welcome Discount -->
            ${data.first_time_discount ? `
            <div class="discount-banner">
              <div class="discount-label">WELCOME GIFT FOR NEW MEMBERS</div>
              <div class="discount-value">${data.first_time_discount}% OFF</div>
              <div class="discount-code">WELCOME${data.first_time_discount}</div>
              <p style="font-size: 12px; margin-top: 10px; opacity: 0.9;">Use code on your first order</p>
            </div>
            ` : ''}

            <!-- Features -->
            <div class="features">
              <div class="feature">
                <div class="feature-icon">👓</div>
                <div class="feature-title">Designer Frames</div>
                <div class="feature-desc">Curated premium eyewear</div>
              </div>
              <div class="feature">
                <div class="feature-icon">👁️</div>
                <div class="feature-title">Expert Care</div>
                <div class="feature-desc">Professional eye exams</div>
              </div>
              <div class="feature">
                <div class="feature-icon">✨</div>
                <div class="feature-title">Premium Service</div>
                <div class="feature-desc">Personalized experience</div>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
              <div class="next-steps-title">Here's How to Get Started:</div>
              <div class="step">Schedule your eye exam</div>
              <div class="step">Browse our designer collections</div>
              <div class="step">Get personalized recommendations</div>
              <div class="step">Enjoy exclusive member benefits</div>
            </div>

            <!-- CTA Buttons -->
            <div class="cta-section">
              <a href="${data.booking_link}" class="button button-primary">📅 Book an Appointment</a>
              ${data.shop_link ? `<a href="${data.shop_link}" class="button button-secondary">👓 Shop Now</a>` : ''}
            </div>

            <p class="body-text" style="text-align: center; font-size: 14px;">
              If you have any questions, our team is here to help!<br>
              <strong>Contact us:</strong> +234 XXX XXXX XXXX
            </p>

            <hr class="divider">

            <p class="body-text" style="text-align: center; font-weight: 500;">
              Welcome aboard! 🎉<br>
              <span style="color: ${BRAND_COLORS.accent}; font-size: 14px;">The M&H Eyewear & Opticals Team</span>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              © 2026 M&H Eyewear & Opticals. All rights reserved.
            </p>
            <div class="footer-links">
              <a href="https://mandheyewear.com">Website</a> •
              <a href="https://mandheyewear.com/about">About Us</a> •
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
    const data: WelcomeRequest = await req.json();

    if (!data.recipient_email || !data.recipient_name || !data.booking_link) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: CORS }
      );
    }

    const emailHtml = buildWelcomeEmailHtml(data);
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
          subject: `Welcome to M&H Eyewear & Opticals, ${data.recipient_name}! 👋`,
          html: emailHtml,
          text: `Welcome to M&H Eyewear & Opticals! We're excited to have you join us.`,
          tags: [
            { name: "type", value: "welcome" },
            { name: "first_discount", value: data.first_time_discount ? "yes" : "no" },
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
      JSON.stringify({ success: true, message: "Welcome email sent", data: result }),
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
