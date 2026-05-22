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
    brand_line: "m_and_h_fashion" as const,
    external_id: String(item.item_id),
  };
}


// ── Stock sync types ──
interface WarehouseMapping {
  zoho_location_id: string;
  branch_id: string;
}

interface StockSyncResult {
  stockUpdated: number;
  stockSkipped: number;
  locationsDiscovered: string[];
}

/** Load warehouse mappings from DB */
async function loadWarehouseMappings(
  supabase: ReturnType<typeof createClient>,
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("zoho_warehouse_mapping")
    .select("zoho_location_id, branch_id");
  const map = new Map<string, string>();
  if (data) {
    for (const row of data as WarehouseMapping[]) {
      map.set(row.zoho_location_id, row.branch_id);
    }
  }
  return map;
}

/** Get head office branch as default fallback */
async function getDefaultBranch(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  // First check for __default__ mapping
  const { data: defaultMapping } = await supabase
    .from("zoho_warehouse_mapping")
    .select("branch_id")
    .eq("zoho_location_id", "__default__")
    .maybeSingle();
  if (defaultMapping?.branch_id) return defaultMapping.branch_id;

  // Fall back to head office
  const { data } = await supabase
    .from("branches")
    .select("id")
    .eq("is_head_office", true)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

/** Auto-discover Zoho locations and insert unmapped ones */
async function discoverLocations(
  supabase: ReturnType<typeof createClient>,
  items: Record<string, unknown>[],
): Promise<void> {
  const locationSet = new Map<string, string>();
  for (const item of items) {
    const warehouses = item.warehouses as Array<Record<string, unknown>> | undefined;
    if (warehouses && Array.isArray(warehouses)) {
      for (const wh of warehouses) {
        const locId = String(wh.warehouse_id || "");
        const locName = String(wh.warehouse_name || "");
        if (locId && !locationSet.has(locId)) {
          locationSet.set(locId, locName);
        }
      }
    }
  }

  if (locationSet.size === 0) return;

  // Check which ones already exist
  const { data: existing } = await supabase
    .from("zoho_warehouse_mapping")
    .select("zoho_location_id")
    .in("zoho_location_id", Array.from(locationSet.keys()));

  const existingIds = new Set((existing || []).map((e: { zoho_location_id: string }) => e.zoho_location_id));

  // We won't auto-insert unmapped ones since they need a branch_id (NOT NULL).
  // Instead we log them for the admin to map manually.
  for (const [locId, locName] of locationSet) {
    if (!existingIds.has(locId)) {
      console.log(`Discovered unmapped Zoho location: ${locId} (${locName})`);
    }
  }
}

/** Sync stock levels for a batch of Zoho items */
async function syncStockForItems(
  supabase: ReturnType<typeof createClient>,
  rawItems: Record<string, unknown>[],
  warehouseMappings: Map<string, string>,
  defaultBranchId: string | null,
  performedBy: string,
): Promise<StockSyncResult> {
  let stockUpdated = 0;
  let stockSkipped = 0;
  const locationsDiscovered: string[] = [];

  // Diagnostic: log first 3 items' stock data
  for (let i = 0; i < Math.min(3, rawItems.length); i++) {
    const item = rawItems[i];
    const warehouses = item.warehouses as Array<Record<string, unknown>> | undefined;
    console.log(`[STOCK DIAG] Item ${i}: name="${item.name}", stock_on_hand=${item.stock_on_hand}, available_stock=${item.available_stock}, actual_available_stock=${item.actual_available_stock}, item_type="${item.item_type}", has_warehouses=${!!(warehouses && warehouses.length > 0)}, warehouse_count=${warehouses?.length ?? 0}`);
  }

  for (const item of rawItems) {
    const zohoItemId = String(item.item_id);

    // Find the local product_id for this Zoho item
    const { data: product } = await supabase
      .from("products")
      .select("id")
      .eq("zoho_item_id", zohoItemId)
      .maybeSingle();

    if (!product) continue;

    const productId = product.id;
    const warehouses = item.warehouses as Array<Record<string, unknown>> | undefined;

    if (warehouses && Array.isArray(warehouses) && warehouses.length > 0) {
      // Per-warehouse stock sync
      for (const wh of warehouses) {
        const locId = String(wh.warehouse_id || "");
        const locName = String(wh.warehouse_name || "");
        const stockOnHand = Number(wh.warehouse_actual_available_stock ?? wh.warehouse_available_stock ?? wh.warehouse_stock_on_hand ?? 0);

        if (!locId) continue;

        const branchId = warehouseMappings.get(locId);
        if (!branchId) {
          locationsDiscovered.push(`${locId}:${locName}`);
          stockSkipped++;
          continue;
        }

        await upsertInventory(supabase, productId, branchId, stockOnHand, performedBy, `Zoho warehouse: ${locName}`);
        stockUpdated++;
      }
    } else {
      // Use actual_available_stock (preferred) or available_stock or stock_on_hand from Zoho
      const stockOnHand = Number(item.actual_available_stock ?? item.available_stock ?? item.stock_on_hand ?? 0);
      if (defaultBranchId) {
        await upsertInventory(supabase, productId, defaultBranchId, stockOnHand, performedBy, "Zoho total stock (no warehouse data)");
        stockUpdated++;
      } else {
        console.log(`[STOCK SKIP] No default branch configured, skipping ${item.name}`);
        stockSkipped++;
      }
    }
  }

  return { stockUpdated, stockSkipped, locationsDiscovered };
}

/** Upsert a single inventory record and log the transaction */
async function upsertInventory(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  branchId: string,
  newQuantity: number,
  performedBy: string,
  notes: string,
) {
  // Get current inventory
  const { data: existing } = await supabase
    .from("inventory")
    .select("id, quantity_on_hand")
    .eq("product_id", productId)
    .eq("branch_id", branchId)
    .maybeSingle();

  const quantityBefore = existing?.quantity_on_hand ?? 0;

  // Skip if no change AND record already exists (don't skip if we need to create)
  if (existing && quantityBefore === newQuantity) return;

  if (existing) {
    await supabase
      .from("inventory")
      .update({
        quantity_on_hand: newQuantity,
        last_received_date: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("inventory")
      .insert({
        product_id: productId,
        branch_id: branchId,
        quantity_on_hand: newQuantity,
        quantity_reserved: 0,
        last_received_date: new Date().toISOString().split("T")[0],
      });
  }

  // Log transaction
  await supabase.from("inventory_transactions").insert({
    product_id: productId,
    branch_id: branchId,
    transaction_type: "zoho_sync",
    quantity_change: newQuantity - quantityBefore,
    quantity_before: quantityBefore,
    quantity_after: newQuantity,
    reference_type: "zoho_sync",
    performed_by: performedBy,
    notes,
  });
}

interface PageResult {
  matched: number;
  newProducts: number;
  updatedExisting: number;
  failed: number;
  hasMore: boolean;
  stockUpdated: number;
  stockSkipped: number;
  fuzzyMatched: number;
}

// ── Fuzzy matching helpers ──

/** Strip common ECMS prefixes like "Frame : ", "ACCESSORIES : ", "Ropes : " etc. */
function stripNamePrefix(name: string): string {
  return name.replace(/^(Frame|FRAME|Frames|FRAMES|ACCESSORIES|Ropes|Sunglasses|Contact Lenses?|Lenses?|Solutions?|Medications?|Cleanser|Packaging)\s*:\s*/i, "").trim();
}

/** Tokenize a product name into lowercase tokens for comparison */
function tokenizeName(name: string): Set<string> {
  const stripped = stripNamePrefix(name);
  // Remove generic noise words
  const cleaned = stripped
    .replace(/\bFRAME\b/gi, "")
    .replace(/\bFRAMES\b/gi, "")
    .toLowerCase()
    .trim();
  // Split on spaces, hyphens (keeping hyphenated tokens too), slashes
  const tokens = cleaned.split(/[\s]+/).filter(t => t.length > 0);
  return new Set(tokens);
}

/** Compute Jaccard similarity between two token sets */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Process one page: smart merge with name matching + fuzzy matching, then upsert new items, then sync stock */
async function processPage(
  supabase: ReturnType<typeof createClient>,
  accessToken: string,
  orgId: string,
  page: number,
  warehouseMappings: Map<string, string>,
  defaultBranchId: string | null,
  performedBy: string,
): Promise<PageResult> {
  const { items, hasMore } = await fetchZohoItems(accessToken, orgId, page);

  if (items.length === 0) return { matched: 0, newProducts: 0, updatedExisting: 0, failed: 0, hasMore: false, stockUpdated: 0, stockSkipped: 0, fuzzyMatched: 0 };

  const mapped = items.map(mapZohoItemToProduct);

  // M&H-only sync: pull is read-only on the catalog side.
  // We never insert products from Zoho — the M&H catalog is curated.
  // For each Zoho item, find a matching M&H product (by zoho_item_id, then SKU, then name)
  // and update its price/stock. Unmatched Zoho items are ignored.
  const { data: mhProducts } = await supabase
    .from("products")
    .select("id, name, sku, zoho_item_id")
    .eq("brand_line", "m_and_h_fashion");

  const byZohoId = new Map<string, string>();
  const bySku = new Map<string, string>();
  const byName = new Map<string, string>();
  const tokenized: Array<{ id: string; tokens: Set<string> }> = [];
  if (mhProducts) {
    for (const p of mhProducts) {
      if (p.zoho_item_id) byZohoId.set(String(p.zoho_item_id), p.id);
      if (p.sku) bySku.set(p.sku.toLowerCase().trim(), p.id);
      if (p.name) byName.set(p.name.toLowerCase().trim(), p.id);
      tokenized.push({ id: p.id, tokens: tokenizeName(p.name || "") });
    }
  }

  let matched = 0;
  let fuzzyMatched = 0;
  let updatedExisting = 0;
  let failed = 0;
  const matchedIds = new Set<string>();

  for (const item of mapped) {
    let productId: string | undefined =
      byZohoId.get(item.zoho_item_id) ||
      bySku.get(item.sku.toLowerCase().trim()) ||
      byName.get(item.name.toLowerCase().trim());
    let matchType: "exact" | "fuzzy" = "exact";

    if (!productId) {
      // Fuzzy match by tokenized name
      const zohoTokens = tokenizeName(item.name);
      let bestScore = 0;
      let bestId: string | null = null;
      for (const p of tokenized) {
        if (matchedIds.has(p.id)) continue;
        const score = jaccardSimilarity(zohoTokens, p.tokens);
        if (score > bestScore) { bestScore = score; bestId = p.id; }
      }
      if (bestScore >= 0.6 && bestId) { productId = bestId; matchType = "fuzzy"; }
    }

    if (!productId || matchedIds.has(productId)) continue; // ignore unmatched Zoho items

    const { error } = await supabase
      .from("products")
      .update({
        zoho_item_id: item.zoho_item_id,
        price: item.price,
        cost_price: item.cost_price,
        is_active: item.is_active,
      })
      .eq("id", productId);

    if (error) { failed++; continue; }
    matchedIds.add(productId);
    if (matchType === "fuzzy") fuzzyMatched++; else matched++;
    updatedExisting++;
  }

  // Sync stock for matched M&H items (syncStockForItems no-ops on unlinked products)
  await discoverLocations(supabase, items);
  const stockResult = await syncStockForItems(supabase, items, warehouseMappings, defaultBranchId, performedBy);


  return { matched, fuzzyMatched, newProducts: 0, updatedExisting, failed, hasMore, stockUpdated: stockResult.stockUpdated, stockSkipped: stockResult.stockSkipped };
}


/** Update sync log metadata with running totals */
async function updateSyncProgress(
  supabase: ReturnType<typeof createClient>,
  syncId: string,
  totals: { processed: number; failed: number; matched: number; newProducts: number; stockUpdated: number; stockSkipped: number; fuzzyMatched?: number },
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
      fuzzy_matched: totals.fuzzyMatched || 0,
      new_products: totals.newProducts,
      current_page: currentPage,
      stock_updated: totals.stockUpdated,
      stock_skipped: totals.stockSkipped,
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
  totals: { processed: number; failed: number; matched: number; newProducts: number; stockUpdated: number; stockSkipped: number; fuzzyMatched?: number },
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
      total_stock_updated: totals.stockUpdated,
      total_stock_skipped: totals.stockSkipped,
      total_fuzzy_matched: totals.fuzzyMatched || 0,
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
      total_stock_updated = 0, total_stock_skipped = 0,
      total_fuzzy_matched = 0,
    } = body;

    // Load warehouse mappings and default branch for stock sync
    const warehouseMappings = await loadWarehouseMappings(supabase);
    const defaultBranchId = await getDefaultBranch(supabase);

    // Get performed_by from sync log
    const { data: syncLogData } = await supabase
      .from("zoho_sync_log")
      .select("performed_by")
      .eq("id", sync_id)
      .maybeSingle();
    const performedBy = syncLogData?.performed_by || "00000000-0000-0000-0000-000000000000";

    try {
      const result = await processPage(supabase, access_token, orgId, page, warehouseMappings, defaultBranchId, performedBy);
      const totals = {
        processed: total_processed + result.matched + result.fuzzyMatched + result.newProducts,
        failed: total_failed + result.failed,
        matched: total_matched + result.matched,
        fuzzyMatched: total_fuzzy_matched + result.fuzzyMatched,
        newProducts: total_new + result.newProducts,
        stockUpdated: total_stock_updated + result.stockUpdated,
        stockSkipped: total_stock_skipped + result.stockSkipped,
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
      const totals = { processed: total_processed, failed: total_failed, matched: total_matched, newProducts: total_new, stockUpdated: total_stock_updated, stockSkipped: total_stock_skipped };
      await updateSyncProgress(supabase, sync_id, totals, page, true);
      await supabase.from("zoho_sync_log").update({ error_details: { message, page } }).eq("id", sync_id);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── Sync stock continuation (self-invoked) ──
  if (action === "sync_stock_continue") {
    const {
      page, sync_id, access_token,
      total_stock_updated = 0, total_stock_skipped = 0, total_processed = 0,
    } = body;

    const warehouseMappings = await loadWarehouseMappings(supabase);
    const defaultBranchId = warehouseMappings.get("__default__") || await getDefaultBranch(supabase);

    const { data: syncLogData } = await supabase
      .from("zoho_sync_log")
      .select("performed_by")
      .eq("id", sync_id)
      .maybeSingle();
    const performedBy = syncLogData?.performed_by || "00000000-0000-0000-0000-000000000000";

    try {
      const { items, hasMore } = await fetchZohoItems(access_token, orgId, page);
      const stockResult = await syncStockForItems(supabase, items, warehouseMappings, defaultBranchId, performedBy);

      const totals = {
        processed: total_processed + items.length,
        failed: 0,
        matched: 0,
        newProducts: 0,
        stockUpdated: total_stock_updated + stockResult.stockUpdated,
        stockSkipped: total_stock_skipped + stockResult.stockSkipped,
      };

      if (hasMore) {
        await updateSyncProgress(supabase, sync_id, totals, page, false);
        // Chain next page for stock sync
        const sUrl = Deno.env.get("SUPABASE_URL")!;
        const sKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        fetch(`${sUrl}/functions/v1/zoho-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sKey}` },
          body: JSON.stringify({
            action: "sync_stock_continue",
            page: page + 1,
            sync_id,
            access_token,
            total_stock_updated: totals.stockUpdated,
            total_stock_skipped: totals.stockSkipped,
            total_processed: totals.processed,
          }),
        }).catch((err) => console.error("Stock sync chain failed:", err));
      } else {
        await updateSyncProgress(supabase, sync_id, totals, page, true);
      }

      return new Response(JSON.stringify({ success: true, page }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`Stock sync page ${page} error:`, message);
      const totals = { processed: total_processed, failed: 0, matched: 0, newProducts: 0, stockUpdated: total_stock_updated, stockSkipped: total_stock_skipped };
      await updateSyncProgress(supabase, sync_id, totals, page, true);
      await supabase.from("zoho_sync_log").update({ status: "error", error_details: { message, page } }).eq("id", sync_id);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // ── Debug stock: fetch a few items from Zoho and return raw stock data (no auth required) ──
  if (action === "debug_stock") {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(
        `${ZOHO_BOOKS_API}/items?organization_id=${orgId}&page=1&per_page=5`,
        { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } },
      );
      const data = await res.json();
      const sample = (data.items || []).slice(0, 5).map((item: Record<string, unknown>) => ({
        name: item.name,
        item_id: item.item_id,
        sku: item.sku,
        stock_on_hand: item.stock_on_hand,
        available_stock: item.available_stock,
        actual_available_stock: item.actual_available_stock,
        item_type: item.item_type,
        is_combo_product: item.is_combo_product,
        warehouses: item.warehouses,
        has_warehouses: !!(item.warehouses && (item.warehouses as unknown[]).length > 0),
      }));
      return new Response(JSON.stringify({ success: true, sample_items: sample, page_context: data.page_context }), {
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

  // ─── fix_brand_images: bulk remove packaging shots & fix primary images (no auth) ───
  if (action === "fix_brand_images") {
    try {
      const KNOWN_BRANDS = [
        'GUCCI','VERSACE','PRADA','EMPORIO ARMANI','BURBERRY','CARTIER',
        'MONT BLANC','DOLCE & GABBANA','TOM FORD','MARC JACOBS','SWAROVSKI',
        'MIU MIU','CAROLINA HERRERA','TIFFANY & CO','BALENCIAGA','BVLGARI',
        'JIMMY CHOO','CHOPARD','GENTLE MONSTER','CHROME HEART','LINDA FARROW',
        'MCM','MOSCHINO','POLAROID','CARRERA','CARRERA DUCATI','TED BAKER',
        'TOMMY HILFIGER','RAYBAN','RAY-BAN','POLO RALPH LAUREN','HUGO',
        'HUGO BOSS','DAVID BECKHAM','VICTORIA BECKHAM','GUESS','OAKLEY',
        'ARNETTE','VOGUE','LEVI','PUMA','CALVIN KLEIN','SANDRO','DKNY',
        'ARMANI EXCHANGE','DANIEL HECHTER','JOHN RICHMOND','LA MARTINA',
        'WILLIAMS MORRIS','COLUMBIA','PIERRE CARDIN','MIRAFLEX','JIMMY FAIRLY',
        'FREIGEIST',
      ];

      const { data: bfProducts, error: bfErr } = await supabase
        .from("products")
        .select("id, sku, brand, image_url, additional_images")
        .eq("is_active", true)
        .eq("item_type", "frames")
        .not("additional_images", "is", null)
        .not("brand", "is", null);

      if (bfErr) throw bfErr;

      const bfAffected = (bfProducts || []).filter((p: any) => {
        const brand = (p.brand || "").toUpperCase().trim();
        return KNOWN_BRANDS.includes(brand) &&
          Array.isArray(p.additional_images) &&
          p.additional_images.length >= 5;
      });

      let bfFixed = 0, bfSwapped = 0, bfDeleted = 0;
      const bfErrors: { sku: string; error: string }[] = [];
      const bfFiles: string[] = [];

      for (const product of bfAffected) {
        try {
          const extras: string[] = [...product.additional_images];
          let primaryUrl: string | null = product.image_url;

          const packagingUrl = extras.pop()!;
          const pathMatch = packagingUrl.match(/\/product-images\/(.+)$/);
          if (pathMatch) bfFiles.push(pathMatch[1]);

          const primaryIsAi = primaryUrl && /\/additional-\d+/.test(primaryUrl);
          if (primaryIsAi) {
            const mainIdx = extras.findIndex((url: string) => /\/main\.\w+/.test(url));
            if (mainIdx !== -1) {
              const originalMain = extras[mainIdx];
              extras[mainIdx] = primaryUrl!;
              primaryUrl = originalMain;
              bfSwapped++;
            }
          }

          const { error: updateErr } = await supabase
            .from("products")
            .update({ image_url: primaryUrl, additional_images: extras })
            .eq("id", product.id);

          if (updateErr) throw updateErr;
          bfFixed++;
        } catch (err: any) {
          bfErrors.push({ sku: product.sku, error: err?.message || "Unknown" });
        }
      }

      for (let i = 0; i < bfFiles.length; i += 20) {
        const batch = bfFiles.slice(i, i + 20);
        const { error: delErr } = await supabase.storage
          .from("product-images")
          .remove(batch);
        if (!delErr) bfDeleted += batch.length;
      }

      return new Response(JSON.stringify({
        success: true, action, total: bfAffected.length, fixed: bfFixed,
        swapped: bfSwapped, storage_deleted: bfDeleted, errors: bfErrors,
      }), {
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

  // ── Sync stock only ──
  if (action === "sync_stock") {
    const { data: syncLog } = await supabase
      .from("zoho_sync_log")
      .insert({ sync_type: "sync_stock", direction: "inbound", status: "pending", performed_by: userId })
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
      const warehouseMappings = await loadWarehouseMappings(supabase);
      const defaultBranchId = warehouseMappings.get("__default__") || await getDefaultBranch(supabase);

      const { items, hasMore } = await fetchZohoItems(accessToken, orgId, 1);
      const stockResult = await syncStockForItems(supabase, items, warehouseMappings, defaultBranchId, userId);

      const totals = {
        processed: items.length,
        failed: 0,
        matched: 0,
        newProducts: 0,
        stockUpdated: stockResult.stockUpdated,
        stockSkipped: stockResult.stockSkipped,
      };

      if (hasMore) {
        await updateSyncProgress(supabase, syncId, totals, 1, false);
        // Chain next page
        const sKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        fetch(`${supabaseUrl}/functions/v1/zoho-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${sKey}` },
          body: JSON.stringify({
            action: "sync_stock_continue",
            page: 2,
            sync_id: syncId,
            access_token: accessToken,
            total_stock_updated: totals.stockUpdated,
            total_stock_skipped: totals.stockSkipped,
            total_processed: totals.processed,
          }),
        }).catch((err) => console.error("Stock sync chain failed:", err));
      } else {
        await updateSyncProgress(supabase, syncId, totals, 1, true);
      }

      return new Response(
        JSON.stringify({
          success: true,
          action,
          sync_id: syncId,
          page_1_stock_updated: stockResult.stockUpdated,
          page_1_stock_skipped: stockResult.stockSkipped,
          page_1_processed: items.length,
          has_more: hasMore,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Stock sync error:", message);
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

  // ── List warehouses: fetch from Zoho Books settings ──
  if (action === "list_warehouses") {
    try {
      const accessToken = await getAccessToken();
      const res = await fetch(
        `${ZOHO_BOOKS_API}/settings/warehouses?organization_id=${orgId}`,
        { headers: { Authorization: `Zoho-oauthtoken ${accessToken}` } },
      );
      const data = await res.json();

      if (data.code !== 0) {
        // Fallback: try to extract from items if warehouse API not available
        const itemsRes = await fetchZohoItems(accessToken, orgId, 1);
        const locationSet = new Map<string, string>();
        for (const item of itemsRes.items) {
          const warehouses = item.warehouses as Array<Record<string, unknown>> | undefined;
          if (warehouses && Array.isArray(warehouses)) {
            for (const wh of warehouses) {
              const locId = String(wh.warehouse_id || "");
              const locName = String(wh.warehouse_name || "");
              if (locId) locationSet.set(locId, locName);
            }
          }
        }
        const locations = Array.from(locationSet.entries()).map(([id, name]) => ({
          location_id: id,
          location_name: name,
        }));
        return new Response(JSON.stringify({ success: true, warehouses: locations, source: "items" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const warehouses = (data.warehouses || []).map((wh: Record<string, unknown>) => ({
        location_id: String(wh.warehouse_id),
        location_name: String(wh.warehouse_name),
        is_primary: wh.is_primary || false,
        status: wh.status || "active",
      }));

      return new Response(JSON.stringify({ success: true, warehouses, source: "settings" }), {
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
      const warehouseMappings = await loadWarehouseMappings(supabase);
      const defaultBranchId = await getDefaultBranch(supabase);
      const result = await processPage(supabase, accessToken, orgId, 1, warehouseMappings, defaultBranchId, userId);

      const totals = {
        processed: result.matched + result.fuzzyMatched + result.newProducts,
        failed: result.failed,
        matched: result.matched,
        fuzzyMatched: result.fuzzyMatched,
        newProducts: result.newProducts,
        stockUpdated: result.stockUpdated,
        stockSkipped: result.stockSkipped,
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
          page_1_fuzzy_matched: result.fuzzyMatched,
          page_1_new: result.newProducts,
          page_1_stock_updated: result.stockUpdated,
          page_1_stock_skipped: result.stockSkipped,
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
      .insert({ sync_type: "push_order", direction: "outbound", status: "pending", performed_by: userId, metadata: { order_id: orderId } })
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

      // Fetch customer profile for Zoho contact info
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, phone_number")
        .eq("user_id", order.user_id)
        .maybeSingle();

      const lineItems = (order.order_items || [])
        .filter((oi: any) => oi.products?.zoho_item_id)
        .map((oi: any) => ({
          item_id: oi.products.zoho_item_id,
          quantity: oi.quantity,
          rate: oi.price_at_purchase,
        }));

      if (lineItems.length === 0) throw new Error("No items with Zoho mapping found");

      const salesOrderPayload: Record<string, unknown> = {
        salesorder_number: order.order_number,
        date: order.created_at.split("T")[0],
        line_items: lineItems,
        notes: order.notes || "",
        reference_number: order.payment_reference || "",
      };

      // Add customer info if profile exists
      if (profile) {
        salesOrderPayload.customer_name = profile.full_name || profile.email || "";
        if (profile.email) salesOrderPayload.contact_persons_email = profile.email;
        if (profile.phone_number) salesOrderPayload.phone = profile.phone_number;
      }

      // Add shipping address if available
      const shipping = order.shipping_address as Record<string, unknown> | null;
      if (shipping) {
        salesOrderPayload.shipping_address = {
          address: shipping.address || "",
          city: shipping.city || "",
          state: shipping.state || "",
          country: "Nigeria",
        };
      }

      const soRes = await fetch(`${ZOHO_BOOKS_API}/salesorders?organization_id=${orgId}`, {
        method: "POST",
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(salesOrderPayload),
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

  if (action === "link_product") {
    const { product_id, zoho_item_id: linkZohoId } = body;
    if (!product_id || !linkZohoId) {
      return new Response(JSON.stringify({ error: "product_id and zoho_item_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

  // ── Push product updates to Zoho Books ──
  if (action === "push_updates" || action === "push_all_mh") {
    let { product_ids } = body as { product_ids?: string[] };

    // push_all_mh: auto-load every active M&H product
    if (action === "push_all_mh") {
      const { data: mhProducts, error: fetchErr } = await supabase
        .from("products")
        .select("id")
        .eq("brand_line", "m_and_h_fashion")
        .eq("is_active", true);
      if (fetchErr) {
        return new Response(JSON.stringify({ error: fetchErr.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      product_ids = (mhProducts ?? []).map((p) => p.id);
    }

    if (!Array.isArray(product_ids) || product_ids.length === 0) {
      return new Response(JSON.stringify({ error: "No products to push" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const { data: syncLog } = await supabase
      .from("zoho_sync_log")
      .insert({ sync_type: "push_updates", direction: "outbound", status: "pending", performed_by: userId })
      .select()
      .single();
    const syncId = syncLog?.id;

    try {
      const accessToken = await getAccessToken();

      // Load products in batches
      let pushed = 0;
      let created = 0;
      let pushFailed = 0;
      const pushErrors: { id: string; error: string }[] = [];
      const PUSH_BATCH = 25;

      for (let i = 0; i < product_ids.length; i += PUSH_BATCH) {
        const batchIds = product_ids.slice(i, i + PUSH_BATCH);
        const { data: batchProducts } = await supabase
          .from("products")
          .select("id, name, sku, price, description, zoho_item_id")
          .in("id", batchIds);

        if (!batchProducts) continue;

        for (const product of batchProducts) {
          try {
            const zohoPayload = {
              name: product.name,
              sku: product.sku,
              rate: product.price,
              description: product.description || "",
            };

            if (product.zoho_item_id) {
              // Update existing Zoho item
              const res = await fetch(
                `${ZOHO_BOOKS_API}/items/${product.zoho_item_id}?organization_id=${orgId}`,
                {
                  method: "PUT",
                  headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(zohoPayload),
                },
              );
              const data = await res.json();
              if (data.code !== 0) {
                pushErrors.push({ id: product.id, error: data.message || "Zoho API error" });
                pushFailed++;
              } else {
                pushed++;
              }
            } else {
              // Create new Zoho item
              const res = await fetch(
                `${ZOHO_BOOKS_API}/items?organization_id=${orgId}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Zoho-oauthtoken ${accessToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(zohoPayload),
                },
              );
              const data = await res.json();
              if (data.code !== 0) {
                pushErrors.push({ id: product.id, error: data.message || "Zoho API error" });
                pushFailed++;
              } else {
                // Save zoho_item_id back
                const newZohoId = data.item?.item_id;
                if (newZohoId) {
                  await supabase
                    .from("products")
                    .update({ zoho_item_id: String(newZohoId) })
                    .eq("id", product.id);
                }
                created++;
              }
            }

            // Rate limit: small delay between Zoho calls
            await new Promise((r) => setTimeout(r, 200));
          } catch (err) {
            pushErrors.push({ id: product.id, error: err instanceof Error ? err.message : "Unknown" });
            pushFailed++;
          }
        }
      }

      if (syncId) {
        await supabase
          .from("zoho_sync_log")
          .update({
            status: pushFailed > 0 && pushed + created === 0 ? "error" : "success",
            records_processed: pushed + created,
            records_failed: pushFailed,
            metadata: { pushed, created, errors: pushErrors.slice(0, 20) },
            completed_at: new Date().toISOString(),
          })
          .eq("id", syncId);
      }

      return new Response(
        JSON.stringify({ success: true, action, pushed, created, failed: pushFailed, errors: pushErrors.slice(0, 10) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
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

  if (action === "push_all_mh") {
    // Push every active M&H product to Zoho (create if missing, update if linked)
    const { data: mhProducts, error: fetchErr } = await supabase
      .from("products")
      .select("id")
      .eq("brand_line", "m_and_h_fashion")
      .eq("is_active", true);

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delegate to push_updates internally
    const productIds = (mhProducts ?? []).map((p) => p.id);
    if (productIds.length === 0) {
      return new Response(JSON.stringify({ success: true, pushed: 0, created: 0, failed: 0, message: "No M&H products to push" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reuse push_updates by re-invoking the handler with a synthetic body
    const forwardReq = new Request(req.url, {
      method: "POST",
      headers: req.headers,
      body: JSON.stringify({ action: "push_updates", product_ids: productIds }),
    });
    return await (globalThis as { Deno: { serve: unknown } }).Deno && fetch(forwardReq) as unknown as Response ||
      new Response(JSON.stringify({ error: "Forward failed" }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

