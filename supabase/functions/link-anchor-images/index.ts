// Anchor Image Linker
// ────────────────────────────────────────────────────────────────────
// Scans the root of the `product-images` bucket for files named like
// `MH-367.jpg`, `MH-1371.png`, etc. (matching a product's SKU).
//
// For each match:
//   1. Optionally removes white background via Lovable AI (Gemini Nano-Banana)
//   2. Moves the file to `{productId}/main.{ext}` (the canonical primary slot)
//   3. Updates the product's `image_url` and sets `primary_image_locked = true`
//   4. Deletes the original root-level file
//
// This makes the manually-uploaded anchor immune to AI regeneration and
// available as the reference for VTO + Live AR.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BUCKET = "product-images";
const SKU_FILE_RE = /^(MH-\d+)\.(jpe?g|png|webp)$/i;

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface LinkResult {
  file: string;
  sku?: string;
  productId?: string;
  status: "linked" | "skipped" | "error";
  bgRemoved?: boolean;
  error?: string;
}

async function removeWhiteBg(base64DataUrl: string): Promise<string | null> {
  if (!LOVABLE_API_KEY) return null;
  try {
    const resp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text:
                    "Remove the background from this eyewear product photo completely. " +
                    "Keep the frames perfectly intact with sharp edges. " +
                    "Output a PNG with a fully transparent background (alpha channel). " +
                    "Do not add shadows, do not crop, do not alter the frames in any way.",
                },
                { type: "image_url", image_url: { url: base64DataUrl } },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      },
    );
    if (!resp.ok) {
      console.error("BG removal failed:", resp.status, await resp.text());
      return null;
    }
    const data = await resp.json();
    const url = data?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    return typeof url === "string" ? url : null;
  } catch (e) {
    console.error("BG removal error:", e);
    return null;
  }
}

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  const mime = match[1];
  const bin = atob(match[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, mime };
}

// Heuristic: does the image have a mostly-white border?
// Decode the JPEG/PNG via an offscreen canvas? Deno doesn't have one.
// Instead, treat any .jpg/.jpeg as "likely has white bg" and any .png/.webp
// as "trust the upload" (since user already removed bg externally).
function needsBgRemoval(ext: string): boolean {
  return /^jpe?g$/i.test(ext);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json().catch(() => ({}));
    const dryRun: boolean = !!body?.dryRun;
    const skipBgRemoval: boolean = !!body?.skipBgRemoval;

    // 1. List root of bucket
    const { data: rootFiles, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

    if (listErr) throw listErr;

    const candidates = (rootFiles || []).filter((f) => SKU_FILE_RE.test(f.name));

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({
          ok: true,
          scanned: rootFiles?.length || 0,
          matched: 0,
          message:
            "No MH-XXX.{jpg,png,webp} files found at the root of product-images bucket.",
          results: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Batch-fetch matching products by SKU
    const skus = candidates.map((f) => f.name.match(SKU_FILE_RE)![1].toUpperCase());
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, sku, brand_line")
      .in("sku", skus)
      .eq("brand_line", "m_and_h_fashion")
      .not("primary_image_locked", "is", true); // skip already-locked anchors

    if (prodErr) throw prodErr;

    const bySku = new Map<string, { id: string }>();
    for (const p of products || []) bySku.set(p.sku.toUpperCase(), { id: p.id });

    const results: LinkResult[] = [];

    for (const file of candidates) {
      const m = file.name.match(SKU_FILE_RE)!;
      const sku = m[1].toUpperCase();
      const ext = m[2].toLowerCase();
      const product = bySku.get(sku);

      if (!product) {
        results.push({ file: file.name, sku, status: "skipped", error: "No matching M&H product" });
        continue;
      }

      if (dryRun) {
        results.push({ file: file.name, sku, productId: product.id, status: "linked" });
        continue;
      }

      try {
        // 3. Download original
        const { data: blob, error: dlErr } = await supabase.storage
          .from(BUCKET)
          .download(file.name);
        if (dlErr || !blob) throw dlErr || new Error("Download failed");

        let uploadBytes: Uint8Array;
        let uploadMime: string;
        let finalExt = ext === "jpeg" ? "jpg" : ext;
        let bgRemoved = false;

        // 4. Optional background removal (default ON for JPGs)
        if (!skipBgRemoval && needsBgRemoval(ext)) {
          const ab = await blob.arrayBuffer();
          const b64 = btoa(
            new Uint8Array(ab).reduce(
              (acc, b) => acc + String.fromCharCode(b),
              "",
            ),
          );
          const mime = ext === "png" ? "image/png"
            : ext === "webp" ? "image/webp"
            : "image/jpeg";
          const cleaned = await removeWhiteBg(`data:${mime};base64,${b64}`);
          if (cleaned) {
            const { bytes, mime: outMime } = dataUrlToBytes(cleaned);
            uploadBytes = bytes;
            uploadMime = outMime;
            finalExt = outMime.includes("png") ? "png"
              : outMime.includes("webp") ? "webp"
              : "png";
            bgRemoved = true;
          } else {
            // Fallback: keep original
            uploadBytes = new Uint8Array(ab);
            uploadMime = mime;
          }
        } else {
          const ab = await blob.arrayBuffer();
          uploadBytes = new Uint8Array(ab);
          uploadMime = ext === "png" ? "image/png"
            : ext === "webp" ? "image/webp"
            : "image/jpeg";
        }

        // 5. Upload to {productId}/main.{ext}
        const destPath = `${product.id}/main.${finalExt}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(destPath, uploadBytes, {
            contentType: uploadMime,
            upsert: true,
          });
        if (upErr) throw upErr;

        // 6. Get public URL
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(destPath);
        const publicUrl = urlData.publicUrl;

        // 7. Update product (lock the anchor)
        const { error: updErr } = await supabase
          .from("products")
          .update({
            image_url: publicUrl,
            primary_image_locked: true,
          })
          .eq("id", product.id);
        if (updErr) throw updErr;

        // 8. Delete the root-level original to keep the bucket tidy
        await supabase.storage.from(BUCKET).remove([file.name]);

        results.push({
          file: file.name,
          sku,
          productId: product.id,
          status: "linked",
          bgRemoved,
        });
      } catch (e) {
        results.push({
          file: file.name,
          sku,
          productId: product.id,
          status: "error",
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const linked = results.filter((r) => r.status === "linked").length;
    const skipped = results.filter((r) => r.status === "skipped").length;
    const errored = results.filter((r) => r.status === "error").length;

    return new Response(
      JSON.stringify({
        ok: true,
        scanned: rootFiles?.length || 0,
        matched: candidates.length,
        linked,
        skipped,
        errored,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("link-anchor-images error:", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
