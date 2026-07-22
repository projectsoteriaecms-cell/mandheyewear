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

function generateDiscountCode(): string {
  return "MH10-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

interface CartItem {
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  product_id: string;
}

function buildItemRows(items: CartItem[]): string {
  return items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        <img src="${item.product_image || ""}" alt="${item.product_name}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;" />
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#333;">${item.product_name}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:center;">${item.quantity}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;font-size:14px;color:#1a1a2e;font-weight:bold;text-align:right;">₦${item.price.toLocaleString()}</td>
    </tr>`
    )
    .join("");
}

function buildStep1Email(name: string, items: CartItem[], total: number): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#1a1a2e;color:#fff;padding:24px;">
    <h1 style="margin:0;font-size:22px;">You left something behind 👀</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;color:#333;">Hi ${name},</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      We noticed you were shopping but didn't complete your purchase. Your items are still waiting for you!
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead><tr style="background:#f5f5f5;">
        <th style="padding:10px;text-align:left;font-size:12px;color:#888;">Image</th>
        <th style="padding:10px;text-align:left;font-size:12px;color:#888;">Product</th>
        <th style="padding:10px;text-align:center;font-size:12px;color:#888;">Qty</th>
        <th style="padding:10px;text-align:right;font-size:12px;color:#888;">Price</th>
      </tr></thead>
      <tbody>${buildItemRows(items)}</tbody>
    </table>
    <div style="text-align:right;font-size:18px;font-weight:bold;color:#1a1a2e;border-top:2px solid #1a1a2e;padding-top:12px;margin-bottom:24px;">
      Total: ₦${total.toLocaleString()}
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/checkout" style="display:inline-block;background:#FF5A36;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Complete Your Order →</a>
    </div>
    <div style="text-align:center;margin-top:16px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20completing%20my%20order" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">💬 Chat with us on WhatsApp</a>
    </div>
  </div>
  <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888;">
    M&H Eyewear — Premium eyewear, delivered to your door.
  </div>
</div>
</body></html>`;
}

function buildStep2Email(name: string, items: CartItem[], total: number): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#1a1a2e;color:#fff;padding:24px;">
    <h1 style="margin:0;font-size:22px;">Still thinking about it? 🤔</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;color:#333;">Hi ${name},</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      Your cart is still waiting! These items are popular — other customers have been eyeing them too. Don't miss out.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead><tr style="background:#f5f5f5;">
        <th style="padding:10px;text-align:left;font-size:12px;color:#888;">Image</th>
        <th style="padding:10px;text-align:left;font-size:12px;color:#888;">Product</th>
        <th style="padding:10px;text-align:center;font-size:12px;color:#888;">Qty</th>
        <th style="padding:10px;text-align:right;font-size:12px;color:#888;">Price</th>
      </tr></thead>
      <tbody>${buildItemRows(items)}</tbody>
    </table>
    <div style="text-align:right;font-size:18px;font-weight:bold;color:#1a1a2e;border-top:2px solid #1a1a2e;padding-top:12px;margin-bottom:24px;">
      Total: ₦${total.toLocaleString()}
    </div>
    <div style="background:#FFF8E1;padding:14px;border-radius:6px;text-align:center;margin-bottom:20px;">
      <p style="margin:0;font-size:14px;color:#F57F17;">⚡ Prices are locked for 48 hours — the Naira market waits for no one!</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/checkout" style="display:inline-block;background:#FF5A36;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Complete Your Order →</a>
    </div>
    <div style="text-align:center;margin-top:16px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20need%20help%20completing%20my%20order" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">💬 Chat with us on WhatsApp</a>
    </div>
  </div>
  <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888;">
    M&H Eyewear — Premium eyewear, delivered to your door.
  </div>
</div>
</body></html>`;
}

function buildStep3Email(name: string, items: CartItem[], total: number, discountCode: string): string {
  const discounted = Math.round(total * 0.9);
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#FF5A36;color:#fff;padding:24px;">
    <h1 style="margin:0;font-size:22px;">Last chance — 10% OFF just for you! 🎉</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;color:#333;">Hi ${name},</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      We really don't want you to miss out! Here's an exclusive <strong>10% discount</strong> to help you decide.
    </p>
    <div style="background:#1a1a2e;color:#fff;padding:20px;border-radius:8px;text-align:center;margin:20px 0;">
      <p style="margin:0 0 8px;font-size:14px;opacity:0.8;">Your exclusive discount code:</p>
      <p style="margin:0;font-size:28px;font-weight:bold;letter-spacing:3px;">${discountCode}</p>
      <p style="margin:8px 0 0;font-size:13px;opacity:0.7;">Valid for 48 hours</p>
    </div>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <thead><tr style="background:#f5f5f5;">
        <th style="padding:10px;text-align:left;font-size:12px;color:#888;">Image</th>
        <th style="padding:10px;text-align:left;font-size:12px;color:#888;">Product</th>
        <th style="padding:10px;text-align:center;font-size:12px;color:#888;">Qty</th>
        <th style="padding:10px;text-align:right;font-size:12px;color:#888;">Price</th>
      </tr></thead>
      <tbody>${buildItemRows(items)}</tbody>
    </table>
    <div style="text-align:right;margin-bottom:24px;">
      <span style="font-size:14px;color:#888;text-decoration:line-through;">₦${total.toLocaleString()}</span>
      <span style="font-size:20px;font-weight:bold;color:#FF5A36;margin-left:8px;">₦${discounted.toLocaleString()}</span>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/checkout" style="display:inline-block;background:#FF5A36;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">Claim Your 10% Off →</a>
    </div>
    <div style="text-align:center;margin-top:16px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20have%20discount%20code%20${discountCode}%20and%20need%20help" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">💬 Chat with us on WhatsApp</a>
    </div>
  </div>
  <div style="background:#f5f5f5;padding:16px;text-align:center;font-size:12px;color:#888;">
    M&H Eyewear — Premium eyewear, delivered to your door.
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
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results = { step1: 0, step2: 0, step3: 0 };

    // ─── STEP 1: Detect new abandoned carts (idle > 1h) ───
    // Find users with cart items whose most recent item is > 1h old and who have no pending abandonment event
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    const { data: staleCarts } = await supabase
      .from("cart_items")
      .select("user_id, product_id, quantity, created_at, products(name, image_url, price)")
      .lt("created_at", oneHourAgo);

    if (staleCarts && staleCarts.length > 0) {
      // Group by user_id
      const userCarts: Record<string, any[]> = {};
      for (const item of staleCarts) {
        if (!userCarts[item.user_id]) userCarts[item.user_id] = [];
        userCarts[item.user_id].push(item);
      }

      for (const [userId, items] of Object.entries(userCarts)) {
        // Check if there's already an unrecovered abandonment event for this user
        const { data: existing } = await supabase
          .from("cart_abandonment_events")
          .select("id")
          .eq("user_id", userId)
          .is("recovered_at", null)
          .limit(1);

        if (existing && existing.length > 0) continue;

        // Get user email and name
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", userId)
          .single();

        if (!profile?.email) continue;

        const cartSnapshot: CartItem[] = items.map((item: any) => ({
          product_id: item.product_id,
          product_name: (item as any).products?.name || "Product",
          product_image: (item as any).products?.image_url || "",
          price: (item as any).products?.price || 0,
          quantity: item.quantity,
        }));

        const totalValue = cartSnapshot.reduce((sum, i) => sum + i.price * i.quantity, 0);

        // Create abandonment event
        const { error: insertErr } = await supabase
          .from("cart_abandonment_events")
          .insert({
            user_id: userId,
            cart_snapshot: cartSnapshot,
            total_value: totalValue,
            step_1_sent_at: new Date().toISOString(),
          });

        if (insertErr) {
          console.error("Insert error:", insertErr);
          continue;
        }

        // Send step 1 email
        const sent = await sendEmail(
          profile.email,
          "You left something behind! 👀",
          buildStep1Email(profile.full_name || "there", cartSnapshot, totalValue)
        );
        if (sent) results.step1++;
      }
    }

    // ─── STEP 2: 24h follow-up ───
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: step2Events } = await supabase
      .from("cart_abandonment_events")
      .select("*")
      .is("recovered_at", null)
      .not("step_1_sent_at", "is", null)
      .is("step_2_sent_at", null)
      .lt("abandoned_at", twentyFourHoursAgo);

    if (step2Events) {
      for (const event of step2Events) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", event.user_id)
          .single();

        if (!profile?.email) continue;

        const items = event.cart_snapshot as CartItem[];
        const sent = await sendEmail(
          profile.email,
          "Still thinking about it? 🤔",
          buildStep2Email(profile.full_name || "there", items, event.total_value)
        );

        if (sent) {
          await supabase
            .from("cart_abandonment_events")
            .update({ step_2_sent_at: new Date().toISOString() })
            .eq("id", event.id);
          results.step2++;
        }
      }
    }

    // ─── STEP 3: 72h final + discount ───
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const { data: step3Events } = await supabase
      .from("cart_abandonment_events")
      .select("*")
      .is("recovered_at", null)
      .not("step_2_sent_at", "is", null)
      .is("step_3_sent_at", null)
      .lt("abandoned_at", seventyTwoHoursAgo);

    if (step3Events) {
      for (const event of step3Events) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", event.user_id)
          .single();

        if (!profile?.email) continue;

        const discountCode = generateDiscountCode();
        const items = event.cart_snapshot as CartItem[];
        const sent = await sendEmail(
          profile.email,
          "Last chance — 10% OFF just for you! 🎉",
          buildStep3Email(profile.full_name || "there", items, event.total_value, discountCode)
        );

        if (sent) {
          await supabase
            .from("cart_abandonment_events")
            .update({
              step_3_sent_at: new Date().toISOString(),
              discount_code: discountCode,
            })
            .eq("id", event.id);
          results.step3++;
        }
      }
    }

    console.log("Recovery results:", results);
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("recover-abandoned-carts error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
