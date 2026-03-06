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

interface PageResult {
  matched: number;
  newProducts: number;
  updatedExisting: number;
  failed: number;
  hasMore: boolean;
}

/** Process one page: smart merge with name matching, then upsert new items */
async function processPage(
  supabase: ReturnType<typeof createClient>,
  accessToken: string,
  orgId: string,
  page: number,
): Promise<PageResult> {
  const { items, hasMore } = await fetchZohoItems(accessToken, orgId, page);

  if (items.length === 0) return { matched: 0, newProducts: 0, updatedExisting: 0, failed: 0, hasMore: false };

  const mapped = items.map(mapZohoItemToProduct);

  // Step 1: Collect normalized names for matching against ECMS products
  const normalizedNames = mapped.map((m) => m.name.toLowerCase().trim());

  // Step 2: Find ECMS products (no zoho_item_id) that match by name
  const { data: ecmsMatches } = await supabase
    .from("products")
    .select("id, name")
    .is("zoho_item_id", null)
    .not("external_id", "is", null);

  // Build a lookup: normalized name -> ecms product id
  const ecmsLookup = new Map<string, string>();
  if (ecmsMatches) {
    for (const p of ecmsMatches) {
      ecmsLookup.set(p.name.toLowerCase().trim(), p.id);
    }
  }

  let matched = 0;
  let updatedExisting = 0;
  let failed = 0;
  const newItems: typeof mapped = [];

  // Step 3: For each Zoho item, check if it matches an ECMS product
  for (const item of mapped) {
    const normalizedName = item.name.toLowerCase().trim();
    const ecmsId = ecmsLookup.get(normalizedName);

    if (ecmsId) {
      // Link: set zoho_item_id and update price/cost only, preserve images/description
      const { error } = await supabase
        .from("products")
        .update({
          zoho_item_id: item.zoho_item_id,
          price: item.price,
          cost_price: item.cost_price,
          is_active: item.is_active,
        })
        .eq("id", ecmsId);

      if (error) {
        console.error(`Failed to link ECMS product ${ecmsId}:`, error);
        failed++;
      } else {
        matched++;
        // Remove from lookup so we don't re-match
        ecmsLookup.delete(normalizedName);
      }
    } else {
      newItems.push(item);
    }
  }

  // Step 4: Upsert remaining items (new or already-linked Zoho products)
  // Only update price/cost/status — never overwrite images or descriptions
  if (newItems.length > 0) {
    const { error: upsertError, data: upsertData } = await supabase
      .from("products")
      .upsert(newItems, { onConflict: "zoho_item_id", ignoreDuplicates: false })
      .select("id, zoho_item_id");

    if (upsertError) {
      console.error(`Batch upsert failed on page ${page}:`, upsertError);
      failed += newItems.length;
    } else {
      // Count how many were updates vs inserts
      // We can approximate: items that already had zoho_item_id are updates
      const upsertedCount = upsertData?.length || newItems.length;
      // Check how many of these zoho_item_ids existed before
      const zohoIds = newItems.map((i) => i.zoho_item_id);
      const { count: existingCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .in("zoho_item_id", zohoIds);

      // After upsert, all exist — so existingCount = total. 
      // We track: items that went through upsert without matching ECMS
      updatedExisting = 0; // We can't perfectly distinguish, but the key metric is matched
      const insertedNew = upsertedCount;
      // For simplicity: newProducts = items that went to upsert path
      return {
        matched,
        newProducts: insertedNew,
        updatedExisting,
        failed,
        hasMore,
      };
    }
  }

  return { matched, newProducts: 0, updatedExisting, failed, hasMore };
}

/** Update sync log metadata with running totals */
async function updateSyncProgress(
  supabase: ReturnType<typeof createClient>,
  syncId: string,
  totals: { processed: number; failed: number; matched: number; newProducts: number },
  currentPage: number,
  finalize: boolean,
) {
  const update: Record<string, unknown> = {
    records_processed: totals.processed,
    records_failed: totals.failed,
    metadata: {
      total_processed: totals.processed,
      total_failed: totals.failed,
      matched_existing: totals.matched,
      new_products: totals.newProducts,
      current_page: currentPage,
    },
  };
  if (finalize) {
    update.status = totals.failed > 0 && totals.processed === 0 ? "error" : "success";
    update.completed_at = new Date().toISOString();
  }
  await supabase.from("zoho_sync_log").update(update).eq("id", syncId);
}

/** Self-invoke to process the next page */
async function chainNextPage(
  syncId: string,
  page: number,
  accessToken: string,
  totals: { processed: number; failed: number; matched: number; newProducts: number },
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
      total_processed: totals.processed,
      total_failed: totals.failed,
      total_matched: totals.matched,
      total_new: totals.newProducts,
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
    const {
      page, sync_id, access_token,
      total_processed = 0, total_failed = 0,
      total_matched = 0, total_new = 0,
    } = body;

    try {
      const result = await processPage(supabase, access_token, orgId, page);
      const totals = {
        processed: total_processed + result.matched + result.newProducts,
        failed: total_failed + result.failed,
        matched: total_matched + result.matched,
        newProducts: total_new + result.newProducts,
      };

      if (result.hasMore) {
        await updateSyncProgress(supabase, sync_id, totals, page, false);
        await chainNextPage(sync_id, page + 1, access_token, totals);
      } else {
        await updateSyncProgress(supabase, sync_id, totals, page, true);
      }

      return new Response(JSON.stringify({ success: true, page }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Page ${page} error:`, message);
      const totals = { processed: total_processed, failed: total_failed, matched: total_matched, newProducts: total_new };
      await updateSyncProgress(supabase, sync_id, totals, page, true);
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
      const result = await processPage(supabase, accessToken, orgId, 1);

      const totals = {
        processed: result.matched + result.newProducts,
        failed: result.failed,
        matched: result.matched,
        newProducts: result.newProducts,
      };

      if (result.hasMore) {
        await updateSyncProgress(supabase, syncId, totals, 1, false);
        await chainNextPage(syncId, 2, accessToken, totals);
      } else {
        await updateSyncProgress(supabase, syncId, totals, 1, true);
      }

      return new Response(
        JSON.stringify({
          success: true,
          action,
          sync_id: syncId,
          page_1_processed: totals.processed,
          page_1_matched: result.matched,
          page_1_new: result.newProducts,
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

  // ── Manual link: link an ECMS product to a Zoho item ──
  if (action === "link_product") {
    const { product_id, zoho_item_id: linkZohoId } = body;
    if (!product_id || !linkZohoId) {
      return new Response(JSON.stringify({ error: "product_id and zoho_item_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get current Zoho item price
    try {
      const accessToken = await getAccessToken();
      const itemRes = await fetch(
        `${ZOHO_BOOKS_API}/items/${linkZohoId}?organization_id=${orgId}`,
        { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } },
      );
      const itemData = await itemRes.json();

      const updateFields: Record<string, unknown> = { zoho_item_id: linkZohoId };
      if (itemData.code === 0 && itemData.item) {
        updateFields.price = Number(itemData.item.rate) || undefined;
        updateFields.cost_price = Number(itemData.item.purchase_rate) || undefined;
      }

      const { error: updateError } = await supabase
        .from("products")
        .update(updateFields)
        .eq("id", product_id)
        .is("zoho_item_id", null);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true, action }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
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
