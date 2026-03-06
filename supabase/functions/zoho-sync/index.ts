import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZOHO_TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";
const ZOHO_BOOKS_API = "https://www.zohoapis.com/books/v3";
const ITEMS_PER_PAGE = 200;

async function getAccessToken(): Promise<string> {
  const res = await fetch(ZOHO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: Deno.env.get("ZOHO_REFRESH_TOKEN")!,
      client_id: Deno.env.get("ZOHO_CLIENT_ID")!,
      client_secret: Deno.env.get("ZOHO_CLIENT_SECRET")!,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Zoho token refresh failed: ${data.error}`);
  return data.access_token;
}

async function fetchZohoItems(accessToken: string, orgId: string, page = 1) {
  const res = await fetch(
    `${ZOHO_BOOKS_API}/items?organization_id=${orgId}&page=${page}&per_page=${ITEMS_PER_PAGE}`,
    { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } },
  );
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Zoho API error: ${data.message}`);
  return { items: data.items || [], hasMore: data.page_context?.has_more_page || false };
}

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
    brand_line: "soteria_medical" as const,
    external_id: String(item.item_id),
  };
}

/** Process one page: batch upsert and return counts */
async function processPage(
  supabase: ReturnType<typeof createClient>,
  accessToken: string,
  orgId: string,
  page: number,
): Promise<{ processed: number; failed: number; hasMore: boolean }> {
  const { items, hasMore } = await fetchZohoItems(accessToken, orgId, page);

  if (items.length === 0) return { processed: 0, failed: 0, hasMore: false };

  const mapped = items.map(mapZohoItemToProduct);

  const { error: upsertError } = await supabase
    .from("products")
    .upsert(mapped, { onConflict: "zoho_item_id" });

  if (upsertError) {
    console.error(`Batch upsert failed on page ${page}:`, upsertError);
    return { processed: 0, failed: mapped.length, hasMore };
  }

  return { processed: mapped.length, failed: 0, hasMore };
}

/** Update sync log metadata with running totals */
async function updateSyncProgress(
  supabase: ReturnType<typeof createClient>,
  syncId: string,
  totalProcessed: number,
  totalFailed: number,
  currentPage: number,
  finalize: boolean,
) {
  const update: Record<string, unknown> = {
    records_processed: totalProcessed,
    records_failed: totalFailed,
    metadata: { total_processed: totalProcessed, total_failed: totalFailed, current_page: currentPage },
  };
  if (finalize) {
    update.status = totalFailed > 0 && totalProcessed === 0 ? "error" : "success";
    update.completed_at = new Date().toISOString();
  }
  await supabase.from("zoho_sync_log").update(update).eq("id", syncId);
}

/** Self-invoke to process the next page */
async function chainNextPage(
  syncId: string,
  page: number,
  accessToken: string,
  totalProcessed: number,
  totalFailed: number,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Fire-and-forget — don't await the full response
  fetch(`${supabaseUrl}/functions/v1/zoho-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      action: "pull_items_continue",
      page,
      sync_id: syncId,
      access_token: accessToken,
      total_processed: totalProcessed,
      total_failed: totalFailed,
    }),
  }).catch((err) => console.error("Chain invoke failed:", err));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const orgId = Deno.env.get("ZOHO_ORGANIZATION_ID")!;

  const body = req.method === "POST" ? await req.json() : {};
  const action = body.action || "pull_items";

  // ── Continuation call (self-invoked, uses service key) ──
  if (action === "pull_items_continue") {
    const { page, sync_id, access_token, total_processed = 0, total_failed = 0 } = body;

    try {
      const result = await processPage(supabase, access_token, orgId, page);
      const newProcessed = total_processed + result.processed;
      const newFailed = total_failed + result.failed;

      if (result.hasMore) {
        await updateSyncProgress(supabase, sync_id, newProcessed, newFailed, page, false);
        await chainNextPage(sync_id, page + 1, access_token, newProcessed, newFailed);
      } else {
        await updateSyncProgress(supabase, sync_id, newProcessed, newFailed, page, true);
      }

      return new Response(JSON.stringify({ success: true, page }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Page ${page} error:`, message);
      await updateSyncProgress(supabase, sync_id, total_processed, total_failed, page, true);
      await supabase.from("zoho_sync_log").update({ error_details: { message, page } }).eq("id", sync_id);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── Initial call (client-facing, requires auth) ──
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

  const { data: hasAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!hasAdmin) {
    return new Response(JSON.stringify({ error: "Forbidden — super_admin required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!orgId) {
    return new Response(JSON.stringify({ error: "ZOHO_ORGANIZATION_ID not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (action === "pull_items") {
    // Create sync log
    const { data: syncLog } = await supabase
      .from("zoho_sync_log")
      .insert({ sync_type: "pull_items", direction: "inbound", status: "pending", performed_by: userId })
      .select()
      .single();

    const syncId = syncLog?.id;
    if (!syncId) {
      return new Response(JSON.stringify({ error: "Failed to create sync log" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const accessToken = await getAccessToken();

      // Process page 1 immediately
      const result = await processPage(supabase, accessToken, orgId, 1);

      if (result.hasMore) {
        await updateSyncProgress(supabase, syncId, result.processed, result.failed, 1, false);
        await chainNextPage(syncId, 2, accessToken, result.processed, result.failed);
      } else {
        await updateSyncProgress(supabase, syncId, result.processed, result.failed, 1, true);
      }

      return new Response(
        JSON.stringify({
          success: true,
          action,
          sync_id: syncId,
          page_1_processed: result.processed,
          has_more: result.hasMore,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Zoho sync error:", message);
      await supabase
        .from("zoho_sync_log")
        .update({ status: "error", error_details: { message }, completed_at: new Date().toISOString() })
        .eq("id", syncId);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (action === "push_order") {
    const orderId = body.order_id;
    if (!orderId) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: syncLog } = await supabase
      .from("zoho_sync_log")
      .insert({ sync_type: "push_order", direction: "outbound", status: "pending", performed_by: userId })
      .select()
      .single();
    const syncId = syncLog?.id;

    try {
      const accessToken = await getAccessToken();
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("*, order_items(*, products(name, sku, zoho_item_id))")
        .eq("id", orderId)
        .single();

      if (orderErr || !order) throw new Error(`Order not found: ${orderId}`);

      const lineItems = (order.order_items || [])
        .filter((oi: any) => oi.products?.zoho_item_id)
        .map((oi: any) => ({
          item_id: oi.products.zoho_item_id,
          quantity: oi.quantity,
          rate: oi.price_at_purchase,
        }));

      if (lineItems.length === 0) throw new Error("No items with Zoho mapping found");

      const soRes = await fetch(`${ZOHO_BOOKS_API}/salesorders?organization_id=${orgId}`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          salesorder_number: order.order_number,
          date: order.created_at.split("T")[0],
          line_items: lineItems,
          notes: order.notes || "",
        }),
      });
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

      return new Response(JSON.stringify({ success: soData.code === 0, action, zoho_response: soData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      if (syncId) {
        await supabase
          .from("zoho_sync_log")
          .update({ status: "error", error_details: { message }, completed_at: new Date().toISOString() })
          .eq("id", syncId);
      }
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
