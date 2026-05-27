// enhance-anchor-image
// ─────────────────────────────────────────────────────────────────────────────
// Takes an existing anchor photo (which may be blurry, poorly lit, have a
// cluttered background, or be otherwise unclear) and reconstructs it as a
// CRYSTAL-CLEAR professional studio photograph using Gemini image-to-image.
//
// The enhanced image REPLACES the product's image_url (and is saved as
// {productId}/anchor_enhanced.png).  The original is kept at
// {productId}/anchor_original.{ext} so nothing is ever permanently lost.
//
// Supports:
//   • Single-product mode  { product_id }
//   • Batch mode           { batch: [{ product_id }, ...] }
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ─── Gemini enhancement prompt ───────────────────────────────────────────────
// Written to maximise clarity and detail preservation simultaneously.
// Tested against: blurry phone shots, white-background catalogue photos,
// images with hands/packaging, low-resolution scans.

function buildEnhancementPrompt(product: {
  name: string;
  brand?: string | null;
  color?: string | null;
  style?: string | null;
  material?: string | null;
  frame_shape?: string | null;
}): string {
  const desc = [
    product.brand,
    product.name,
    product.color && `in ${product.color}`,
    (product.material) && `(${product.material})`,
    product.frame_shape && `${product.frame_shape} shape`,
    product.style && `${product.style} style`,
  ]
    .filter(Boolean)
    .join(" ");

  const brandNote = product.brand
    ? `This is a ${product.brand} product. Preserve ANY brand logos, engravings, model numbers, or temple markings EXACTLY as they appear — do not remove or alter them.`
    : "Preserve any identifying marks, engravings, or model numbers exactly as they appear.";

  return `You are an elite professional product photography AI for a premium eyewear retailer.

You are given a reference photo of real eyewear: ${desc}.

YOUR SOLE MISSION: Reconstruct this EXACT frame as a PERFECT, crystal-clear professional e-commerce studio photograph — the standard of Ray-Ban.com, Warby Parker, or Cartier Eyewear. The result must look like a ₦1,000,000 product was photographed by a world-class studio photographer.

══════════════════════════════════════════════════
WHAT YOU MUST PRESERVE — NEVER CHANGE ANY OF THIS
══════════════════════════════════════════════════
• EXACT frame silhouette and shape — every curve, angle, proportion
• EVERY color: frame body, temples, lens tint, nose pads, hinges, hardware
• ${brandNote}
• Hinge and bridge design — their exact style and position
• Nose pad style — clip-on, soft pad, saddle bridge — exactly as present
• Material texture — acetate finish, metal sheen, rubberised grip, mixed joints
• All proportional relationships — frame width, lens height, temple length
• Any unique design elements — gradient finishes, pattern inlays, coloured screws

══════════════════════════════════════════════════
WHAT YOU MUST DRAMATICALLY IMPROVE
══════════════════════════════════════════════════
• SHARPNESS: Every millimetre must be razor-sharp — temple tip, lens rim, hinge screw, nose pad edge, bridge curve. No blur anywhere.
• LIGHTING: Large professional overhead softbox at 5500K neutral white balance. Gentle diffused light that reveals material texture without harsh hot spots.
• BACKGROUND: Pure seamless white (#FFFFFF). Absolutely no gradients, textures, shadows on the background surface.
• REMOVE: Any background clutter, boxes, packaging, display stands, shelves, hands, price tags, stickers, other products, wrapping, tissue paper.
• CLEAN: Remove photographic dust, lens flare, compression artefacts, graininess. Do NOT alter the frame itself — only clean the photography.
• COMPOSITION: Frame centred and level, occupying 70-80% of the canvas. Equal white margins on all four sides. Temples open and extending naturally.

══════════════════════════════════════════════════
OUTPUT SPECIFICATIONS
══════════════════════════════════════════════════
View: Classic three-quarter front hero shot — frame angled ~20-25 degrees to the left (standard commercial hero angle used by every major eyewear brand).
Crop: Square 1:1, frame dominant.
Background: Pure white #FFFFFF — no drop shadows, no reflections.
Sharpness: Maximum. Commercial product quality.
No: models, faces, hands, props, cases, watermarks, text overlays of any kind.

The final image must be so sharp and professionally lit that it is indistinguishable from a product photographed in a ₦5-million professional studio setup. Every detail of the original frame must be completely preserved — only the photographic quality is improved.`;
}

// ─── API helpers (mirrors generate-product-image pattern) ────────────────────

async function editImageViaGemini(
  prompt: string,
  imageUrl: string,
  geminiApiKey: string
): Promise<{ data: string; mimeType: string }> {
  const imgResp = await fetch(imageUrl);
  if (!imgResp.ok) throw new Error(`Failed to fetch reference image: ${imgResp.status}`);
  const imgBuffer = await imgResp.arrayBuffer();
  const imgBytes = new Uint8Array(imgBuffer);
  let b64 = "";
  for (let i = 0; i < imgBytes.length; i++) b64 += String.fromCharCode(imgBytes[i]);
  b64 = btoa(b64);
  const contentType = imgResp.headers.get("content-type") || "image/jpeg";

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: contentType, data: b64 } },
          ],
        }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Gemini API error ${resp.status}: ${errText}`);
  }

  const result = await resp.json();
  const parts = result?.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No parts in Gemini response");

  for (const part of parts) {
    if (part.inlineData?.data && part.inlineData?.mimeType?.startsWith("image/")) {
      return { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
    }
  }
  throw new Error("No image returned from Gemini");
}

async function editImageViaLovable(
  prompt: string,
  imageUrl: string,
  lovableApiKey: string
): Promise<{ data: string; mimeType: string }> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      }],
      modalities: ["image", "text"],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Lovable gateway error ${resp.status}: ${errText}`);
  }

  const result = await resp.json();
  const imgUrl = result?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imgUrl?.startsWith("data:image/")) {
    throw new Error("No image returned from Lovable gateway");
  }

  const match = imgUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL format from Lovable");
  return { mimeType: match[1], data: match[2] };
}

// ─── Core per-product enhancement logic ──────────────────────────────────────

interface EnhanceResult {
  product_id: string;
  sku?: string;
  status: "enhanced" | "skipped" | "error";
  originalUrl?: string;
  enhancedUrl?: string;
  error?: string;
}

async function enhanceProduct(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  geminiApiKey: string | null,
  lovableApiKey: string | null
): Promise<EnhanceResult> {
  // 1. Load product metadata
  const { data: product, error: prodErr } = await supabase
    .from("products")
    .select("id, sku, name, brand, color, style, material, image_url")
    .eq("id", productId)
    .single();

  if (prodErr || !product) {
    return { product_id: productId, status: "error", error: prodErr?.message || "Product not found" };
  }

  if (!product.image_url) {
    return { product_id: productId, sku: product.sku, status: "skipped", error: "No anchor image to enhance" };
  }

  // 2. Load frame attributes for extra detail
  const { data: frameAttr } = await supabase
    .from("frame_attributes")
    .select("frame_shape, frame_material")
    .eq("product_id", productId)
    .maybeSingle();

  const productMeta = {
    name: product.name,
    brand: product.brand,
    color: product.color,
    style: product.style,
    material: product.material || frameAttr?.frame_material || null,
    frame_shape: frameAttr?.frame_shape || null,
  };

  // 3. Back up original at {productId}/anchor_original.*
  try {
    const ext = product.image_url.split(".").pop()?.split("?")[0] || "jpg";
    const origResp = await fetch(product.image_url);
    if (origResp.ok) {
      const blob = await origResp.blob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const origPath = `${productId}/anchor_original.${ext}`;
      await supabase.storage.from("product-images").upload(origPath, bytes, {
        contentType: blob.type || "image/jpeg",
        upsert: true,
      });
    }
  } catch (backupErr) {
    // Non-fatal — log but continue
    console.warn(`Backup failed for ${productId}:`, backupErr);
  }

  // 4. Build prompt and call Gemini
  const prompt = buildEnhancementPrompt(productMeta);

  let imageResult: { data: string; mimeType: string };

  try {
    if (geminiApiKey) {
      imageResult = await editImageViaGemini(prompt, product.image_url, geminiApiKey);
      console.log(`  ✓ ${product.sku}: enhanced via direct Gemini`);
    } else if (lovableApiKey) {
      imageResult = await editImageViaLovable(prompt, product.image_url, lovableApiKey);
      console.log(`  ✓ ${product.sku}: enhanced via Lovable gateway`);
    } else {
      return { product_id: productId, sku: product.sku, status: "error", error: "No API key configured" };
    }
  } catch (aiErr: unknown) {
    const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
    console.error(`  ✗ ${product.sku}: AI error — ${msg}`);

    // Fallback to Lovable if direct Gemini failed
    if (geminiApiKey && lovableApiKey) {
      try {
        console.log(`  → ${product.sku}: retrying via Lovable gateway...`);
        imageResult = await editImageViaLovable(prompt, product.image_url, lovableApiKey);
        console.log(`  ✓ ${product.sku}: enhanced via Lovable (fallback)`);
      } catch (fallbackErr: unknown) {
        const msg2 = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        return { product_id: productId, sku: product.sku, status: "error", error: msg2 };
      }
    } else {
      return { product_id: productId, sku: product.sku, status: "error", error: msg };
    }
  }

  // 5. Upload enhanced image
  const enhancedExt = imageResult.mimeType.includes("png") ? "png"
    : imageResult.mimeType.includes("webp") ? "webp"
    : "jpg";
  const enhancedPath = `${productId}/anchor_enhanced.${enhancedExt}`;

  const enhancedBytes = Uint8Array.from(atob(imageResult.data), (c) => c.charCodeAt(0));

  const { error: uploadErr } = await supabase.storage
    .from("product-images")
    .upload(enhancedPath, enhancedBytes, {
      contentType: imageResult.mimeType,
      upsert: true,
    });

  if (uploadErr) {
    return { product_id: productId, sku: product.sku, status: "error", error: `Upload failed: ${uploadErr.message}` };
  }

  const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(enhancedPath);
  const enhancedUrl = urlData.publicUrl;

  // 6. Update product record — enhanced image becomes the new anchor
  const { error: updateErr } = await supabase
    .from("products")
    .update({
      image_url: enhancedUrl,
      primary_image_locked: true,
    })
    .eq("id", productId);

  if (updateErr) {
    return { product_id: productId, sku: product.sku, status: "error", error: `DB update failed: ${updateErr.message}` };
  }

  return {
    product_id: productId,
    sku: product.sku,
    status: "enhanced",
    originalUrl: product.image_url,
    enhancedUrl,
  };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") || null;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") || null;

    if (!geminiApiKey && !lovableApiKey) {
      return json({ error: "No AI API key configured (GEMINI_API_KEY or LOVABLE_API_KEY required)" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const body = await req.json();

    // ── Batch mode ──
    if (body.batch && Array.isArray(body.batch)) {
      const results: EnhanceResult[] = [];
      for (const item of body.batch) {
        if (!item.product_id) continue;
        const result = await enhanceProduct(supabase, item.product_id, geminiApiKey, lovableApiKey);
        results.push(result);
        // Throttle to avoid rate limits
        await new Promise((r) => setTimeout(r, 2000));
      }

      const enhanced = results.filter((r) => r.status === "enhanced").length;
      const skipped = results.filter((r) => r.status === "skipped").length;
      const errored = results.filter((r) => r.status === "error").length;

      return json({ ok: true, enhanced, skipped, errored, results });
    }

    // ── Single mode ──
    const { product_id } = body;
    if (!product_id) {
      return json({ error: "product_id is required" }, 400);
    }

    const result = await enhanceProduct(supabase, product_id, geminiApiKey, lovableApiKey);
    return json({
      ok: result.status === "enhanced",
      ...result,
    });
  } catch (e) {
    console.error("enhance-anchor-image error:", e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
