import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.91.1";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Missing configuration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { user_id, template } = await req.json();

    if (!user_id || !template) {
      return new Response(JSON.stringify({ error: "user_id and template are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("user_id", user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ error: "User email not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get recently viewed products for personalized content
    const { data: activities } = await supabase
      .from("user_activity")
      .select("product_id")
      .eq("user_id", user_id)
      .eq("activity_type", "product_view")
      .not("product_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);

    const productIds = [...new Set((activities || []).map((a: { product_id: string }) => a.product_id))].slice(0, 4);

    let productHtml = "";
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("name, price, image_url, id")
        .in("id", productIds)
        .eq("is_active", true);

      if (products?.length) {
        productHtml = products
          .map(
            (p: { name: string; price: number; image_url: string | null; id: string }) => `
          <div style="display:inline-block;width:48%;margin:1%;vertical-align:top;text-align:center;">
            ${p.image_url ? `<img src="${p.image_url}" alt="${p.name}" style="width:100%;max-width:200px;border-radius:8px;" />` : ""}
            <p style="font-weight:600;margin:8px 0 4px;">${p.name}</p>
            <p style="color:#b8860b;font-weight:700;">₦${p.price.toLocaleString()}</p>
            <a href="https://soteriaeyeclinic.lovable.app/product/${p.id}" style="display:inline-block;background:#b8860b;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;margin-top:8px;">View Frame</a>
          </div>
        `
          )
          .join("");
      }
    }

    const emailHtml = `
      <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;">
        <div style="text-align:center;padding:24px 0;border-bottom:2px solid #b8860b;">
          <h1 style="font-size:24px;margin:0;">M&H Eyewear</h1>
        </div>
        <div style="padding:32px 24px;">
          <h2 style="font-size:20px;">Hi ${profile.full_name || "there"} 👋</h2>
          <p>We noticed you've been browsing some great frames! Here are some picks we think you'll love:</p>
          ${productHtml || "<p>Check out our latest collection of designer frames.</p>"}
          <div style="text-align:center;margin-top:32px;">
            <a href="https://soteriaeyeclinic.lovable.app/eyewear" style="display:inline-block;background:#b8860b;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Shop All Frames</a>
          </div>
        </div>
        <div style="text-align:center;padding:16px;color:#999;font-size:12px;border-top:1px solid #eee;">
          <p>M&H Eyewear • Premium Eye Care in Nigeria</p>
        </div>
      </div>
    `;

    const emailRes = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "M&H Eyewear <noreply@notify.mandheyewear.com>",
        to: [profile.email],
        subject: template === "browsing_digest" ? "Frames you might love 👓" : "New arrivals at M&H Eyewear",
        html: emailHtml,
      }),
    });

    const result = await emailRes.json();

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
