import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

function buildPrompt(product: any): string {
  const { name, brand, color, material, item_type, style } = product;
  const parts: string[] = [];

  switch (item_type) {
    case "frames":
      parts.push("Professional product photo of");
      if (brand) parts.push(brand);
      parts.push(name);
      parts.push("eyeglasses frame");
      if (color) parts.push(`, ${color} color`);
      if (material) parts.push(`, ${material} material`);
      if (style) parts.push(`, ${style} style`);
      parts.push(". Studio lighting, pure white background, e-commerce product photography, high resolution, no model, frame only, centered composition.");
      break;
    case "contact_lenses":
      parts.push(`Product photo of ${name} contact lens box packaging`);
      if (brand) parts.push(`by ${brand}`);
      parts.push(". Clean studio shot, white background, e-commerce style, high resolution.");
      break;
    case "lenses":
      parts.push(`Product photo of ${name} optical lens`);
      if (brand) parts.push(`by ${brand}`);
      parts.push(". Clean studio shot, white background, e-commerce style, high resolution.");
      break;
    case "solutions":
      parts.push(`Product photo of ${name} eye care solution bottle`);
      if (brand) parts.push(`by ${brand}`);
      parts.push(". Clean studio shot, white background, e-commerce product photography.");
      break;
    default:
      parts.push(`Professional product photo of ${name}`);
      if (brand) parts.push(`by ${brand}`);
      parts.push(". Studio shot, white background, e-commerce style, high resolution.");
      break;
  }

  return parts.join(" ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      return json({ error: "GEMINI_API_KEY not configured" }, 500);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { batchSize = 5 } = await req.json().catch(() => ({}));

    // Get count of remaining products
    const { count: remaining } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .or("image_url.is.null,image_url.eq.");

    // Get batch of products missing images, ordered by item_type priority
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

    // Sort by priority (since DB sort on enum may not match our desired order)
    products.sort((a: any, b: any) => {
      const pa = ITEM_TYPE_PRIORITY[a.item_type || "other"] || 99;
      const pb = ITEM_TYPE_PRIORITY[b.item_type || "other"] || 99;
      return pa - pb;
    });

    const results: Array<{ productId: string; sku: string; success: boolean; error?: string }> = [];
    let succeeded = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const prompt = buildPrompt(product);
        console.log(`Generating image for: ${product.sku} - ${product.name}`);

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

        const geminiResp = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["image", "text"],
              temperature: 0.4,
            },
          }),
        });

        if (!geminiResp.ok) {
          const errText = await geminiResp.text().catch(() => "");
          if (geminiResp.status === 429) {
            // Rate limited - wait and retry once
            console.warn("Rate limited, waiting 5s before retry...");
            await new Promise((r) => setTimeout(r, 5000));
            const retryResp = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  responseModalities: ["image", "text"],
                  temperature: 0.4,
                },
              }),
            });
            if (!retryResp.ok) {
              const retryErr = await retryResp.text().catch(() => "");
              throw new Error(`Gemini API error after retry: ${retryResp.status} - ${retryErr}`);
            }
            const retryResult = await retryResp.json();
            const retryImg = extractImage(retryResult);
            if (!retryImg) throw new Error("No image in retry response");
            await uploadAndUpdate(supabase, SUPABASE_URL, product.id, retryImg);
          } else {
            throw new Error(`Gemini API error: ${geminiResp.status} - ${errText}`);
          }
        } else {
          const result = await geminiResp.json();
          const imageData = extractImage(result);
          if (!imageData) {
            throw new Error("No image data in Gemini response");
          }
          await uploadAndUpdate(supabase, SUPABASE_URL, product.id, imageData);
        }

        succeeded++;
        results.push({ productId: product.id, sku: product.sku, success: true });
        console.log(`✓ Generated image for ${product.sku}`);

        // Small delay between items to avoid rate limiting
        await new Promise((r) => setTimeout(r, 1000));
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

function extractImage(result: any): { data: string; mimeType: string } | null {
  const parts = result?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part?.inlineData?.data && part?.inlineData?.mimeType) {
      return { data: part.inlineData.data, mimeType: part.inlineData.mimeType };
    }
  }
  return null;
}

async function uploadAndUpdate(
  supabase: any,
  supabaseUrl: string,
  productId: string,
  imageData: { data: string; mimeType: string }
) {
  // Decode base64 to Uint8Array
  const binaryStr = atob(imageData.data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const ext = imageData.mimeType.includes("png") ? "png" : "webp";
  const filePath = `${productId}/primary.${ext}`;

  // Upload to storage
  const { error: uploadErr } = await supabase.storage
    .from("product-images")
    .upload(filePath, bytes, {
      contentType: imageData.mimeType,
      upsert: true,
    });

  if (uploadErr) {
    throw new Error("Storage upload failed: " + uploadErr.message);
  }

  // Get public URL
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${filePath}`;

  // Update product record
  const { error: updateErr } = await supabase
    .from("products")
    .update({ image_url: publicUrl })
    .eq("id", productId);

  if (updateErr) {
    throw new Error("Product update failed: " + updateErr.message);
  }
}
