import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map category string from Excel to item_type enum
function mapCategory(category: string): string {
  const c = (category || "").toLowerCase().trim();
  if (c.includes("optical frame")) return "frames";
  if (c.includes("medical lens") || c.includes("lenses")) return "lenses";
  if (c.includes("case") || c.includes("accessor")) return "accessories";
  if (c.includes("drug") || c.includes("medical")) return "medications";
  if (c.includes("contact")) return "contact_lenses";
  if (c.includes("solution")) return "solutions";
  if (c.includes("cleanser")) return "cleanser";
  if (c.includes("packaging")) return "packaging";
  return "other";
}

// Map unit string
function mapUnit(unit: string): string {
  const u = (unit || "").toLowerCase().trim();
  if (u === "frame") return "Frame";
  if (u === "lens") return "Lens";
  if (u === "pair") return "Pair";
  if (u === "bottle") return "Bottle";
  if (u === "capsule") return "Capsule";
  if (u === "pack") return "Pack";
  return "Item";
}

// Parse price string like "N105,000.00" or number
function parsePrice(val: unknown): number {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
  }
  return 0;
}

interface ProductRow {
  sku: string;
  type: string;
  category: string;
  name: string;
  sph: number | null;
  cyl: number | null;
  axis: number | null;
  add: number | null;
  price: number;
  qty: number;
  unit: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Auth check
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
  const { data: userData, error: authError } = await anonClient.auth.getUser();
  if (authError || !userData.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  const { data: hasAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  const { data: hasAdminRole } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!hasAdmin && !hasAdminRole) {
    return new Response(JSON.stringify({ error: "Forbidden — admin required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { products, push_to_zoho = false } = body as { products: ProductRow[]; push_to_zoho?: boolean };

    if (!Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ error: "products array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all existing M&H products for matching
    const { data: existingProducts } = await supabase
      .from("products")
      .select("id, external_id, sku, name, image_url, additional_images, zoho_item_id")
      .eq("brand_line", "m_and_h_fashion");

    // Build lookup maps
    const byExternalId = new Map<string, typeof existingProducts extends (infer T)[] | null ? T : never>();
    const bySku = new Map<string, typeof existingProducts extends (infer T)[] | null ? T : never>();
    if (existingProducts) {
      for (const p of existingProducts) {
        if (p.external_id) byExternalId.set(p.external_id, p);
        if (p.sku) bySku.set(p.sku, p);
      }
    }

    let updated = 0;
    let inserted = 0;
    let failed = 0;
    const errors: { sku: string; error: string }[] = [];
    const affectedProductIds: string[] = [];

    // Process in batches of 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      
      for (const row of batch) {
        try {
          const externalId = String(row.sku);
          const itemType = mapCategory(row.category);
          const unit = mapUnit(row.unit);
          const price = parsePrice(row.price);

          // Try matching
          const existing = byExternalId.get(externalId) || bySku.get(externalId);

          const productData: Record<string, unknown> = {
            name: row.name,
            price,
            item_type: itemType,
            unit,
            brand_line: "m_and_h_fashion",
            is_active: true,
            record_type: "inventory_item",
            updated_at: new Date().toISOString(),
          };

          if (existing) {
            // Update — preserve image_url, additional_images, zoho_item_id
            const { error } = await supabase
              .from("products")
              .update(productData)
              .eq("id", existing.id);

            if (error) {
              errors.push({ sku: externalId, error: error.message });
              failed++;
            } else {
              updated++;
              affectedProductIds.push(existing.id);
            }
          } else {
            // Insert new product
            const sku = `MH-${externalId}`;
            const { data: newProduct, error } = await supabase
              .from("products")
              .insert({
                ...productData,
                sku,
                external_id: externalId,
              })
              .select("id")
              .single();

            if (error) {
              errors.push({ sku: externalId, error: error.message });
              failed++;
            } else {
              inserted++;
              if (newProduct) affectedProductIds.push(newProduct.id);
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          errors.push({ sku: String(row.sku), error: message });
          failed++;
        }
      }
    }

    // Log to import_history
    await supabase.from("import_history").insert({
      import_type: "data_cleanup",
      file_name: "InventoryReport_15.xls",
      total_records: products.length,
      new_products: inserted,
      updated_products: updated,
      failed_records: failed,
      error_details: errors.length > 0 ? errors : null,
      performed_by: userId,
    });

    // If push_to_zoho requested, trigger Zoho outbound push
    let zohoResult = null;
    if (push_to_zoho && affectedProductIds.length > 0) {
      try {
        const { data, error } = await anonClient.functions.invoke("zoho-sync", {
          body: { action: "push_updates", product_ids: affectedProductIds },
        });
        zohoResult = error ? { error: error.message } : data;
      } catch (err) {
        zohoResult = { error: err instanceof Error ? err.message : "Zoho push failed" };
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        updated,
        inserted,
        failed,
        total: products.length,
        errors: errors.slice(0, 20),
        affected_product_ids: affectedProductIds.length,
        zoho_result: zohoResult,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Bulk update error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
