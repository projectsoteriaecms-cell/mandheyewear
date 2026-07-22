const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

const OPERATIONS_EMAIL = "operations_businessmanger@soteriaeyeclinic.com";
// notify.mandheyewear.com was never verified in Resend -- every send from it
// failed with a 403. mandheyewear.com is verified (auth-email-hook proves it).
const SENDER = "M&H Eyewear <noreply@mandheyewear.com>";
const SITE_URL = "https://soteriaeyeclinic.lovable.app";
const WHATSAPP_NUMBER = "2348063363506";

type EmailType = "order_confirmation" | "shipping" | "delivery";

interface OrderNotificationBody {
  type?: EmailType;
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
  has_rx_items?: boolean;
  requires_fitting?: boolean;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    lens_type?: string | null;
    lens_price?: number;
  }>;
  notify_customer?: boolean;
  // Shipping-specific
  tracking_number?: string | null;
  estimated_delivery_date?: string | null;
  logistics_partner?: string | null;
}

// ─── Shared email wrapper ───
const emailWrapper = (headerBg: string, headerIcon: string, headerTitle: string, headerSub: string, bodyContent: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:${headerBg};color:#fff;padding:24px 30px;">
    <h1 style="margin:0;font-size:22px;">${headerIcon} ${headerTitle}</h1>
    <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">${headerSub}</p>
  </div>
  <div style="padding:24px 30px;">
    ${bodyContent}
  </div>
  <div style="background:#faf8f5;padding:16px 30px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;">Need help? Chat with us on <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#25D366;text-decoration:none;font-weight:600;">WhatsApp</a></p>
    <p style="margin:6px 0 0;">© M&H Eyewear • <a href="${SITE_URL}" style="color:#1a1a2e;text-decoration:none;">mandheyewear.com</a></p>
  </div>
</div>
</body></html>`;

// ─── Operations email (internal) ───
function buildOperationsEmail(data: OrderNotificationBody): string {
  const itemRows = data.items
    .map(
      (item) =>
        `<tr><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${item.product_name}</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td><td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">₦${item.price.toLocaleString()}</td></tr>`
    )
    .join("");

  const addr = data.shipping_address;
  const addressParts = [addr.address, addr.landmark && `📍 ${addr.landmark}`, addr.city, addr.state || addr.region, addr.postal_code, addr.country].filter(Boolean);

  const rxBanner = data.requires_fitting
    ? `<div style="background:#fff3e0;border-left:4px solid #f57c00;padding:12px 16px;margin:0 0 20px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#e65100;">🔧 FITTING APPOINTMENT REQUIRED</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6d4c41;">This order contains prescription lenses. Customer must book an in-store fitting before dispensing. Check admin panel for details.</p>
      </div>`
    : data.has_rx_items
    ? `<div style="background:#e8f4fd;border-left:4px solid #1976d2;padding:12px 16px;margin:0 0 20px;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-size:13px;color:#1565c0;">👓 Rx order — prescription lenses included.</p>
      </div>`
    : "";

  return emailWrapper("#1a1a2e", "🛒", "New Order Received", `Order ${data.order_number}`, `
    ${rxBanner}
    <table style="width:100%;font-size:14px;margin-bottom:20px;">
      <tr><td style="padding:4px 0;color:#888;width:120px;">Name:</td><td style="font-weight:600;">${data.customer_name}</td></tr>
      <tr><td style="padding:4px 0;color:#888;">Email:</td><td>${data.customer_email}</td></tr>
      <tr><td style="padding:4px 0;color:#888;">Phone:</td><td style="font-weight:600;">${data.customer_phone}</td></tr>
      <tr><td style="padding:4px 0;color:#888;">Payment Ref:</td><td>${data.payment_reference}</td></tr>
    </table>
    <h3 style="font-size:14px;color:#333;margin:0 0 8px;">📦 Shipping Address</h3>
    <p style="font-size:14px;color:#555;margin:0 0 4px;">${addressParts.join(", ")}</p>
    <p style="font-size:13px;color:#999;margin:0 0 20px;">Zone: ${data.shipping_zone || "N/A"} | Fee: ₦${data.shipping_fee.toLocaleString()}</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead><tr style="background:#f9f9f9;">
        <th style="padding:10px 12px;text-align:left;font-weight:600;color:#555;">Product</th>
        <th style="padding:10px 12px;text-align:center;font-weight:600;color:#555;">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-weight:600;color:#555;">Price</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div style="text-align:right;font-size:20px;font-weight:700;color:#1a1a2e;border-top:2px solid #1a1a2e;padding-top:12px;margin-top:12px;">
      Total: ₦${data.total_amount.toLocaleString()} ${data.currency}
    </div>
  `);
}

// ─── Customer: Order Confirmation ───
function buildCustomerConfirmationEmail(data: OrderNotificationBody): string {
  const itemsList = data.items.map(item => {
    const hasLens = item.lens_type && item.lens_type !== "frame_only";
    const lensLabel = hasLens
      ? item.lens_type!.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      : null;
    return `<div style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span style="color:#333;font-size:14px;">${item.product_name} × ${item.quantity}</span>
        <span style="color:#1a1a2e;font-weight:600;font-size:14px;white-space:nowrap;margin-left:12px;">₦${item.price.toLocaleString()}</span>
      </div>
      ${hasLens ? `<div style="display:inline-flex;align-items:center;gap:6px;background:#f0f4ff;border:1px solid #dce4ff;border-radius:4px;padding:3px 8px;margin-top:4px;">
        <span style="font-size:12px;color:#3b5bdb;">🔹 ${lensLabel} lenses${item.lens_price && item.lens_price > 0 ? ` (+₦${item.lens_price.toLocaleString()})` : ""}</span>
      </div>` : ""}
    </div>`;
  }).join("");

  const fittingReminder = data.requires_fitting ? `
    <div style="background:#fff8e1;border:2px solid #ffc107;border-radius:10px;padding:18px 20px;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#e65100;">🔧 Fitting Appointment Required</p>
      <p style="margin:0 0 12px;font-size:13px;color:#5d4037;line-height:1.6;">
        Your order includes prescription lenses that require a free <strong>30-minute in-store fitting appointment</strong>
        before we can dispense them. Please book your slot at your nearest M&H branch as soon as possible to avoid delays.
      </p>
      <div style="text-align:center;">
        <a href="${SITE_URL}/dashboard?tab=orders"
           style="display:inline-block;background:#f57c00;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">
          Book Fitting Appointment
        </a>
      </div>
    </div>
  ` : "";

  return emailWrapper("#1a1a2e", "✅", "Order Confirmed!", data.order_number, `
    <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi ${data.customer_name},</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 20px;">
      Thank you for shopping with M&H Eyewear! Your payment has been received and your order is now being processed.
    </p>
    <div style="background:#f0f8ff;padding:16px 20px;border-radius:8px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:14px;"><strong>Order Number:</strong> ${data.order_number}</p>
      <p style="margin:0;font-size:14px;"><strong>Total:</strong> ₦${data.total_amount.toLocaleString()}</p>
    </div>
    ${fittingReminder}
    <h3 style="font-size:14px;color:#555;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.5px;">Order Items</h3>
    ${itemsList}
    <p style="font-size:14px;color:#666;margin:20px 0 0;line-height:1.6;">
      We'll notify you once your order ships. You can track your order status at any time on our website.
    </p>
    <div style="text-align:center;margin:24px 0 0;">
      <a href="${SITE_URL}/dashboard?tab=orders" style="display:inline-block;background:#1a1a2e;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View My Orders</a>
    </div>
  `);
}

// ─── Customer: Shipping Notification ───
function buildShippingEmail(data: OrderNotificationBody): string {
  const trackingSection = data.tracking_number
    ? `<div style="background:#e8f5e9;padding:16px 20px;border-radius:8px;margin:0 0 20px;">
        <p style="margin:0 0 4px;font-size:13px;color:#388e3c;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Tracking Number</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#1b5e20;letter-spacing:1px;">${data.tracking_number}</p>
        ${data.logistics_partner ? `<p style="margin:6px 0 0;font-size:13px;color:#4caf50;">via ${data.logistics_partner}</p>` : ""}
      </div>`
    : "";

  const deliverySection = data.estimated_delivery_date
    ? `<p style="font-size:14px;color:#666;margin:0 0 20px;">📅 <strong>Estimated delivery:</strong> ${data.estimated_delivery_date}</p>`
    : "";

  return emailWrapper("#FF5A36", "📦", "Your Order Has Shipped!", data.order_number, `
    <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi ${data.customer_name},</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 20px;">
      Great news! Your order has been shipped and is on its way to you.
    </p>
    ${trackingSection}
    ${deliverySection}
    <div style="background:#faf8f5;padding:16px 20px;border-radius:8px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:14px;"><strong>Order:</strong> ${data.order_number}</p>
      <p style="margin:0;font-size:14px;"><strong>Shipping Zone:</strong> ${data.shipping_zone || "Standard"}</p>
    </div>
    <div style="text-align:center;margin:24px 0 0;">
      <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#FF5A36;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Track My Order</a>
    </div>
  `);
}

// ─── Customer: Delivery Confirmation ───
function buildDeliveryEmail(data: OrderNotificationBody): string {
  return emailWrapper("#2e7d32", "🎉", "Your Order Has Been Delivered!", data.order_number, `
    <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi ${data.customer_name},</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 20px;">
      Your order has been delivered! We hope you love your new eyewear. If anything doesn't look right, 
      don't hesitate to reach out — we're here to help.
    </p>
    <div style="background:#e8f5e9;padding:16px 20px;border-radius:8px;margin:0 0 20px;">
      <p style="margin:0 0 6px;font-size:14px;"><strong>Order:</strong> ${data.order_number}</p>
      <p style="margin:0;font-size:14px;"><strong>Total:</strong> ₦${data.total_amount.toLocaleString()}</p>
    </div>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 20px;">
      In a few days, we'll send you a quick email to hear about your experience. Your feedback helps us serve you better!
    </p>
    <div style="text-align:center;margin:24px 0 0;">
      <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#2e7d32;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View My Orders</a>
    </div>
  `);
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: SENDER, to: [to], subject, html }),
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
    const emailType: EmailType = data.type || "order_confirmation";

    console.log(`Processing ${emailType} email for order ${data.order_number}`);

    if (emailType === "order_confirmation") {
      // Send operations email
      const opsSubject = `🛒 New Order ${data.order_number} — ₦${data.total_amount.toLocaleString()}`;
      const opsSent = await sendEmail(OPERATIONS_EMAIL, opsSubject, buildOperationsEmail(data));
      console.log(`Operations email ${opsSent ? "sent" : "FAILED"} for order ${data.order_number}`);

      // Send customer confirmation email
      if (data.notify_customer !== false && data.customer_email) {
        const custSubject = `Order Confirmed — ${data.order_number}`;
        const custSent = await sendEmail(data.customer_email, custSubject, buildCustomerConfirmationEmail(data));
        console.log(`Customer confirmation ${custSent ? "sent" : "FAILED"} for order ${data.order_number}`);
      }
    } else if (emailType === "shipping") {
      if (data.customer_email) {
        const subject = `Your Order ${data.order_number} Has Shipped! 📦`;
        const sent = await sendEmail(data.customer_email, subject, buildShippingEmail(data));
        console.log(`Shipping email ${sent ? "sent" : "FAILED"} for order ${data.order_number}`);
      }
      // Notify ops too
      const opsSubject = `📦 Order ${data.order_number} Shipped`;
      await sendEmail(OPERATIONS_EMAIL, opsSubject, buildShippingEmail(data));
    } else if (emailType === "delivery") {
      if (data.customer_email) {
        const subject = `Your Order ${data.order_number} Has Been Delivered! 🎉`;
        const sent = await sendEmail(data.customer_email, subject, buildDeliveryEmail(data));
        console.log(`Delivery email ${sent ? "sent" : "FAILED"} for order ${data.order_number}`);
      }
    }

    return new Response(JSON.stringify({ success: true, type: emailType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-order-notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
