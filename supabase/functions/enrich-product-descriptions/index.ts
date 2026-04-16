import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DESCRIPTION_TEMPLATE = `You are a luxury eyewear product copywriter for M&H Eyewear, a premium Nigerian eyewear retailer.

Generate a rich, structured HTML product description following this exact framework used by top platforms like FramesDirect, LensCrafters, and Gucci.com.

IMPORTANT RULES:
- Write in a warm, aspirational, luxury tone
- Use ONLY the data provided — do NOT invent specifications
- If a field is missing, omit that section entirely
- Output valid HTML only, no markdown
- Use semantic HTML: <section>, <h3>, <ul>, <li>, <p>, <table>
- Add CSS classes for styling: "desc-section", "desc-headline", "desc-features", "desc-measurements", "desc-brand", "desc-included"
- Keep the headline summary to 1-2 compelling sentences
- For known luxury brands (Gucci, Cartier, Tom Ford, etc.), include a brief brand heritage paragraph

HTML STRUCTURE:
<section class="desc-section desc-headline">
  <p>1-2 sentence headline summary</p>
</section>

<section class="desc-section desc-features">
  <h3>Key Features</h3>
  <ul>
    <li><strong>Frame Shape:</strong> ...</li>
    <li><strong>Frame Material:</strong> ...</li>
    <li><strong>Hinge Type:</strong> ...</li>
    <li><strong>Prescription Compatible:</strong> Yes/No</li>
    ...
  </ul>
</section>

<section class="desc-section desc-measurements">
  <h3>Measurements</h3>
  <table>
    <tr><td>Lens Width</td><td>...mm</td></tr>
    <tr><td>Bridge</td><td>...mm</td></tr>
    <tr><td>Temple Length</td><td>...mm</td></tr>
    <tr><td>Frame Width</td><td>...mm</td></tr>
  </table>
</section>

<section class="desc-section desc-color">
  <h3>Color & Finish</h3>
  <p>...</p>
</section>

<section class="desc-section desc-brand">
  <h3>Brand Heritage</h3>
  <p>...</p>
</section>

<section class="desc-section desc-included">
  <h3>What's Included</h3>
  <ul>
    <li>Original brand case</li>
    <li>Cleaning cloth</li>
    <li>Authenticity card</li>
  </ul>
</section>`;

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const is429 = err?.status === 429 || err?.message?.includes("429");
      if (!is429 || attempt === maxAttempts) throw err;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productIds, productId } = await req.json();
    const ids: string[] = productIds || (productId ? [productId] : []);

    if (!ids.length) {
      return new Response(JSON.stringify({ error: "productIds or productId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const id of ids) {
      try {
        // Fetch product + frame attributes
        const { data: product, error: pErr } = await supabase
          .from("products")
          .select("*, frame_attributes(*)")
          .eq("id", id)
          .single();

        if (pErr || !product) {
          results.push({ id, success: false, error: pErr?.message || "Not found" });
          continue;
        }

        const frame = product.frame_attributes?.[0] || product.frame_attributes || null;

        // Build context for AI
        const productContext = {
          name: product.name,
          brand: product.brand,
          sku: product.sku,
          price: product.price,
          item_type: product.item_type,
          color: product.color,
          material: product.material,
          style: product.style,
          gender: product.gender,
          frame_width: product.frame_width,
          bridge_size: product.bridge_size,
          temple_length: product.temple_length,
          is_prescription_compatible: product.is_prescription_compatible,
          description_raw: product.description_raw,
          description: product.description,
          frame_shape: frame?.frame_shape,
          frame_material: frame?.frame_material,
          front_color: frame?.front_color,
          temple_color: frame?.temple_color,
          model_code: frame?.model_code,
          lens_width: frame?.lens_width,
          bridge_size_mm: frame?.bridge_size,
          temple_length_mm: frame?.temple_length,
          has_clip_on: frame?.has_clip_on,
        };

        // Call Gemini API with model fallback chain
        const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"];
        let aiResponse: any = null;

        for (const model of MODELS) {
          try {
            aiResponse = await withRetry(async () => {
              const resp = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    systemInstruction: { parts: [{ text: DESCRIPTION_TEMPLATE }] },
                    contents: [
                      {
                        role: "user",
                        parts: [
                          {
                            text: `Generate a rich HTML product description for this eyewear product:\n\n${JSON.stringify(productContext, null, 2)}\n\nReturn ONLY the HTML, no explanation or wrapping.`,
                          },
                        ],
                      },
                    ],
                    generationConfig: {
                      temperature: 0.7,
                      maxOutputTokens: 2048,
                    },
                  }),
                }
              );

              if (!resp.ok) {
                const errText = await resp.text();
                const err: any = new Error(`Gemini API error (${model}): ${resp.status} ${errText}`);
                err.status = resp.status;
                throw err;
              }

              return resp.json();
            });
            console.log(`Successfully used model: ${model}`);
            break; // Success, stop trying models
          } catch (err: any) {
            console.warn(`Model ${model} failed: ${err.message}`);
            if (model === MODELS[MODELS.length - 1]) throw err; // Last model, propagate
          }
        }

        const descriptionHtml =
          aiResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (!descriptionHtml) {
          results.push({ id, success: false, error: "Empty AI response" });
          continue;
        }

        // Clean any markdown code fences
        const cleanHtml = descriptionHtml
          .replace(/^```html?\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();

        // Also generate a plain-text summary for the description field
        const plainSummary = cleanHtml
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500);

        // Update product
        const { error: updateErr } = await supabase
          .from("products")
          .update({
            description_html: cleanHtml,
            description: plainSummary,
          })
          .eq("id", id);

        if (updateErr) {
          results.push({ id, success: false, error: updateErr.message });
        } else {
          results.push({ id, success: true });
        }

        // Small delay between products to avoid rate limits
        if (ids.length > 1) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      } catch (err: any) {
        results.push({ id, success: false, error: err.message });
      }
    }

    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return new Response(
      JSON.stringify({ results, succeeded, failed, total: ids.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("enrich-product-descriptions error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
