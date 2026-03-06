import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.json();
    console.log("Zoho webhook received:", JSON.stringify(payload).slice(0, 500));

    // Zoho sends different event types
    const eventType = payload.event_type || payload.event || "unknown";
    const item = payload.item || payload.data?.item || payload;

    const zohoItemId = String(item.item_id || "");
    if (!zohoItemId) {
      return new Response(
        JSON.stringify({ error: "No item_id in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Log the webhook
    await supabase.from("zoho_sync_log").insert({
      sync_type: "webhook_update",
      direction: "inbound",
      status: "pending",
      metadata: { event_type: eventType, zoho_item_id: zohoItemId },
    });

    // Map fields for update
    const updateData: Record<string, unknown> = {};
    if (item.name) updateData.name = String(item.name);
    if (item.rate !== undefined) updateData.price = Number(item.rate);
    if (item.purchase_rate !== undefined) updateData.cost_price = Number(item.purchase_rate);
    if (item.description !== undefined) updateData.description = String(item.description);
    if (item.status !== undefined) updateData.is_active = item.status === "active";
    if (item.sku) updateData.sku = String(item.sku);

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No updatable fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Update product by zoho_item_id
    const { error: updateError, count } = await supabase
      .from("products")
      .update(updateData)
      .eq("zoho_item_id", zohoItemId);

    // Update sync log
    await supabase
      .from("zoho_sync_log")
      .update({
        status: updateError ? "error" : "success",
        records_processed: updateError ? 0 : (count ?? 1),
        records_failed: updateError ? 1 : 0,
        error_details: updateError ? updateError : null,
        completed_at: new Date().toISOString(),
      })
      .eq("sync_type", "webhook_update")
      .eq("status", "pending")
      .order("started_at", { ascending: false })
      .limit(1);

    return new Response(
      JSON.stringify({ success: !updateError, updated: count ?? 0 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook error:", message);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
