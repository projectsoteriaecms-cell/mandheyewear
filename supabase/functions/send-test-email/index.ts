import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = Deno.env.get("CAMPAIGN_FROM_EMAIL") || "Soteria Eye Clinic <campaigns@soteriaeyeclinic.com>";

function db() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

function buildEmailHtml(campaignName: string, subject: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .badge { display: inline-block; background-color: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px; font-size: 12px; margin-bottom: 10px; }
        .footer { font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">TEST EMAIL</div>
          <h2>${subject || "Campaign Test Email"}</h2>
          <p>Campaign: <strong>${campaignName}</strong></p>
        </div>

        <div class="content">
          <p>This is a test email from your Soteria Eye Clinic campaign.</p>
          <p>If you received this, the email delivery system is working correctly!</p>
        </div>

        <div class="footer">
          <p>© 2026 Soteria Eye Clinic. All rights reserved.</p>
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
          subject: campaign.subject_line || "Test Email",
          html: buildEmailHtml(campaign.name, campaign.subject_line || "Test Email"),
          text: `Test email for campaign: ${campaign.name}`,
          tags: [
            { name: "campaign_id", value: campaign_id },
            { name: "is_test", value: "true" },
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
