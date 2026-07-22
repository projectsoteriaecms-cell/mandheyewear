import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
// notify.mandheyewear.com was never verified in Resend -- every send from it
// failed with a 403. mandheyewear.com is verified (auth-email-hook proves it).
const SENDER = "M&H Eyewear <noreply@mandheyewear.com>";
const SITE_URL = "https://soteriaeyeclinic.lovable.app";
const WHATSAPP_NUMBER = "2348063363506";

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
    console.error(`Email failed (${res.status}):`, await res.text());
    return false;
  }
  return true;
}

function buildReviewRequestEmail(
  customerName: string,
  orderNumber: string,
  items: Array<{ product_name: string; product_id: string; image_url: string | null }>
): string {
  const productCards = items.slice(0, 3).map(item => `
    <div style="display:inline-block;width:48%;vertical-align:top;margin:0 1% 16px;text-align:center;">
      ${item.image_url
        ? `<img src="${item.image_url}" alt="${item.product_name}" style="width:100%;max-width:200px;height:140px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />`
        : `<div style="width:100%;max-width:200px;height:140px;background:#f0f0f0;border-radius:8px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:12px;">No image</div>`
      }
      <p style="margin:0;font-size:13px;color:#333;font-weight:500;">${item.product_name}</p>
      <a href="${SITE_URL}/product/${item.product_id}" style="display:inline-block;margin-top:8px;padding:6px 16px;background:#1a1a2e;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600;">Review This</a>
    </div>
  `).join("");

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;margin:0;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
  <div style="background:#1a1a2e;color:#fff;padding:24px 30px;text-align:center;">
    <h1 style="margin:0;font-size:22px;">⭐ How's Your New Eyewear?</h1>
    <p style="margin:8px 0 0;font-size:14px;opacity:0.85;">Order ${orderNumber}</p>
  </div>
  <div style="padding:24px 30px;">
    <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi ${customerName},</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">
      We hope you're loving your recent purchase! Your feedback helps other customers make confident choices 
      and helps us keep improving. Would you take a moment to share your experience?
    </p>
    <div style="text-align:center;margin-bottom:24px;">
      <p style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;">Your Recent Purchase</p>
      ${productCards}
    </div>
    <div style="text-align:center;margin:24px 0 8px;">
      <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#FF5A36;color:#fff;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">Write a Review</a>
    </div>
    <p style="font-size:12px;color:#999;text-align:center;margin:16px 0 0;">
      It only takes a minute and means the world to us 💛
    </p>
  </div>
  <div style="background:#faf8f5;padding:16px 30px;font-size:12px;color:#888;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;">Need help? Chat with us on <a href="https://wa.me/${WHATSAPP_NUMBER}" style="color:#25D366;text-decoration:none;font-weight:600;">WhatsApp</a></p>
    <p style="margin:6px 0 0;">© M&H Eyewear • <a href="${SITE_URL}" style="color:#1a1a2e;text-decoration:none;">mandheyewear.com</a></p>
  </div>
</div>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find orders delivered 3+ days ago that haven't had a review request sent
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: eligibleOrders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, user_id, delivered_at, total_amount")
      .eq("order_status", "delivered")
      .is("review_requested_at", null)
      .not("delivered_at", "is", null)
      .lte("delivered_at", threeDaysAgo.toISOString())
      .limit(20); // Process in batches

    if (ordersError) {
      console.error("Failed to fetch eligible orders:", ordersError);
      throw ordersError;
    }

    if (!eligibleOrders || eligibleOrders.length === 0) {
      console.log("No orders eligible for review request");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${eligibleOrders.length} orders eligible for review request`);
    let sent = 0;

    for (const order of eligibleOrders) {
      try {
        // Get customer profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", order.user_id)
          .single();

        if (!profile?.email) {
          console.log(`No email for user ${order.user_id}, skipping`);
          continue;
        }

        // Get order items with product details
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("product_id, quantity, products(name, image_url)")
          .eq("order_id", order.id);

        const items = (orderItems || []).map((oi: any) => ({
          product_name: oi.products?.name || "Product",
          product_id: oi.product_id,
          image_url: oi.products?.image_url || null,
        }));

        if (items.length === 0) {
          console.log(`No items found for order ${order.order_number}, skipping`);
          continue;
        }

        const customerName = profile.full_name || "Valued Customer";
        const subject = `⭐ How's your new eyewear? Review your order ${order.order_number}`;
        const html = buildReviewRequestEmail(customerName, order.order_number, items);

        const emailSent = await sendEmail(profile.email, subject, html);

        if (emailSent) {
          // Mark order as review-requested
          await supabase
            .from("orders")
            .update({ review_requested_at: new Date().toISOString() })
            .eq("id", order.id);
          sent++;
          console.log(`Review request sent for order ${order.order_number} to ${profile.email}`);
        }

        // Small delay between sends
        await new Promise((r) => setTimeout(r, 200));
      } catch (innerErr) {
        console.error(`Error processing order ${order.order_number}:`, innerErr);
      }
    }

    console.log(`Review request batch complete: ${sent}/${eligibleOrders.length} sent`);

    return new Response(
      JSON.stringify({ processed: eligibleOrders.length, sent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-review-request error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process review requests" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
