import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// ── Branded frames whose logos must be preserved on frames ──
const LUXURY_BRANDS = new Set([
  "GUCCI", "VERSACE", "PRADA", "EMPORIO ARMANI", "BURBERRY", "CARTIER",
  "MONT BLANC", "DOLCE & GABBANA", "TOM FORD", "MARC JACOBS", "SWAROVSKI",
  "MIU MIU", "CAROLINA HERRERA", "TIFFANY & CO", "BALENCIAGA", "BVLGARI",
  "JIMMY CHOO", "CHOPARD", "GENTLE MONSTER", "CHROME HEART", "LINDA FARROW",
  "MCM", "MOSCHINO",
  "POLAROID", "CARRERA", "CARRERA DUCATI", "TED BAKER", "TOMMY HILFIGER",
  "RAYBAN", "RAY-BAN", "POLO RALPH LAUREN", "HUGO", "HUGO BOSS",
  "DAVID BECKHAM", "VICTORIA BECKHAM", "GUESS", "OAKLEY", "ARNETTE",
  "VOGUE", "LEVI", "PUMA", "CALVIN KLEIN", "SANDRO", "DKNY",
  "ARMANI EXCHANGE",
  "DANIEL HECHTER", "JOHN RICHMOND", "LA MARTINA", "WILLIAMS MORRIS",
  "COLUMBIA", "PIERRE CARDIN", "MIRAFLEX",
  "JIMMY FAIRLY",
  "FREIGEIST",
]);

function isBrandedFrame(brand: string | null): boolean {
  if (!brand) return false;
  return LUXURY_BRANDS.has(brand.toUpperCase().trim());
}

const MIN_REFERENCE_PHOTOS = 2;

// ── Prompt builders for the 6-shot gallery ──

function describeProduct(p: any): string {
  const parts: string[] = [];
  if (p.brand) parts.push(p.brand);
  // Prefer model_code from frame_attributes for precision
  if (p.model_code) {
    parts.push(`Model ${p.model_code}`);
  } else {
    parts.push(p.name);
  }
  if (p.color) parts.push(`in ${p.color}`);
  if (p.frame_material || p.material) parts.push(`(${p.frame_material || p.material})`);
  if (p.frame_shape) parts.push(`${p.frame_shape} shape`);
  else if (p.style) parts.push(`${p.style} style`);
  if (p.gender && p.gender !== "unisex") parts.push(`for ${p.gender}`);
  return parts.join(" ");
}

function buildFramePrompts(product: any): { slug: string; prompt: string }[] {
  const desc = describeProduct(product);
  const branded = isBrandedFrame(product.brand);
  const brandNote = branded
    ? `The frame is authentic ${product.brand}. You MUST visibly maintain any original subtle engravings, logos, or serial numbers on the frame itself. Do not remove them.`
    : "";

  const studioRule =
    "Seamless pure white studio background, soft professional commercial lighting, high resolution e-commerce product photography. No model, frame only.";

  return [
    {
      slug: "hero",
      prompt: `Professional product photo of ${desc} eyeglasses frame. Classic three-quarter front view — the main e-commerce thumbnail. Sharp focus on the front frame and the near temple arm. The lighting emphasizes the premium material finish. ${brandNote} ${studioRule}`,
    },
    {
      slug: "front",
      prompt: `Direct head-on front view of ${desc} eyeglasses frame. Perfectly symmetrical composition. The temples are open and extending straight back, slightly blurred by depth of field. Purpose: clearly show the shape of the lenses and the bridge fit. ${brandNote} ${studioRule}`,
    },
    {
      slug: "side",
      prompt: `Pure 90-degree side profile view of ${desc} eyeglasses frame. Sharp focus along the entire length of the visible temple arm. Purpose: show the thickness of the frame, the design of the temple arm, and the ear bend. ${brandNote} ${studioRule}`,
    },
    {
      slug: "rear",
      prompt: `Slightly elevated rear view of ${desc} eyeglasses frame, looking at the back of the glasses. Purpose: show the hinges, the nose pads, and the inside of the temple arms. ${branded ? "This angle is crucial for showing inner-temple markings like model numbers or 'Made in Italy'. Ensure those original details are visible." : ""} ${studioRule}`,
    },
    {
      slug: "macro",
      prompt: `Extreme close-up macro shot of ${desc} eyeglasses frame, focusing tightly on the temple hinge area or lens corner where the most prominent branding detail is located${branded ? ` (the ${product.brand} logo)` : ""}. Use dramatic lighting to highlight the metallic or engraved texture to prove authenticity and quality. ${studioRule}`,
    },
    {
      slug: "packaging",
      prompt: `Luxurious studio shot of ${desc} eyeglasses frame resting elegantly on top of a closed premium cylindrical hard case made of fine-grain leather${product.color ? ` in a color complementing ${product.color}` : ""}. ${branded ? `The original ${product.brand} brand logo is still visible on the frame. The brand name "${product.brand}" is cleanly featured on the leather case, showing credibility and authenticity.` : `The brand name "M&H Opticals" is cleanly embossed onto the top surface of the leather case.`} Seamless pure white studio background, soft professional commercial lighting, high resolution.`,
    },
  ];
}

// ── Reference-based prompts: instruct AI to re-render uploaded photo at different angles ──
function buildReferenceFramePrompts(product: any): { slug: string; prompt: string }[] {
  const desc = describeProduct(product);
  const baseInstruction = `This is a reference photo of the actual "${desc}" eyeglasses frame. You MUST preserve the exact color, shape, material, proportions, and design details of this specific frame. Re-render it as a professional e-commerce product photo with:`;
  const studioRule = "Seamless pure white studio background, soft professional commercial lighting, high resolution. No model, frame only.";

  return [
    {
      slug: "hero",
      prompt: `${baseInstruction} Classic three-quarter front view — the main e-commerce thumbnail. Sharp focus on the front frame and the near temple arm. ${studioRule}`,
    },
    {
      slug: "front",
      prompt: `${baseInstruction} Direct head-on front view. Perfectly symmetrical composition. Temples open, extending straight back. ${studioRule}`,
    },
    {
      slug: "side",
      prompt: `${baseInstruction} Pure 90-degree side profile view. Sharp focus along the entire length of the visible temple arm. ${studioRule}`,
    },
    {
      slug: "rear",
      prompt: `${baseInstruction} Slightly elevated rear view, looking at the back of the glasses. Show the hinges, nose pads, and inside of the temple arms. ${studioRule}`,
    },
    {
      slug: "macro",
      prompt: `${baseInstruction} Extreme close-up macro shot focusing tightly on the temple hinge area or lens corner. Use dramatic lighting to highlight texture and quality. ${studioRule}`,
    },
    {
      slug: "packaging",
      prompt: `${baseInstruction} The frame resting elegantly on top of a closed premium cylindrical hard case made of fine-grain leather. The brand name "M&H Opticals" is cleanly embossed onto the top surface of the leather case. ${studioRule}`,
    },
  ];
}

function buildNonFramePrompt(product: any): string {
  const { name, brand, item_type } = product;
  switch (item_type) {
    case "contact_lenses":
      return `Product photo of ${name} contact lens box packaging${brand ? ` by ${brand}` : ""}. Clean studio shot, white background, e-commerce style, high resolution.`;
    case "lenses":
      return `Product photo of ${name} optical lens${brand ? ` by ${brand}` : ""}. Clean studio shot, white background, e-commerce style, high resolution.`;
    case "solutions":
      return `Product photo of ${name} eye care solution bottle${brand ? ` by ${brand}` : ""}. Clean studio shot, white background, e-commerce product photography.`;
    default:
      return `Professional product photo of ${name}${brand ? ` by ${brand}` : ""}. Studio shot, white background, e-commerce style, high resolution.`;
  }
}

// ── Item-type priority for processing order ──
const ITEM_TYPE_PRIORITY: Record<string, number> = {
  frames: 1,
  contact_lenses: 2,
  lenses: 3,
  solutions: 4,
  medications: 5,
  accessories: 6,
  cleanser: 7,
  packaging: 8,
  other: 9,
};

// ── Image generation: Direct Gemini API (primary) → Lovable AI (fallback) ──
async function generateImageViaGemini(
  prompt: string,
  geminiApiKey: string
): Promise<{ data: string; mimeType: string }> {
  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${geminiApiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    if (resp.status === 429 || resp.status >= 500) {
      throw { retryable: true, fallback: true, message: `Gemini API ${resp.status}: ${errText}` };
    }
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
  throw new Error("No image returned from Gemini API");
}

// ── Reference-based image editing via Gemini (image-to-image) ──
async function editImageViaGemini(
  prompt: string,
  referenceImageUrl: string,
  geminiApiKey: string
): Promise<{ data: string; mimeType: string }> {
  // Fetch the reference image and convert to base64
  const imgResp = await fetch(referenceImageUrl);
  if (!imgResp.ok) throw new Error(`Failed to fetch reference image: ${imgResp.status}`);
  const imgBuffer = await imgResp.arrayBuffer();
  const imgBytes = new Uint8Array(imgBuffer);
  let base64 = "";
  for (let i = 0; i < imgBytes.length; i++) {
    base64 += String.fromCharCode(imgBytes[i]);
  }
  base64 = btoa(base64);
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
            { inlineData: { mimeType: contentType, data: base64 } },
          ],
        }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    if (resp.status === 429 || resp.status >= 500) {
      throw { retryable: true, fallback: true, message: `Gemini API ${resp.status}: ${errText}` };
    }
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
  throw new Error("No image returned from Gemini edit API");
}

async function editImageViaLovable(
  prompt: string,
  referenceImageUrl: string,
  lovableApiKey: string
): Promise<{ data: string; mimeType: string }> {
  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
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
            { type: "image_url", image_url: { url: referenceImageUrl } },
          ],
        }],
        modalities: ["image", "text"],
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    if (resp.status === 429) {
      throw { retryable: true, message: `Lovable rate limited: ${resp.status}` };
    }
    throw new Error(`Lovable AI gateway error ${resp.status}: ${errText}`);
  }

  const result = await resp.json();
  const imageUrl = result?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl || !imageUrl.startsWith("data:image/")) {
    throw new Error("No image returned from Lovable AI gateway (edit)");
  }

  const match = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL format");
  return { mimeType: match[1], data: match[2] };
}

async function generateImageViaLovable(
  prompt: string,
  lovableApiKey: string
): Promise<{ data: string; mimeType: string }> {
  const resp = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    if (resp.status === 429) {
      throw { retryable: true, message: `Lovable rate limited: ${resp.status}` };
    }
    throw new Error(`Lovable AI gateway error ${resp.status}: ${errText}`);
  }

  const result = await resp.json();
  const imageUrl = result?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!imageUrl || !imageUrl.startsWith("data:image/")) {
    throw new Error("No image returned from Lovable AI gateway");
  }

  const match = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL format");
  return { mimeType: match[1], data: match[2] };
}

async function generateImage(
  prompt: string,
  geminiApiKey: string | null,
  lovableApiKey: string | null
): Promise<{ data: string; mimeType: string }> {
  if (geminiApiKey) {
    try {
      const result = await generateImageViaGemini(prompt, geminiApiKey);
      console.log("  ✓ Generated via direct Gemini API");
      return result;
    } catch (err: any) {
      console.warn("  ⚠ Direct Gemini failed:", err?.message || err);
    }
  }
  if (lovableApiKey) {
    console.log("  → Falling back to Lovable AI gateway");
    return generateImageViaLovable(prompt, lovableApiKey);
  }
  throw new Error("No API keys available for image generation");
}

async function editImage(
  prompt: string,
  referenceImageUrl: string,
  geminiApiKey: string | null,
  lovableApiKey: string | null
): Promise<{ data: string; mimeType: string }> {
  if (geminiApiKey) {
    try {
      const result = await editImageViaGemini(prompt, referenceImageUrl, geminiApiKey);
      console.log("  ✓ Edited via direct Gemini API");
      return result;
    } catch (err: any) {
      console.warn("  ⚠ Direct Gemini edit failed:", err?.message || err);
    }
  }
  if (lovableApiKey) {
    console.log("  → Falling back to Lovable AI gateway (edit)");
    return editImageViaLovable(prompt, referenceImageUrl, lovableApiKey);
  }
  throw new Error("No API keys available for image editing");
}

async function uploadImage(
  supabase: any,
  supabaseUrl: string,
  productId: string,
  slug: string,
  imageData: { data: string; mimeType: string }
): Promise<string> {
  const binaryStr = atob(imageData.data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const ext = imageData.mimeType.includes("png") ? "png" : "webp";
  const filePath = `${productId}/${slug}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("product-images")
    .upload(filePath, bytes, { contentType: imageData.mimeType, upsert: true });

  if (uploadErr) throw new Error("Storage upload failed: " + uploadErr.message);

  return `${supabaseUrl}/storage/v1/object/public/product-images/${filePath}`;
}

// ── Helper: generate a full gallery with retry logic ──
async function generateFullGallery(
  product: any,
  referenceImageUrls: string[] | null,
  geminiApiKey: string | null,
  lovableApiKey: string | null,
  supabase: any,
  supabaseUrl: string
): Promise<{ heroUrl: string; additionalUrls: string[]; shots: number }> {
  const isFrame = product.item_type === "frames";

  if (!isFrame) {
    // Non-frame: single shot
    const prompt = buildNonFramePrompt(product);
    console.log(`  📸 ${product.sku} — generating single shot`);
    const imageData = await generateImage(prompt, geminiApiKey, lovableApiKey);
    const url = await uploadImage(supabase, supabaseUrl, product.id, "primary", imageData);
    return { heroUrl: url, additionalUrls: [], shots: 1 };
  }

  // Frame: 6-shot gallery
  const useReference = referenceImageUrls && referenceImageUrls.length >= MIN_REFERENCE_PHOTOS;
  const shots = useReference ? buildReferenceFramePrompts(product) : buildFramePrompts(product);
  const refUrl = useReference ? referenceImageUrls![0] : null;

  const urls: string[] = [];
  let heroUrl = "";

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];
    console.log(`  📸 ${product.sku} — ${useReference ? "ref-editing" : "generating"} ${shot.slug} (${i + 1}/6)`);

    let imageData: { data: string; mimeType: string } | null = null;
    let attempts = 0;

    while (attempts < 3) {
      try {
        if (useReference && refUrl) {
          imageData = await editImage(shot.prompt, refUrl, geminiApiKey, lovableApiKey);
        } else {
          imageData = await generateImage(shot.prompt, geminiApiKey, lovableApiKey);
        }
        break;
      } catch (err: any) {
        attempts++;
        if (err?.retryable && attempts < 3) {
          console.warn(`  ⏳ Rate limited on ${shot.slug}, waiting ${5 * attempts}s...`);
          await new Promise((r) => setTimeout(r, 5000 * attempts));
        } else {
          throw err instanceof Error ? err : new Error(err?.message || String(err));
        }
      }
    }

    if (!imageData) throw new Error(`Failed to generate ${shot.slug} after retries`);

    const url = await uploadImage(supabase, supabaseUrl, product.id, shot.slug, imageData);
    if (shot.slug === "hero") { heroUrl = url; } else { urls.push(url); }
    if (i < shots.length - 1) await new Promise((r) => setTimeout(r, 2000));
  }

  return { heroUrl, additionalUrls: urls, shots: 6 };
}

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || null;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") || null;
    if (!GEMINI_API_KEY && !LOVABLE_API_KEY) {
      return json({ error: "Neither GEMINI_API_KEY nor LOVABLE_API_KEY configured" }, 500);
    }
    console.log(`Using: ${GEMINI_API_KEY ? "Direct Gemini API (primary)" : "Lovable AI only"}${GEMINI_API_KEY && LOVABLE_API_KEY ? " + Lovable AI (fallback)" : ""}`);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 1, itemTypes, maxProducts, productId, shotSlug, referenceImageUrls } = await req.json().catch(() => ({}));

    // ── Single-shot regeneration mode ──
    if (productId && shotSlug) {
      console.log(`🔄 Regenerating single shot "${shotSlug}" for product: ${productId}`);
      const { data: product, error: fetchErr } = await supabase
        .from("products")
        .select("id, name, brand, color, material, item_type, style, sku, image_url, additional_images, gender, frame_attributes(model_code, frame_shape, frame_material, front_color)")
        .eq("id", productId)
        .single();

      if (fetchErr || !product) {
        return json({ error: "Product not found: " + (fetchErr?.message || "unknown") }, 404);
      }
      // Flatten frame_attributes into product for prompt building
      const fa = Array.isArray(product.frame_attributes) ? product.frame_attributes[0] : product.frame_attributes;
      if (fa) { Object.assign(product, { model_code: fa.model_code, frame_shape: fa.frame_shape, frame_material: fa.frame_material }); }

      const SHOT_SLUGS = ["hero", "front", "side", "rear", "macro", "packaging"];
      const shotIndex = SHOT_SLUGS.indexOf(shotSlug);
      if (shotIndex === -1) {
        return json({ error: `Invalid shotSlug "${shotSlug}". Must be one of: ${SHOT_SLUGS.join(", ")}` }, 400);
      }

      try {
        // Determine if using reference-based editing
        const useReference = Array.isArray(referenceImageUrls) && referenceImageUrls.length >= MIN_REFERENCE_PHOTOS;
        const shots = useReference ? buildReferenceFramePrompts(product) : buildFramePrompts(product);
        const shot = shots[shotIndex];
        console.log(`  📸 ${product.sku} — ${useReference ? "ref-editing" : "regenerating"} ${shot.slug}`);

        let imageData: { data: string; mimeType: string } | null = null;
        let attempts = 0;
        while (attempts < 3) {
          try {
            if (useReference) {
              imageData = await editImage(shot.prompt, referenceImageUrls![0], GEMINI_API_KEY, LOVABLE_API_KEY);
            } else {
              imageData = await generateImage(shot.prompt, GEMINI_API_KEY, LOVABLE_API_KEY);
            }
            break;
          } catch (err: any) {
            attempts++;
            if (err?.retryable && attempts < 3) {
              console.warn(`  ⏳ Rate limited on ${shot.slug}, waiting ${5 * attempts}s...`);
              await new Promise((r) => setTimeout(r, 5000 * attempts));
            } else {
              throw err instanceof Error ? err : new Error(err?.message || String(err));
            }
          }
        }
        if (!imageData) throw new Error(`Failed to generate ${shot.slug} after retries`);

        const url = await uploadImage(supabase, SUPABASE_URL, product.id, shot.slug, imageData);

        if (shotIndex === 0) {
          const { error: updateErr } = await supabase
            .from("products")
            .update({ image_url: url })
            .eq("id", product.id);
          if (updateErr) throw new Error("Product update failed: " + updateErr.message);
        } else {
          const currentAdditional: string[] = product.additional_images || [];
          while (currentAdditional.length < shotIndex) {
            currentAdditional.push("");
          }
          currentAdditional[shotIndex - 1] = url;
          const { error: updateErr } = await supabase
            .from("products")
            .update({ additional_images: currentAdditional })
            .eq("id", product.id);
          if (updateErr) throw new Error("Product update failed: " + updateErr.message);
        }

        console.log(`✓ Regenerated ${shot.slug} for ${product.sku}`);
        return json({ processed: 1, succeeded: 1, failed: 0, remaining: 0, results: [{ productId: product.id, sku: product.sku, success: true, shots: 1, shotSlug: shot.slug }] });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`✗ Single-shot regeneration failed for ${product.sku} (${shotSlug}):`, errMsg);
        return json({ processed: 1, succeeded: 0, failed: 1, remaining: 0, results: [{ productId: product.id, sku: product.sku, success: false, error: errMsg, shotSlug }] });
      }
    }

    // ── Single product full regeneration mode ──
    if (productId) {
      console.log(`🔄 Regenerating images for product: ${productId}`);
      const { data: product, error: fetchErr } = await supabase
        .from("products")
        .select("id, name, brand, color, material, item_type, style, sku, image_url, additional_images, gender, frame_attributes(model_code, frame_shape, frame_material, front_color)")
        .eq("id", productId)
        .single();

      if (fetchErr || !product) {
        return json({ error: "Product not found: " + (fetchErr?.message || "unknown") }, 404);
      }
      const fa2 = Array.isArray(product.frame_attributes) ? product.frame_attributes[0] : product.frame_attributes;
      if (fa2) { Object.assign(product, { model_code: fa2.model_code, frame_shape: fa2.frame_shape, frame_material: fa2.frame_material }); }

      // PDCA gate: house brands need reference photos for frames
      const isFrame = product.item_type === "frames";
      const isKnown = isBrandedFrame(product.brand);
      const refUrls = Array.isArray(referenceImageUrls) ? referenceImageUrls : null;
      const existingImages = (product.image_url ? 1 : 0) + (product.additional_images?.length ?? 0);

      if (isFrame && !isKnown && (!refUrls || refUrls.length < MIN_REFERENCE_PHOTOS) && existingImages < MIN_REFERENCE_PHOTOS) {
        return json({
          error: `House brand "${product.brand || 'unknown'}" requires at least ${MIN_REFERENCE_PHOTOS} reference photos uploaded before AI generation. Upload real photos first.`,
          code: "HOUSE_BRAND_NEEDS_REFERENCES",
          existingImages,
          required: MIN_REFERENCE_PHOTOS,
        }, 400);
      }

      // If house brand has existing images as references, use them
      const effectiveRefUrls = refUrls || (!isKnown && existingImages >= MIN_REFERENCE_PHOTOS
        ? [product.image_url, ...(product.additional_images || [])].filter(Boolean).slice(0, 2) as string[]
        : null);

      try {
        const { heroUrl, additionalUrls, shots } = await generateFullGallery(
          product, effectiveRefUrls, GEMINI_API_KEY, LOVABLE_API_KEY, supabase, SUPABASE_URL
        );

        const { error: updateErr } = await supabase
          .from("products")
          .update({
            image_url: heroUrl,
            additional_images: additionalUrls.length > 0 ? additionalUrls : null,
          })
          .eq("id", product.id);
        if (updateErr) throw new Error("Product update failed: " + updateErr.message);

        console.log(`✓ Generated ${shots}-shot gallery for ${product.sku}${effectiveRefUrls ? " (reference-based)" : ""}`);
        return json({ processed: 1, succeeded: 1, failed: 0, remaining: 0, results: [{ productId: product.id, sku: product.sku, success: true, shots }] });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        console.error(`✗ Regeneration failed for ${product.sku}:`, errMsg);
        return json({ processed: 1, succeeded: 0, failed: 1, remaining: 0, results: [{ productId: product.id, sku: product.sku, success: false, error: errMsg }] });
      }
    }

    // ── Batch mode ──
    const itemTypeFilter = Array.isArray(itemTypes) && itemTypes.length > 0 ? itemTypes : null;

    let remainingQuery = supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .or("image_url.is.null,image_url.eq.");
    if (itemTypeFilter) remainingQuery = remainingQuery.in("item_type", itemTypeFilter);
    const { count: remaining } = await remainingQuery;

    const limit = typeof maxProducts === "number" && maxProducts > 0
      ? Math.min(maxProducts, batchSize)
      : batchSize;

    let productQuery = supabase
      .from("products")
      .select("id, name, brand, color, material, item_type, style, sku, image_url, additional_images")
      .eq("is_active", true)
      .or("image_url.is.null,image_url.eq.")
      .order("item_type", { ascending: true })
      .limit(limit);
    if (itemTypeFilter) productQuery = productQuery.in("item_type", itemTypeFilter);
    const { data: products, error: fetchErr } = await productQuery;

    if (fetchErr) {
      return json({ error: "Failed to fetch products: " + fetchErr.message }, 500);
    }

    if (!products || products.length === 0) {
      return json({ processed: 0, succeeded: 0, failed: 0, remaining: 0, results: [] });
    }

    products.sort((a: any, b: any) => {
      const pa = ITEM_TYPE_PRIORITY[a.item_type || "other"] || 99;
      const pb = ITEM_TYPE_PRIORITY[b.item_type || "other"] || 99;
      return pa - pb;
    });

    const results: Array<{ productId: string; sku: string; name: string; brand: string | null; success: boolean; error?: string; shots?: number; skipped?: boolean }> = [];
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const isFrame = product.item_type === "frames";
        const isKnown = isBrandedFrame(product.brand);
        const existingImages = (product.image_url ? 1 : 0) + (product.additional_images?.length ?? 0);

        // PDCA gate for batch: skip house brand frames without enough references
        if (isFrame && !isKnown && existingImages < MIN_REFERENCE_PHOTOS) {
          skipped++;
          results.push({
            productId: product.id, sku: product.sku, name: product.name, brand: product.brand,
            success: false, skipped: true,
            error: `House brand needs ${MIN_REFERENCE_PHOTOS} reference photos (has ${existingImages})`,
          });
          console.log(`  ⏭ Skipped ${product.sku} — house brand needs reference photos`);
          continue;
        }

        // Use existing images as references for house brands
        const effectiveRefUrls = !isKnown && existingImages >= MIN_REFERENCE_PHOTOS
          ? [product.image_url, ...(product.additional_images || [])].filter(Boolean).slice(0, 2) as string[]
          : null;

        const { heroUrl, additionalUrls, shots } = await generateFullGallery(
          product, effectiveRefUrls, GEMINI_API_KEY, LOVABLE_API_KEY, supabase, SUPABASE_URL
        );

        const { error: updateErr } = await supabase
          .from("products")
          .update({
            image_url: heroUrl,
            additional_images: additionalUrls.length > 0 ? additionalUrls : null,
          })
          .eq("id", product.id);
        if (updateErr) throw new Error("Product update failed: " + updateErr.message);

        succeeded++;
        results.push({ productId: product.id, sku: product.sku, name: product.name, brand: product.brand, success: true, shots });
        console.log(`✓ Generated ${shots}-shot gallery for ${product.sku}`);
      } catch (err) {
        failed++;
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        results.push({ productId: product.id, sku: product.sku, name: product.name, brand: product.brand, success: false, error: errMsg });
        console.error(`✗ Failed for ${product.sku}:`, errMsg);
      }
    }

    return json({
      processed: products.length,
      succeeded,
      failed,
      skipped,
      remaining: Math.max(0, (remaining || 0) - succeeded),
      results,
    });
  } catch (error) {
    console.error("generate-product-image error:", error);
    return json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      500
    );
  }
});
