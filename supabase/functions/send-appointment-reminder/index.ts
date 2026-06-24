import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("CAMPAIGN_FROM_EMAIL") || "M&H Eyewear <appointments@mandheyewear.com>";
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

interface AppointmentRequest {
  recipient_email: string;
  recipient_name: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  practitioner_name?: string;
  location: string;
  confirm_link: string;
  reschedule_link: string;
}

function buildAppointmentEmailHtml(data: AppointmentRequest): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Appointment Reminder - M&H Eyewear & Opticals</title>
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
          display: block;
        }
        .header-title {
          color: ${BRAND_COLORS.accent};
          font-size: 22px;
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
        .appointment-card {
          background: ${BRAND_COLORS.lightGold};
          border-left: 4px solid ${BRAND_COLORS.accent};
          padding: 25px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .appointment-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(212, 175, 55, 0.3);
        }
        .appointment-row:last-child {
          border-bottom: none;
        }
        .appointment-label {
          font-weight: 600;
          color: ${BRAND_COLORS.primary};
          font-size: 14px;
        }
        .appointment-value {
          color: ${BRAND_COLORS.text};
          font-size: 14px;
        }
        .cta-section {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 14px 35px;
          margin: 8px;
          font-size: 14px;
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
        .info-box {
          background: #FFF3CD;
          border-left: 4px solid #FFC107;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .info-title {
          font-weight: 700;
          color: #856404;
          margin-bottom: 8px;
        }
        .info-text {
          font-size: 14px;
          color: #856404;
          line-height: 1.6;
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
            <div class="header-title">📅 Appointment Reminder</div>
          </div>

          <!-- Content -->
          <div class="content">
            <p class="greeting">Hi ${data.recipient_name},</p>
            <p class="body-text">
              We're excited to see you soon! This is a reminder about your upcoming appointment at M&H Eyewear & Opticals.
            </p>

            <!-- Appointment Details -->
            <div class="appointment-card">
              <div class="appointment-row">
                <span class="appointment-label">📅 Date</span>
                <span class="appointment-value">${data.appointment_date}</span>
              </div>
              <div class="appointment-row">
                <span class="appointment-label">🕐 Time</span>
                <span class="appointment-value">${data.appointment_time}</span>
              </div>
              <div class="appointment-row">
                <span class="appointment-label">👁️ Service</span>
                <span class="appointment-value">${data.service_type}</span>
              </div>
              ${data.practitioner_name ? `
              <div class="appointment-row">
                <span class="appointment-label">👤 Practitioner</span>
                <span class="appointment-value">${data.practitioner_name}</span>
              </div>
              ` : ''}
              <div class="appointment-row">
                <span class="appointment-label">📍 Location</span>
                <span class="appointment-value">${data.location}</span>
              </div>
            </div>

            <!-- Important Info -->
            <div class="info-box">
              <div class="info-title">⏰ Please Arrive Early</div>
              <div class="info-text">
                We recommend arriving 10-15 minutes early to complete any necessary paperwork. This helps us start on time!
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="cta-section">
              <a href="${data.confirm_link}" class="button button-primary">✓ Confirm Appointment</a>
              <a href="${data.reschedule_link}" class="button button-secondary">📅 Reschedule</a>
            </div>

            <p class="body-text">
              If you have any questions or need to make changes, please don't hesitate to contact us at <strong>+234 XXX XXXX XXXX</strong> or reply to this email.
            </p>

            <hr class="divider">

            <p class="body-text" style="text-align: center; font-weight: 500;">
              We look forward to helping you see better! 👓<br>
              <span style="color: ${BRAND_COLORS.accent}; font-size: 14px;">M&H Eyewear & Opticals Team</span>
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p class="footer-text">
              © 2026 M&H Eyewear & Opticals. All rights reserved.
            </p>
            <div class="footer-links">
              <a href="https://mandheyewear.com">Website</a> •
              <a href="https://mandheyewear.com/locations">Locations</a> •
              <a href="https://mandheyewear.com/contact">Contact</a>
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
    const data: AppointmentRequest = await req.json();

    if (!data.recipient_email || !data.appointment_date || !data.appointment_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: CORS }
      );
    }

    const emailHtml = buildAppointmentEmailHtml(data);
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
          subject: `Appointment Reminder - ${data.appointment_date} at ${data.appointment_time}`,
          html: emailHtml,
          text: `Your appointment reminder: ${data.service_type} on ${data.appointment_date} at ${data.appointment_time}`,
          tags: [
            { name: "type", value: "appointment_reminder" },
            { name: "service", value: data.service_type.toLowerCase().replace(/\s+/g, "_") },
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
      JSON.stringify({ success: true, message: "Appointment reminder sent", data: result }),
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
