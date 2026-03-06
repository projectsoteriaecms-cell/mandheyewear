import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZOHO_TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";
const ZOHO_BOOKS_API = "https://www.zohoapis.com/books/v3";

/** Refresh the Zoho access token using the stored refresh token */
async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get("ZOHO_CLIENT_ID")!;
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")!;
  const refreshToken = Deno.env.get("ZOHO_REFRESH_TOKEN")!;

  const res = await fetch(ZOHO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`Zoho token refresh failed: ${data.error}`);
  return data.access_token;
}

/** Fetch items from Zoho Books */
async function fetchZohoItems(accessToken: string, orgId: string, page = 1) {
  const res = await fetch(
    `${ZOHO_BOOKS_API}/items?organization_id=${orgId}&page=${page}&per_page=200`,
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } },
  );
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Zoho API error: ${data.message}`);
  return { items: data.items || [], hasMore: data.page_context?.has_more_page || false };
}

/** Map a Zoho item to a product upsert payload */
function mapZohoItemToProduct(item: Record<string, unknown>) {
  return {
    zoho_item_id: String(item.item_id),
    name: String(item.name || "Unnamed"),
    sku: String(item.sku || item.item_id),
    price: Number(item.rate) || 0,
    cost_price: Number(item.purchase_rate) || null,
    description: item.description ? String(item.description) : null,
    brand: item.brand ? String(item.brand) : null,
    is_active: item.status === "active",
    brand_line: "soteria_medical" as const, // default; can be overridden
    external_id: String(item.item_id),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authenticate the caller
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user is super_admin
  const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: claimsData, error: claimsError } = await anonClient.auth.getUser();
  if (claimsError || !claimsData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.user.id;

  // Check role
  const { data: hasAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin",
  });
  if (!hasAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orgId = Deno.env.get("ZOHO_ORGANIZATION_ID")!;
  if (!orgId) {
    return new Response(JSON.stringify({ error: "ZOHO_ORGANIZATION_ID not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = req.method === "POST" ? await req.json() : {};
  const action = body.action || "pull_items";

  // Create sync log entry
  const { data: syncLog } = await supabase
    .from("zoho_sync_log")
    .insert({
      sync_type: action,
      direction: action === "push_order" ? "outbound" : "inbound",
      status: "pending",
      performed_by: userId,
    })
    .select()
    .single();

  const syncId = syncLog?.id;

  try {
    const accessToken = await getAccessToken();

    if (action === "pull_items") {
      let page = 1;
      let totalProcessed = 0;
      let totalFailed = 0;
      let hasMore = true;

      while (hasMore) {
        const { items, hasMore: more } = await fetchZohoItems(accessToken, orgId, page);
        hasMore = more;

        for (const item of items) {
          try {
            const mapped = mapZohoItemToProduct(item);

            // Upsert by zoho_item_id
            const { error: upsertError } = await supabase
              .from("products")
              .upsert(mapped, { onConflict: "zoho_item_id" });

            if (upsertError) {
              console.error(`Failed to upsert item ${item.item_id}:`, upsertError);
              totalFailed++;
            } else {
              totalProcessed++;
            }
          } catch (e) {
            console.error(`Error processing item ${item.item_id}:`, e);
            totalFailed++;
          }
        }

        page++;
      }

      // Update sync log
      if (syncId) {
        await supabase
          .from("zoho_sync_log")
          .update({
            status: totalFailed > 0 ? "error" : "success",
            records_processed: totalProcessed,
            records_failed: totalFailed,
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncId);
      }

      return new Response(
        JSON.stringify({
          success: true,
          action,
          records_processed: totalProcessed,
          records_failed: totalFailed,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "push_order") {
      const orderId = body.order_id;
      if (!orderId) {
        throw new Error("order_id is required for push_order");
      }

      // Fetch order with items
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, sku, zoho_item_id))")
        .eq("id", orderId)
        .single();

      if (orderErr || !order) throw new Error(`Order not found: ${orderId}`);

      // Build Zoho sales order payload
      const lineItems = (order.order_items || [])
        .filter((oi: any) => oi.products?.zoho_item_id)
        .map((oi: any) => ({
          item_id: oi.products.zoho_item_id,
          quantity: oi.quantity,
          rate: oi.price_at_purchase,
        }));

      if (lineItems.length === 0) {
        throw new Error("No items with Zoho mapping found in this order");
      }

      const zohoPayload = {
        salesorder_number: order.order_number,
        date: order.created_at.split("T")[0],
        line_items: lineItems,
        notes: order.notes || "",
      };

      const soRes = await fetch(
        `${ZOHO_BOOKS_API}/salesorders?organization_id=${orgId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Zoho-oauthtoken ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(zohoPayload),
        },
      );

      const soData = await soRes.json();

      if (syncId) {
        await supabase
          .from("zoho_sync_log")
          .update({
            status: soData.code === 0 ? "success" : "error",
            records_processed: soData.code === 0 ? 1 : 0,
            records_failed: soData.code === 0 ? 0 : 1,
            error_details: soData.code !== 0 ? soData : null,
            metadata: { zoho_salesorder_id: soData.salesorder?.salesorder_id },
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncId);
      }

      return new Response(
        JSON.stringify({
          success: soData.code === 0,
          action,
          zoho_response: soData,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: `Unknown action: ${action}` }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Zoho sync error:", message);

    if (syncId) {
      await supabase
        .from("zoho_sync_log")
        .update({
          status: "error",
          error_details: { message },
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncId);
    }

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
