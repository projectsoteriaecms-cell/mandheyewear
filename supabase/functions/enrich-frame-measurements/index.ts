import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FrameProduct {
  id: string;
  name: string;
  description: string | null;
}

interface ExtractedMeasurements {
  lens_width: number | null;
  bridge_size: number | null;
  temple_length: number | null;
  frame_shape: string | null;
  frame_material: string | null;
}

/**
 * Try to extract measurements from product name/description using regex.
 * Patterns:
 *   - "54-18-145", "52–17–140" (hyphen/dash separated)
 *   - "54 18 145" (space separated, 3 numbers)
 *   - "55 47 17 140" (4 numbers: lens_width, frame_width, bridge, temple)
 */
function regexExtract(text: string): ExtractedMeasurements {
  const base = { frame_shape: null, frame_material: null };

  // Pattern 1: XX-XX-XXX (hyphen/dash separated)
  const dashPattern = /(\d{2})\s*[-–—]\s*(\d{2})\s*[-–—]\s*(\d{3})/;
  const dashMatch = text.match(dashPattern);
  if (dashMatch) {
    return {
      lens_width: parseInt(dashMatch[1], 10),
      bridge_size: parseInt(dashMatch[2], 10),
      temple_length: parseInt(dashMatch[3], 10),
      ...base,
    };
  }

  // Pattern 2: 4 space-separated numbers (lens, frame_width, bridge, temple)
  // e.g. "55 47 17 140"
  const fourNumPattern = /\b(\d{2})\s+(\d{2})\s+(\d{2})\s+(\d{3})\b/;
  const fourMatch = text.match(fourNumPattern);
  if (fourMatch) {
    return {
      lens_width: parseInt(fourMatch[1], 10),
      bridge_size: parseInt(fourMatch[3], 10),
      temple_length: parseInt(fourMatch[4], 10),
      ...base,
    };
  }

  // Pattern 3: 3 space-separated numbers (lens, bridge, temple)
  // e.g. "54 18 145"
  const threeNumPattern = /\b(\d{2})\s+(\d{2})\s+(\d{3})\b/;
  const threeMatch = text.match(threeNumPattern);
  if (threeMatch) {
    return {
      lens_width: parseInt(threeMatch[1], 10),
      bridge_size: parseInt(threeMatch[2], 10),
      temple_length: parseInt(threeMatch[3], 10),
      ...base,
    };
  }

  return { lens_width: null, bridge_size: null, temple_length: null, ...base };
}

/**
 * Use AI to extract measurements + shape + material when regex fails.
 */
async function aiExtract(
  name: string,
  description: string | null,
  apiKey: string
): Promise<ExtractedMeasurements> {
  const prompt = `Extract eyeglasses frame measurements from this product info. Return ONLY valid JSON.

Product name: "${name}"
${description ? `Description: "${description}"` : ""}

Return JSON: {"lens_width": number|null, "bridge_size": number|null, "temple_length": number|null, "frame_shape": "rectangle"|"round"|"oval"|"aviator"|"cat-eye"|"square"|"browline"|null, "frame_material": "acetate"|"metal"|"titanium"|"tr90"|"nylon"|"plastic"|"wood"|"mixed"|null}

Rules:
- lens_width is typically 40-62mm
- bridge_size is typically 14-24mm  
- temple_length is typically 120-155mm
- If a measurement like "54-18-145" appears, that means lens_width=54, bridge_size=18, temple_length=145
- If you can't determine a value with confidence, use null
- frame_shape should be inferred from brand/model keywords if possible
- frame_material should be inferred from keywords like "acetate", "metal", "titanium", etc.`;

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: "You extract eyeglasses measurements from product names. Return only JSON, no markdown." },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_measurements",
              description: "Extract frame measurements from product info",
              parameters: {
                type: "object",
                properties: {
                  lens_width: { type: ["number", "null"], description: "Lens width in mm (40-62)" },
                  bridge_size: { type: ["number", "null"], description: "Bridge size in mm (14-24)" },
                  temple_length: { type: ["number", "null"], description: "Temple length in mm (120-155)" },
                  frame_shape: {
                    type: ["string", "null"],
                    enum: ["rectangle", "round", "oval", "aviator", "cat-eye", "square", "browline", null],
                  },
                  frame_material: {
                    type: ["string", "null"],
                    enum: ["acetate", "metal", "titanium", "tr90", "nylon", "plastic", "wood", "mixed", null],
                  },
                },
                required: ["lens_width", "bridge_size", "temple_length", "frame_shape", "frame_material"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_measurements" } },
      }),
    }
  );

  if (!response.ok) {
    console.error("AI gateway error:", response.status);
    return { lens_width: null, bridge_size: null, temple_length: null, frame_shape: null, frame_material: null };
  }

  const data = await response.json();
  try {
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return {
        lens_width: typeof args.lens_width === "number" ? args.lens_width : null,
        bridge_size: typeof args.bridge_size === "number" ? args.bridge_size : null,
        temple_length: typeof args.temple_length === "number" ? args.temple_length : null,
        frame_shape: typeof args.frame_shape === "string" ? args.frame_shape : null,
        frame_material: typeof args.frame_material === "string" ? args.frame_material : null,
      };
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e);
  }
  return { lens_width: null, bridge_size: null, temple_length: null, frame_shape: null, frame_material: null };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { batch_size = 200, dry_run = false, mode = "all" } = await req.json().catch(() => ({}));

    // Build query for frame products
    let query = supabase
      .from("products")
      .select("id, name, description")
      .eq("item_type", "frames")
      .eq("is_active", true);

    // In "tryon_only" mode, only process products with images
    if (mode === "tryon_only") {
      query = query.not("image_url", "is", null);
    }

    const { data: products, error: fetchErr } = await query.limit(batch_size);
    if (fetchErr) throw fetchErr;

    // Get existing frame_attributes to skip already-enriched products
    const productIds = (products || []).map((p: any) => p.id);
    if (productIds.length === 0) {
      return new Response(
        JSON.stringify({ total_candidates: 0, message: "No products to process" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Batch lookup in chunks of 500 to avoid query limits
    const allExistingAttrs: any[] = [];
    for (let i = 0; i < productIds.length; i += 500) {
      const chunk = productIds.slice(i, i + 500);
      const { data: attrs } = await supabase
        .from("frame_attributes")
        .select("product_id, lens_width, bridge_size, temple_length")
        .in("product_id", chunk);
      if (attrs) allExistingAttrs.push(...attrs);
    }

    const alreadyEnriched = new Set(
      allExistingAttrs
        .filter((a: any) => a.lens_width != null && a.bridge_size != null && a.temple_length != null)
        .map((a: any) => a.product_id)
    );

    const hasPartialRecord = new Map(
      allExistingAttrs.map((a: any) => [a.product_id, true])
    );

    const toProcess = (products || []).filter(
      (p: FrameProduct) => !alreadyEnriched.has(p.id)
    );

    let enriched = 0;
    let regexHits = 0;
    let aiHits = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const product of toProcess) {
      try {
        const combined = `${product.name} ${product.description || ""}`;
        let measurements = regexExtract(combined);

        if (measurements.lens_width != null) {
          regexHits++;
        } else {
          // Fall back to AI
          measurements = await aiExtract(product.name, product.description, LOVABLE_API_KEY);
          if (measurements.lens_width != null) {
            aiHits++;
          }
          // Small delay to avoid rate limiting
          await new Promise((r) => setTimeout(r, 200));
        }

        // Only save if we got at least lens_width
        if (measurements.lens_width == null) {
          skipped++;
          continue;
        }

        if (dry_run) {
          enriched++;
          continue;
        }

        if (hasPartialRecord.has(product.id)) {
          // Update existing record (only null fields)
          const updates: Record<string, any> = {};
          if (measurements.lens_width != null) updates.lens_width = measurements.lens_width;
          if (measurements.bridge_size != null) updates.bridge_size = measurements.bridge_size;
          if (measurements.temple_length != null) updates.temple_length = measurements.temple_length;
          if (measurements.frame_shape != null) updates.frame_shape = measurements.frame_shape;
          if (measurements.frame_material != null) updates.frame_material = measurements.frame_material;

          const { error: updateErr } = await supabase
            .from("frame_attributes")
            .update(updates)
            .eq("product_id", product.id)
            .is("lens_width", null);

          if (updateErr) {
            errors.push(`Update ${product.id}: ${updateErr.message}`);
          } else {
            enriched++;
          }
        } else {
          // Insert new record
          const { error: insertErr } = await supabase
            .from("frame_attributes")
            .insert({
              product_id: product.id,
              lens_width: measurements.lens_width,
              bridge_size: measurements.bridge_size,
              temple_length: measurements.temple_length,
              frame_shape: measurements.frame_shape,
              frame_material: measurements.frame_material,
            });

          if (insertErr) {
            errors.push(`Insert ${product.id}: ${insertErr.message}`);
          } else {
            enriched++;
          }
        }
      } catch (e) {
        errors.push(`${product.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    return new Response(
      JSON.stringify({
        total_candidates: toProcess.length,
        already_enriched: alreadyEnriched.size,
        enriched,
        regex_hits: regexHits,
        ai_hits: aiHits,
        skipped,
        errors: errors.slice(0, 10),
        dry_run,
        mode,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("enrich-frame-measurements error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
