// Bulk Anchor Image Linker
// Receives a batch of { sku, base64, contentType } and for each:
//   1. Looks up the M&H product by SKU
//   2. Uploads bytes to {productId}/main.{ext}
//   3. Sets image_url + primary_image_locked = true
//
// No background removal — uses bytes as-is (caller has pre-processed images).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "product-images";

interface Item {
  sku: string;
  base64: string;
  contentType?: string;
  ext?: string;
}

interface Result {
  sku: string;
  status: "linked" | "skipped" | "error";
  productId?: string;
  publicUrl?: string;
  error?: string;
}

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const body = await req.json();
    const items: Item[] = body?.items || [];
    if (!Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "items[] required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const skus = [...new Set(items.map((i) => i.sku.toUpperCase()))];
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, sku")
      .in("sku", skus)
      .eq("brand_line", "m_and_h_fashion");
    if (prodErr) throw prodErr;

    const bySku = new Map<string, string>();
    for (const p of products || []) bySku.set(p.sku.toUpperCase(), p.id);

    const results: Result[] = [];
    for (const item of items) {
      const sku = item.sku.toUpperCase();
      const productId = bySku.get(sku);
      if (!productId) {
        results.push({ sku, status: "skipped", error: "No matching M&H product" });
        continue;
      }
      try {
        const bytes = b64ToBytes(item.base64);
        const ext = (item.ext || "jpg").toLowerCase();
        const contentType = item.contentType ||
          (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
        const destPath = `${productId}/main.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(destPath, bytes, { contentType, upsert: true });
        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
        const publicUrl = urlData.publicUrl;

        const { error: updErr } = await supabase
          .from("products")
          .update({
            image_url: publicUrl,
            primary_image_locked: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", productId);
        if (updErr) throw updErr;

        results.push({ sku, status: "linked", productId, publicUrl });
      } catch (e) {
        results.push({
          sku,
          status: "error",
          productId,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const linked = results.filter((r) => r.status === "linked").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const errored = results.filter((r) => r.status === "error").length;

    return new Response(
      JSON.stringify({ ok: true, linked, skipped, errored, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
