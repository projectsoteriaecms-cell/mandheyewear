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
const MIN_REFERENCE_PHOTOS_KNOWN = 1;

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

// ── New balanced 6-shot gallery ──────────────────────────────────────────────
// Shot 1: hero          — studio 3/4, frame only (white bg)
// Shot 2: front         — studio dead-on, frame only (white bg)
// Shot 3: mannequin     — frame on dark display mannequin head
// Shot 4: lifestyle_male  — Black/African male model wearing the frame
// Shot 5: lifestyle_female — Black/African female model wearing the frame
// Shot 6: spec_diagram  — technical dimension illustration
// Removed: packaging (generated random pouches), side, rear, macro, tinted
// ─────────────────────────────────────────────────────────────────────────────

function buildFramePrompts(product: any, hasReference: boolean): { slug: string; prompt: string }[] {
  const desc = describeProduct(product);
  const branded = isBrandedFrame(product.brand);

  // ── Shared studio rules for white-background product shots ──
  const studioRule = [
    "STUDIO RULES (non-negotiable):",
    "• Background: seamless pure white #FFFFFF — no gradient, no texture, no vignette.",
    "• Lighting: large soft overhead softbox, neutral 5500K white balance, gentle diffused highlights. No harsh specular hot spots.",
    "• Shadow: a single very soft, low-opacity contact shadow directly beneath the frame — subtle realistic ground shadow only. No cast shadows anywhere else.",
    "• Lenses: clear and fully transparent unless the product is sunglasses (in which case preserve the original lens tint from the reference).",
    "• Composition: frame perfectly centred, occupying ≈70% of the canvas width, equal white margin on all four sides.",
    "• Focus: tack-sharp across the entire frame — every hinge screw, nose-pad edge, and temple tip must be razor sharp.",
    "• Output: square 1:1 crop, ultra-high resolution, commercial e-commerce catalog quality.",
    "• Absolutely no: model, face, hands, props, packaging, cases, text overlays, watermarks, or any object other than the eyewear frame itself.",
  ].join(" ");

  const brandDetail = branded
    ? `Preserve any original ${product.brand} logos, engravings, etched model numbers, or temple-tip markings EXACTLY as they appear.`
    : "";

  const frameAnchor = hasReference
    ? `The attached image is the actual reference photo of the "${desc}" eyewear. You MUST preserve the EXACT color, shape, material finish, proportions, hinge style, bridge style, and every visible design detail of this specific frame — treat it as the absolute ground truth.`
    : `Create a professional product photograph of the "${desc}" eyewear — ${product.color ? `${product.color}, ` : ""}${product.style || "eyeglasses"} style${product.brand ? `, by ${product.brand}` : ""}.`;

  // ── Shot 1: Studio Hero ───────────────────────────────────────────────────
  const heroPrompt = `${frameAnchor}

Re-render it as the MAIN e-commerce hero shot — the first image a customer sees on the product page.

View: Classic 3/4 front-left angle. The frame faces the viewer and is turned approximately 20–25° to the left (camera-right). Both temples are open at 90° and fully visible — the near temple is in tack-sharp focus, the far temple recedes naturally.
Purpose: Show the complete frame design, colour, material, and personality in a single compelling thumbnail image.
${brandDetail}
${studioRule}`;

  // ── Shot 2: Studio Front ──────────────────────────────────────────────────
  const frontPrompt = `${frameAnchor}

Re-render it as a DIRECT FRONT VIEW studio product photograph — perfectly symmetrical.

View: Camera positioned dead-centre at lens-height. Frame faces straight ahead. Both temples open and extending straight back. The lens openings are fully visible, bridge centred.
Purpose: Show the exact frame shape, lens height, bridge width, nose-pad position, and bilateral symmetry with zero distortion.
${brandDetail}
${studioRule}`;

  // ── Shot 3: Mannequin Display ─────────────────────────────────────────────
  const mannequinPrompt = `${frameAnchor}

Create a MANNEQUIN DISPLAY SHOT — the frame fitted on a professional eyewear display mannequin head, exactly as seen in premium optical boutiques and brand lookbooks.

MANNEQUIN: A matte black or dark charcoal plastic eyewear display bust head — abstract, sculptural, no hair, no expression (similar to a luxury retail display form). The head occupies the upper 60–70% of the frame. The glasses sit naturally on the mannequin: nose pads resting on the nose bridge, temples running back over where the ears would be, sitting at the correct angle.
FRAME ACCURACY: The frame must be IDENTICAL to the reference — exact colours, shape, and proportions. The mannequin simply provides wearing context.
COMPOSITION: Portrait crop, mannequin centred, frame clearly the visual hero. Show the 3/4 front angle naturally as it would appear when displayed.
BACKGROUND: Pure white or very light neutral grey studio background. Soft professional lighting that shows both the mannequin form and the frame detail equally well.
${brandDetail}
DO NOT show a human face — the mannequin must be an abstract sculptural display form only.`;

  // ── Shot 4: Lifestyle — Black/African Male Model ──────────────────────────
  const genderTarget = product.gender === "female" ? "male" : "male"; // show male for mixed/male; female for female-targeted frames
  const lifestyleMalePrompt = `${frameAnchor}

Create a PROFESSIONAL LIFESTYLE EDITORIAL PORTRAIT showing a Black/African man wearing these exact frames.

FRAME ACCURACY (critical): The eyewear worn in the output must be IDENTICAL to the reference — exact colours, shape, and proportions. Do not alter the frame design in any way.

PERSON: A well-groomed Black/African man, approximately 28–35 years old. Dark skin tone. Confident, composed expression — looking slightly off-camera or directly at the viewer. Natural, modern appearance.
STYLING: Smart casual or professional — clean contemporary style that reflects a modern African professional or lifestyle aesthetic.
EYEWEAR FIT: Frame sitting level on the nose bridge, nose pads correctly positioned, temples running straight back over the ears. Properly and comfortably worn.
COMPOSITION: Close-up bust or portrait shot. Both the person's face and the frame are in sharp, equal focus. The frame is clearly readable as the product hero.
BACKGROUND: Clean light grey or soft white studio backdrop. Alternatively: subtly blurred neutral lifestyle environment (soft bokeh — office, cafe, outdoor natural light).
LIGHTING: Professional portrait lighting that beautifully renders deep/dark skin tones — warm, flattering, luminous. No harsh facial shadows. The frame must remain clearly visible and sharp against the face.
MOOD: Confident, stylish, aspirational. The standard of a premium African eyewear brand's editorial campaign.
${brandDetail}`;

  // ── Shot 5: Lifestyle — Black/African Female Model ────────────────────────
  const lifestyleFemalePrompt = `${frameAnchor}

Create a PROFESSIONAL LIFESTYLE EDITORIAL PORTRAIT showing a Black/African woman wearing these exact frames.

FRAME ACCURACY (critical): The eyewear worn in the output must be IDENTICAL to the reference — exact colours, shape, and proportions. Do not alter the frame design in any way.

PERSON: A stylish Black/African woman, approximately 25–35 years old. Dark skin tone. Confident, elegant expression — looking slightly off-camera or directly at the viewer. Natural beauty — could have natural hair, braids, locs, or a headwrap. Modern and authentic.
STYLING: Elegant and contemporary — reflects premium modern African fashion sensibility. Could be smart casual, professional, or high-fashion editorial. Not stereotyped or traditional.
EYEWEAR FIT: Frame sitting level on the nose bridge, nose pads correctly positioned, temples running straight back. Properly and comfortably worn.
COMPOSITION: Close-up bust or portrait shot. Both the person's face and the frame are in sharp, equal focus. The frame is clearly readable as the product hero.
BACKGROUND: Clean light grey or soft white studio backdrop. Alternatively: subtly blurred neutral lifestyle environment with elegant warmth.
LIGHTING: Professional portrait lighting that beautifully renders deep/dark skin tones — warm, flattering, luminous. No harsh shadows. The frame must remain clearly visible and sharp.
MOOD: Sophisticated, confident, aspirational — the standard of a premium African eyewear brand lookbook. Authentic representation, not a generic stock photo aesthetic.
${brandDetail}`;

  // ── Shot 6: Technical Spec Diagram ────────────────────────────────────────
  const specDiagramPrompt = `${frameAnchor}

Using this reference to accurately trace the frame's silhouette and proportions, create a TECHNICAL SPECIFICATION DIAGRAM in the style used by premium eyewear brands like Zeelool, Mister Spex, and SmartBuyGlasses.

This is a TECHNICAL ILLUSTRATION — NOT a product photo. It must look like a precise engineering or product design drawing.

CONTENT — include ALL of the following:
1. FRONT VIEW OUTLINE: A clean, precise outline drawing of the frame front (no shading, no colour fill — outlines only). Add dimension annotation arrows:
   • Double-headed horizontal arrow spanning the full width at the top → label "TOTAL WIDTH"
   • Double-headed arrow across one lens opening (horizontal) → label "LENS WIDTH"
   • Double-headed arrow across the nose bridge → label "BRIDGE"
   • Double-headed arrow showing vertical lens height → label "LENS HEIGHT"
2. SIDE VIEW: A small outline of one temple arm (side profile) below or beside the front view, with a horizontal arrow → label "TEMPLE LENGTH"

VISUAL STYLE:
• Pure white background (#FFFFFF)
• Thin precise black lines only (1–2px weight, consistent)
• Dimension lines: standard technical drawing style — thin lines with small flat arrowheads at each end
• Labels: clean sans-serif font (Helvetica/Gill Sans style), small, positioned cleanly beside each arrow
• NO colour fill, NO shading, NO gradients — clean outline illustration only
• Minimal and professional — as if drawn in Adobe Illustrator by a product designer

PROPORTIONS: The silhouette must accurately reflect the shape and relative proportions of the frame from the reference. Estimate measurements based on the visible proportions and standard eyewear sizing conventions.`;

  return [
    { slug: "hero",             prompt: heroPrompt },
    { slug: "front",            prompt: frontPrompt },
    { slug: "mannequin",        prompt: mannequinPrompt },
    { slug: "lifestyle_male",   prompt: lifestyleMalePrompt },
    { slug: "lifestyle_female", prompt: lifestyleFemalePrompt },
    { slug: "spec_diagram",     prompt: specDiagramPrompt },
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

  // Frame: 6-shot gallery — use references whenever available
  const useReference = referenceImageUrls && referenceImageUrls.length > 0;
  const shots = buildFramePrompts(product, !!useReference);
  const refUrl = useReference ? referenceImageUrls![0] : null;

  const urls: string[] = [];
  // If anchor is locked, carry the existing image_url forward — never overwrite it
  let heroUrl = product.primary_image_locked && product.image_url ? product.image_url : "";

  for (let i = 0; i < shots.length; i++) {
    const shot = shots[i];

    // Skip hero generation when the anchor is locked — preserve it as-is
    if (shot.slug === "hero" && product.primary_image_locked) {
      console.log(`  🔒 ${product.sku} — hero locked, skipping (using existing anchor)`);
      continue;
    }

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

    const { batchSize = 1, itemTypes, maxProducts, productId, shotSlug, referenceImageUrls, customPrompt } = await req.json().catch(() => ({}));

    // ── Single-shot regeneration mode ──
    if (productId && shotSlug) {
      console.log(`🔄 Regenerating single shot "${shotSlug}" for product: ${productId}`);
      const { data: product, error: fetchErr } = await supabase
        .from("products")
        .select("id, name, brand, color, material, item_type, style, sku, image_url, additional_images, gender, primary_image_locked, frame_attributes(model_code, frame_shape, frame_material, front_color)")
        .eq("id", productId)
        .single();

      // Anchor lock: skip hero gracefully — treat as success so bulk loops continue
      if (shotSlug === "hero" && product?.primary_image_locked) {
        console.log(`🔒 ${product?.sku} — hero anchor locked, skipping (returning existing image_url)`);
        return json({
          processed: 1, succeeded: 1, failed: 0, remaining: 0,
          skipped: true,
          results: [{
            productId: product.id, sku: product.sku, success: true,
            skipped: true, shotSlug: "hero", reason: "ANCHOR_LOCKED",
            url: product.image_url,
            note: "Hero anchor is locked — existing image preserved",
          }],
        });
      }

      if (fetchErr || !product) {
        return json({ error: "Product not found: " + (fetchErr?.message || "unknown") }, 404);
      }
      // Flatten frame_attributes into product for prompt building
      const fa = Array.isArray(product.frame_attributes) ? product.frame_attributes[0] : product.frame_attributes;
      if (fa) { Object.assign(product, { model_code: fa.model_code, frame_shape: fa.frame_shape, frame_material: fa.frame_material }); }

      const SHOT_SLUGS = ["hero", "front", "mannequin", "lifestyle_male", "lifestyle_female", "spec_diagram"];
      const shotIndex = SHOT_SLUGS.indexOf(shotSlug);
      if (shotIndex === -1) {
        return json({ error: `Invalid shotSlug "${shotSlug}". Must be one of: ${SHOT_SLUGS.join(", ")}` }, 400);
      }

      try {
        // Determine reference image: explicit refs > product's own primary image
        const explicitRefs = Array.isArray(referenceImageUrls) && referenceImageUrls.length > 0 ? referenceImageUrls : null;
        const primaryRef = product.image_url ? [product.image_url] : null;
        const effectiveRefs = explicitRefs || primaryRef;
        const useReference = effectiveRefs && effectiveRefs.length > 0;
        
        const shots = buildFramePrompts(product, !!useReference);
        const shot = shots[shotIndex];
        // Use custom prompt if provided, otherwise use auto-generated
        const finalPrompt = customPrompt || shot.prompt;
        console.log(`  📸 ${product.sku} — ${customPrompt ? "custom prompt" : useReference ? "ref-editing" : "regenerating"} ${shot.slug}`);

        let imageData: { data: string; mimeType: string } | null = null;
        let attempts = 0;
        while (attempts < 3) {
          try {
            if (useReference && effectiveRefs) {
              imageData = await editImage(finalPrompt, effectiveRefs[0], GEMINI_API_KEY, LOVABLE_API_KEY);
            } else {
              imageData = await generateImage(finalPrompt, GEMINI_API_KEY, LOVABLE_API_KEY);
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
        .select("id, name, brand, color, material, item_type, style, sku, image_url, additional_images, gender, primary_image_locked, frame_attributes(model_code, frame_shape, frame_material, front_color)")
        .eq("id", productId)
        .single();

      if (fetchErr || !product) {
        return json({ error: "Product not found: " + (fetchErr?.message || "unknown") }, 404);
      }
      const fa2 = Array.isArray(product.frame_attributes) ? product.frame_attributes[0] : product.frame_attributes;
      if (fa2) { Object.assign(product, { model_code: fa2.model_code, frame_shape: fa2.frame_shape, frame_material: fa2.frame_material }); }

      // PDCA gate: ALL products need reference photos for frames
      const isFrame = product.item_type === "frames";
      const isKnown = isBrandedFrame(product.brand);
      const refUrls = Array.isArray(referenceImageUrls) ? referenceImageUrls : null;
      const existingImages = (product.image_url ? 1 : 0) + (product.additional_images?.length ?? 0);
      const minRequired = isKnown ? MIN_REFERENCE_PHOTOS_KNOWN : MIN_REFERENCE_PHOTOS;

      if (isFrame && (!refUrls || refUrls.length < minRequired) && existingImages < minRequired) {
        return json({
          error: isKnown
            ? `Upload at least ${MIN_REFERENCE_PHOTOS_KNOWN} reference photo for accurate generation of ${product.brand} frames.`
            : `House brand "${product.brand || 'unknown'}" requires at least ${MIN_REFERENCE_PHOTOS} reference photos. Upload real photos first.`,
          code: "NEEDS_REFERENCES",
          existingImages,
          required: minRequired,
        }, 400);
      }

      // Always use existing images as references when available (for ALL brands)
      const existingImageList = [product.image_url, ...(product.additional_images || [])].filter(Boolean) as string[];
      const effectiveRefUrls = refUrls || (existingImageList.length > 0 ? existingImageList.slice(0, 2) : null);

      try {
        const { heroUrl, additionalUrls, shots } = await generateFullGallery(
          product, effectiveRefUrls, GEMINI_API_KEY, LOVABLE_API_KEY, supabase, SUPABASE_URL
        );

        // Anchor lock: never overwrite the manually-uploaded primary
        const updatePayload: Record<string, unknown> = {
          additional_images: additionalUrls.length > 0 ? additionalUrls : null,
        };
        if (!product.primary_image_locked) {
          updatePayload.image_url = heroUrl;
        }
        const { error: updateErr } = await supabase
          .from("products")
          .update(updatePayload)
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
      .select("id, name, brand, color, material, item_type, style, sku, image_url, additional_images, gender, primary_image_locked, frame_attributes(model_code, frame_shape, frame_material, front_color)")
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

    // Flatten frame_attributes for each product
    for (const p of products) {
      const fa = Array.isArray(p.frame_attributes) ? p.frame_attributes[0] : p.frame_attributes;
      if (fa) { Object.assign(p, { model_code: fa.model_code, frame_shape: fa.frame_shape, frame_material: fa.frame_material }); }
    }

    const results: Array<{ productId: string; sku: string; name: string; brand: string | null; success: boolean; error?: string; shots?: number; skipped?: boolean }> = [];
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const product of products) {
      try {
        const isFrame = product.item_type === "frames";
        const isKnown = isBrandedFrame(product.brand);
        const existingImages = (product.image_url ? 1 : 0) + (product.additional_images?.length ?? 0);

        // PDCA gate for batch: skip frames without enough references
        const minRequired = isKnown ? MIN_REFERENCE_PHOTOS_KNOWN : MIN_REFERENCE_PHOTOS;
        if (isFrame && existingImages < minRequired) {
          skipped++;
          results.push({
            productId: product.id, sku: product.sku, name: product.name, brand: product.brand,
            success: false, skipped: true,
            error: `Needs ${minRequired} reference photo(s) (has ${existingImages})`,
          });
          console.log(`  ⏭ Skipped ${product.sku} — needs reference photos`);
          continue;
        }

        // Use existing images as references for ALL brands when available
        const existingImageList = [product.image_url, ...(product.additional_images || [])].filter(Boolean) as string[];
        const effectiveRefUrls = existingImageList.length > 0 ? existingImageList.slice(0, 2) : null;

        const { heroUrl, additionalUrls, shots } = await generateFullGallery(
          product, effectiveRefUrls, GEMINI_API_KEY, LOVABLE_API_KEY, supabase, SUPABASE_URL
        );

        const updatePayload: Record<string, unknown> = {
          additional_images: additionalUrls.length > 0 ? additionalUrls : null,
        };
        if (!product.primary_image_locked) {
          updatePayload.image_url = heroUrl;
        }
        const { error: updateErr } = await supabase
          .from("products")
          .update(updatePayload)
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
