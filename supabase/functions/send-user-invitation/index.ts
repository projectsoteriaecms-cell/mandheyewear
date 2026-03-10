import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") ?? "M&H Eyewear <noreply@notify.mandheyewear.com>";
const RESEND_RESTRICTED_MODE_FRAGMENTS = [
  "You can only send testing emails to your own email address",
  "domain is not verified",
  "verify your domain",
  "resend.com/domains",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const roleLabels: Record<string, string> = {
  customer: "Customer",
  branch_staff: "Branch Staff",
  branch_manager: "Branch Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

interface InvitationRequest {
  email: string;
  role: string;
  invitedByName: string;
  signupUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role, invitedByName, signupUrl }: InvitationRequest = await req.json();

    if (!email || !role || !signupUrl) {
      throw new Error("Missing required fields");
    }

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const roleName = roleLabels[role] || role;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: `You're Invited to Join Soteria Eye Clinic`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">
                <strong>${invitedByName || "A team member"}</strong> has invited you to join 
                <strong>Soteria Eye Clinic & M&H Eyewear</strong> as a <strong>${roleName}</strong>.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${signupUrl}" style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                  Accept Invitation
                </a>
              </div>
              
              <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📋 What happens next?</h3>
                <ol style="margin: 0; padding-left: 20px; color: #1e40af;">
                  <li>Click the button above to create your account</li>
                  <li>Fill in your details and set a password</li>
                  <li>You'll automatically be assigned the <strong>${roleName}</strong> role</li>
                  <li>Start using the platform right away!</li>
                </ol>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                This invitation will expire in 7 days. If you didn't expect this invitation, 
                you can safely ignore this email.
              </p>
              
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${signupUrl}" style="color: #1e40af; word-break: break-all;">${signupUrl}</a>
              </p>
            </div>
            
            <div style="background: #1e3a5f; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Soteria Eye Clinic. All rights reserved.
              </p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      const errorMessage = emailData?.message || "Failed to send email";

      if (errorMessage.includes(RESEND_TESTING_MODE_ERROR)) {
        return new Response(
          JSON.stringify({
            success: true,
            emailSent: false,
            warning:
              "Invitation created, but email sending is restricted until your sending domain is verified and used as sender.",
            signupUrl,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          },
        );
      }

      console.error("Resend API error:", emailData);
      throw new Error(errorMessage);
    }

    console.log("Invitation email sent:", emailData);

    return new Response(JSON.stringify({ success: true, emailSent: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

