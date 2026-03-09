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
]);

function isBrandedFrame(brand: string | null): boolean {
  if (!brand) return false;
  return LUXURY_BRANDS.has(brand.toUpperCase().trim());
}

// ── Prompt builders for the 6-shot gallery ──

function describeProduct(p: any): string {
  const parts: string[] = [];
  if (p.brand) parts.push(p.brand);
  parts.push(p.name);
  if (p.color) parts.push(`in ${p.color}`);
  if (p.material) parts.push(`(${p.material})`);
  if (p.style) parts.push(`${p.style} style`);
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
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
  // Try direct Gemini first
  if (geminiApiKey) {
    try {
      const result = await generateImageViaGemini(prompt, geminiApiKey);
      console.log("  ✓ Generated via direct Gemini API");
      return result;
    } catch (err: any) {
      console.warn("  ⚠ Direct Gemini failed:", err?.message || err);
      if (!err?.fallback && !err?.retryable) {
        // Hard error from Gemini, still try Lovable
      }
    }
  }

  // Fallback to Lovable AI gateway
  if (lovableApiKey) {
    console.log("  → Falling back to Lovable AI gateway");
    return generateImageViaLovable(prompt, lovableApiKey);
  }

  throw new Error("No API keys available for image generation");
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

// ── Main handler ──
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY not configured" }, 500);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 1 } = await req.json().catch(() => ({}));

    // Count remaining
    const { count: remaining } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .or("image_url.is.null,image_url.eq.");

    // Get batch
    const { data: products, error: fetchErr } = await supabase
      .from("products")
      .select("id, name, brand, color, material, item_type, style, sku")
      .eq("is_active", true)
      .or("image_url.is.null,image_url.eq.")
      .order("item_type", { ascending: true })
      .limit(batchSize);

    if (fetchErr) {
      return json({ error: "Failed to fetch products: " + fetchErr.message }, 500);
    }

    if (!products || products.length === 0) {
      return json({ processed: 0, succeeded: 0, failed: 0, remaining: 0, results: [] });
    }

    // Sort by priority
    products.sort((a: any, b: any) => {
      const pa = ITEM_TYPE_PRIORITY[a.item_type || "other"] || 99;
      const pb = ITEM_TYPE_PRIORITY[b.item_type || "other"] || 99;
      return pa - pb;
    });

    const results: Array<{ productId: string; sku: string; success: boolean; error?: string; shots?: number }> = [];
    let succeeded = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const isFrame = product.item_type === "frames";

        if (isFrame) {
          // ── 6-shot gallery ──
          const shots = buildFramePrompts(product);
          const urls: string[] = [];
          let heroUrl = "";

          for (let i = 0; i < shots.length; i++) {
            const shot = shots[i];
            console.log(`  📸 ${product.sku} — generating ${shot.slug} (${i + 1}/6)`);

            let imageData: { data: string; mimeType: string } | null = null;
            let attempts = 0;

            while (attempts < 3) {
              try {
                imageData = await generateImage(shot.prompt, LOVABLE_API_KEY);
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

            if (shot.slug === "hero") {
              heroUrl = url;
            } else {
              urls.push(url);
            }

            // 2-second delay between shots to avoid rate limits
            if (i < shots.length - 1) {
              await new Promise((r) => setTimeout(r, 2000));
            }
          }

          // Update product with hero + additional images
          const { error: updateErr } = await supabase
            .from("products")
            .update({ image_url: heroUrl, additional_images: urls })
            .eq("id", product.id);

          if (updateErr) throw new Error("Product update failed: " + updateErr.message);

          succeeded++;
          results.push({ productId: product.id, sku: product.sku, success: true, shots: 6 });
          console.log(`✓ Generated 6-shot gallery for ${product.sku}`);
        } else {
          // ── Single shot for non-frames ──
          const prompt = buildNonFramePrompt(product);
          console.log(`  📸 ${product.sku} — generating single shot`);

          const imageData = await generateImage(prompt, LOVABLE_API_KEY);
          const url = await uploadImage(supabase, SUPABASE_URL, product.id, "primary", imageData);

          const { error: updateErr } = await supabase
            .from("products")
            .update({ image_url: url })
            .eq("id", product.id);

          if (updateErr) throw new Error("Product update failed: " + updateErr.message);

          succeeded++;
          results.push({ productId: product.id, sku: product.sku, success: true, shots: 1 });
          console.log(`✓ Generated image for ${product.sku}`);
        }
      } catch (err) {
        failed++;
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        results.push({ productId: product.id, sku: product.sku, success: false, error: errMsg });
        console.error(`✗ Failed for ${product.sku}:`, errMsg);
      }
    }

    return json({
      processed: products.length,
      succeeded,
      failed,
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
