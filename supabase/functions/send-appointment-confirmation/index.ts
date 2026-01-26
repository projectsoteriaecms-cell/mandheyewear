import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SERVICES: Record<string, string> = {
  comprehensive_eye_exam: "Comprehensive Eye Exam",
  contact_lens_fitting: "Contact Lens Fitting",
  pediatric_eye_exam: "Pediatric Eye Exam",
  diabetic_eye_screening: "Diabetic Eye Screening",
  glaucoma_testing: "Glaucoma Testing",
  specialty_consultation: "Specialty Consultation",
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (timeString: string): string => {
  const [hours] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:00 ${ampm}`;
};

interface AppointmentConfirmationRequest {
  email: string;
  patientName: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  branchName: string;
  branchAddress: string;
  branchCity: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      patientName,
      serviceType,
      scheduledDate,
      scheduledTime,
      branchName,
      branchAddress,
      branchCity,
      notes,
    }: AppointmentConfirmationRequest = await req.json();

    if (!email || !patientName || !serviceType || !scheduledDate || !scheduledTime || !branchName) {
      throw new Error("Missing required fields");
    }

    const serviceName = SERVICES[serviceType] || serviceType;
    const formattedDate = formatDate(scheduledDate);
    const formattedTime = formatTime(scheduledTime);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Soteria Eye Clinic <onboarding@resend.dev>",
        to: [email],
        subject: `Appointment Confirmed - ${serviceName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Appointment Confirmed</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
              <p style="font-size: 16px; margin-bottom: 20px;">Dear <strong>${patientName}</strong>,</p>
              
              <p style="font-size: 16px; margin-bottom: 25px;">Your appointment has been successfully booked. Here are your appointment details:</p>
              
              <div style="background: white; border-radius: 8px; padding: 20px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #6b7280;">Service:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${serviceName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #6b7280;">Date:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #6b7280;">Time:</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #1f2937;">${formattedTime}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: 600; color: #6b7280;">Location:</td>
                    <td style="padding: 10px 0; color: #1f2937;">${branchName}<br><span style="color: #6b7280;">${branchAddress}, ${branchCity}</span></td>
                  </tr>
                </table>
              </div>
              
              ${notes ? `
              <div style="background: #fef3c7; border-radius: 8px; padding: 15px; margin-bottom: 25px; border: 1px solid #fcd34d;">
                <p style="margin: 0; font-size: 14px;"><strong>Your Notes:</strong> ${notes}</p>
              </div>
              ` : ""}
              
              <div style="background: #dbeafe; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">📋 Before Your Visit</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1e40af;">
                  <li>Bring any current eyeglasses or contact lenses</li>
                  <li>Bring a list of current medications</li>
                  <li>Arrive 10-15 minutes early for paperwork</li>
                  <li>Bring your insurance card if applicable</li>
                </ul>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                Need to reschedule or cancel? Please contact us at least 24 hours in advance, or manage your appointment through your dashboard.
              </p>
              
              <p style="font-size: 16px; margin-bottom: 5px;">Thank you for choosing Soteria Eye Clinic!</p>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">We look forward to seeing you.</p>
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
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Appointment confirmation email sent:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending appointment confirmation:", error);
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
