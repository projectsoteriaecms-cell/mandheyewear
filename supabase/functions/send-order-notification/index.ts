const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const OPERATIONS_EMAIL = "operations_businessmanger@soteriaeyeclinic.com";
const SENDER = "Soteria Eye Clinic <noreply@notify.mandheyewear.com>";

interface OrderNotificationBody {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, string>;
  shipping_zone: string | null;
  shipping_fee: number;
  total_amount: number;
  payment_reference: string;
  currency: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
  }>;
  notify_customer?: boolean;
}

function buildOperationsEmail(data: OrderNotificationBody): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;">${item.product_name}</td><td style="padding:8px;border:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border:1px solid #ddd;text-align:right;">₦${item.price.toLocaleString()}</td></tr>`
    )
    .join("");

  const addr = data.shipping_address;
  const addressParts = [
    addr.address,
    addr.landmark && `📍 ${addr.landmark}`,
    addr.city,
    addr.state || addr.region,
    addr.postal_code,
    addr.country,
  ].filter(Boolean);

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#1a1a2e;color:#fff;padding:20px 25px;">
    <h1 style="margin:0;font-size:20px;">🛒 New Order Received</h1>
    <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">Order ${data.order_number}</p>
  </div>
  <div style="padding:20px 25px;">
    <h2 style="font-size:16px;margin:0 0 15px;color:#333;">Customer Details</h2>
    <table style="width:100%;font-size:14px;margin-bottom:20px;">
      <tr><td style="padding:4px 0;color:#666;width:120px;">Name:</td><td style="padding:4px 0;font-weight:bold;">${data.customer_name}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Email:</td><td style="padding:4px 0;">${data.customer_email}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Phone:</td><td style="padding:4px 0;font-weight:bold;">${data.customer_phone}</td></tr>
      <tr><td style="padding:4px 0;color:#666;">Payment Ref:</td><td style="padding:4px 0;">${data.payment_reference}</td></tr>
    </table>

    <h2 style="font-size:16px;margin:0 0 10px;color:#333;">Shipping Address</h2>
    <p style="font-size:14px;color:#555;margin:0 0 5px;">${addressParts.join(", ")}</p>
    <p style="font-size:13px;color:#888;margin:0 0 20px;">Zone: ${data.shipping_zone || "N/A"} | Shipping Fee: ₦${data.shipping_fee.toLocaleString()}</p>

    <h2 style="font-size:16px;margin:0 0 10px;color:#333;">Order Items</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:15px;">
      <thead><tr style="background:#f5f5f5;">
        <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:center;">Qty</th>
        <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>

    <div style="text-align:right;font-size:18px;font-weight:bold;color:#1a1a2e;border-top:2px solid #1a1a2e;padding-top:10px;">
      Total: ₦${data.total_amount.toLocaleString()} ${data.currency}
    </div>
  </div>
  <div style="background:#f5f5f5;padding:15px 25px;font-size:12px;color:#888;text-align:center;">
    This is an automated notification from the M&H Eyewear ordering system.
  </div>
</div>
</body></html>`;
}

function buildCustomerEmail(data: OrderNotificationBody): string {
  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#1a1a2e;color:#fff;padding:20px 25px;">
    <h1 style="margin:0;font-size:20px;">✅ Order Confirmed</h1>
    <p style="margin:5px 0 0;font-size:14px;opacity:0.9;">${data.order_number}</p>
  </div>
  <div style="padding:20px 25px;">
    <p style="font-size:16px;color:#333;">Hi ${data.customer_name},</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Thank you for your order! We've received your payment and your order is now being processed. 
      You'll receive updates as your order moves through our fulfillment pipeline.
    </p>
    <div style="background:#f0f8ff;padding:15px;border-radius:6px;margin:15px 0;">
      <p style="margin:0;font-size:14px;color:#333;"><strong>Order Number:</strong> ${data.order_number}</p>
      <p style="margin:5px 0 0;font-size:14px;color:#333;"><strong>Total:</strong> ₦${data.total_amount.toLocaleString()}</p>
    </div>
    <p style="font-size:14px;color:#555;">
      For any questions about your order, please contact our operations team at 
      <a href="mailto:${OPERATIONS_EMAIL}" style="color:#1a73e8;">${OPERATIONS_EMAIL}</a>
    </p>
    <p style="font-size:14px;color:#555;margin-top:20px;">
      Best regards,<br/>The Soteria Eye Clinic Team
    </p>
  </div>
</div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({
      from: SENDER,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Email send failed (${res.status}):`, errorText);
    return false;
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: OrderNotificationBody = await req.json();

    // Send operations email
    const opsSubject = `🛒 New Order ${data.order_number} — ₦${data.total_amount.toLocaleString()}`;
    const opsSent = await sendEmail(OPERATIONS_EMAIL, opsSubject, buildOperationsEmail(data));
    console.log(`Operations email ${opsSent ? "sent" : "FAILED"} for order ${data.order_number}`);

    // Send customer confirmation email
    if (data.notify_customer !== false && data.customer_email) {
      const custSubject = `Order Confirmed — ${data.order_number}`;
      const custSent = await sendEmail(data.customer_email, custSubject, buildCustomerEmail(data));
      console.log(`Customer email ${custSent ? "sent" : "FAILED"} for order ${data.order_number}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-order-notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send notification" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
