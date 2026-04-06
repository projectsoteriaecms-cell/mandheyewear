import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const PAYSTACK_BASE = "https://api.paystack.co";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const { action, ...body } = await req.json();

    if (action === "initialize") {
      return await handleInitialize(body, userId);
    } else if (action === "verify") {
      return await handleVerify(body, userId, supabase);
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Paystack function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleInitialize(
  body: { email: string; amount: number; metadata: Record<string, unknown> },
  userId: string
) {
  const { email, amount, metadata } = body;

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount, // already in kobo
      metadata: { ...metadata, user_id: userId },
      currency: "NGN",
    }),
  });

  const data = await res.json();

  if (!data.status) {
    return new Response(
      JSON.stringify({ error: data.message || "Failed to initialize payment" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code,
      reference: data.data.reference,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function handleVerify(
  body: { reference: string },
  userId: string,
  supabase: ReturnType<typeof createClient>
) {
  const { reference } = body;

  // Verify with Paystack
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  });

  const data = await res.json();

  if (!data.status || data.data.status !== "success") {
    return new Response(
      JSON.stringify({ error: "Payment verification failed" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const paymentData = data.data;
  const metadata = paymentData.metadata || {};
  const shippingAddress = metadata.shipping_address || {};
  const totalAmount = paymentData.amount / 100; // Convert kobo to naira

  // Read cart items from the database (not from Paystack metadata — metadata has size limits)
  const { data: dbCartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("product_id, quantity, product:products(price)")
    .eq("user_id", userId);

  if (cartError) {
    console.error("Failed to fetch cart items from DB:", cartError);
  }

  const cartItems = (dbCartItems || []).map((ci: any) => ({
    product_id: ci.product_id,
    quantity: ci.quantity,
    price: ci.product?.price || 0,
  }));

  console.log(`Verify: userId=${userId}, cartItems=${cartItems.length}, totalAmount=${totalAmount}`);

  if (cartItems.length === 0) {
    // Fallback: try Paystack metadata (for backward compatibility)
    const metaCartItems = metadata.cart_items || [];
    console.log(`No DB cart items, falling back to metadata: ${metaCartItems.length} items`);
    cartItems.push(...metaCartItems);
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      total_amount: totalAmount,
      payment_status: "paid",
      order_status: "confirmed",
      payment_reference: reference,
      shipping_address: shippingAddress,
      currency: "NGN",
      notes: metadata.delivery_instructions || null,
    })
    .select()
    .single();

  if (orderError) {
    console.error("Order creation error:", orderError);
    return new Response(
      JSON.stringify({ error: "Failed to create order" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Create order items
  if (cartItems.length > 0) {
    const orderItems = cartItems.map(
      (item: { product_id: string; quantity: number; price: number }) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.price,
      })
    );

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
    } else {
      console.log(`Inserted ${orderItems.length} order items for order ${order.id}`);
    }
  } else {
    console.warn(`No cart items found for user ${userId} — order ${order.id} has no line items`);
  }

  // Clear user's cart
  await supabase.from("cart_items").delete().eq("user_id", userId);

  return new Response(
    JSON.stringify({
      order_id: order.id,
      order_number: order.order_number,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
