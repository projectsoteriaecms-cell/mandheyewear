import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const SENDER = "M&H Eyewear <noreply@notify.mandheyewear.com>";
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

function buildNudgeEmail(
  name: string,
  productName: string,
  productImage: string,
  price: number,
  productId: string
): string {
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9f9f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
  <div style="background:#1a1a2e;color:#fff;padding:24px;">
    <h1 style="margin:0;font-size:22px;">Still eyeing this? 👓</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:16px;color:#333;">Hi ${name},</p>
    <p style="font-size:14px;color:#555;line-height:1.6;">
      We noticed you've been checking out this frame. Great taste! Here's a closer look:
    </p>
    <div style="text-align:center;margin:24px 0;">
      ${productImage ? `<img src="${productImage}" alt="${productName}" style="max-width:300px;border-radius:8px;" />` : ""}
      <h2 style="font-size:18px;color:#1a1a2e;margin:12px 0 4px;">${productName}</h2>
      <p style="font-size:20px;color:#FF5A36;font-weight:bold;margin:0;">₦${price.toLocaleString()}</p>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${SITE_URL}/product/${productId}" style="display:inline-block;background:#FF5A36;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;">View This Frame →</a>
    </div>
    <div style="text-align:center;margin-top:16px;">
      <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%20have%20a%20question%20about%20${encodeURIComponent(productName)}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-size:14px;">💬 Ask us about this frame</a>
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

    let nudgesSent = 0;
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Find users who viewed the same product 3+ times in the last 2 hours
    const { data: frequentViews, error: viewErr } = await supabase
      .rpc("get_browse_abandonment_candidates", {
        since_time: twoHoursAgo,
        min_views: 3,
      })
      .catch(() => ({ data: null, error: "rpc not found" }));

    // Fallback: manual query if RPC doesn't exist
    let candidates: { user_id: string; product_id: string; view_count: number }[] = [];

    if (frequentViews) {
      candidates = frequentViews;
    } else {
      // Direct query approach
      const { data: views } = await supabase
        .from("user_activity")
        .select("user_id, product_id")
        .eq("activity_type", "product_view")
        .gte("created_at", twoHoursAgo)
        .not("product_id", "is", null);

      if (views) {
        const viewCounts: Record<string, { user_id: string; product_id: string; count: number }> = {};
        for (const v of views) {
          const key = `${v.user_id}:${v.product_id}`;
          if (!viewCounts[key]) {
            viewCounts[key] = { user_id: v.user_id, product_id: v.product_id!, count: 0 };
          }
          viewCounts[key].count++;
        }
        candidates = Object.values(viewCounts)
          .filter((v) => v.count >= 3)
          .map((v) => ({ user_id: v.user_id, product_id: v.product_id, view_count: v.count }));
      }
    }

    for (const candidate of candidates) {
      // Check if user already has this product in cart
      const { data: cartCheck } = await supabase
        .from("cart_items")
        .select("id")
        .eq("user_id", candidate.user_id)
        .eq("product_id", candidate.product_id)
        .limit(1);

      if (cartCheck && cartCheck.length > 0) continue;

      // Rate limit: max 1 nudge per user per 24h
      const { data: recentNudge } = await supabase
        .from("browse_nudge_log")
        .select("id")
        .eq("user_id", candidate.user_id)
        .gte("sent_at", twentyFourHoursAgo)
        .limit(1);

      if (recentNudge && recentNudge.length > 0) continue;

      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("user_id", candidate.user_id)
        .single();

      if (!profile?.email) continue;

      // Get product info
      const { data: product } = await supabase
        .from("products")
        .select("name, image_url, price")
        .eq("id", candidate.product_id)
        .single();

      if (!product) continue;

      const sent = await sendEmail(
        profile.email,
        `Still eyeing ${product.name}? 👓`,
        buildNudgeEmail(
          profile.full_name || "there",
          product.name,
          product.image_url || "",
          product.price,
          candidate.product_id
        )
      );

      if (sent) {
        await supabase.from("browse_nudge_log").insert({
          user_id: candidate.user_id,
          product_id: candidate.product_id,
        });
        nudgesSent++;
      }
    }

    console.log(`Browse nudges sent: ${nudgesSent}`);
    return new Response(JSON.stringify({ success: true, nudges_sent: nudgesSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("browse-abandonment-nudge error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
