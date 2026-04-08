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
}

/**
 * Try to extract measurements from product name/description using regex first.
 * Pattern: digits-digits-digits (e.g., "54-18-145", "52 17-140")
 */
function regexExtract(text: string): ExtractedMeasurements {
  // Match patterns like 54-18-145, 52 17-140, 49-17-135
  const pattern = /(\d{2})\s*[-–]\s*(\d{2})\s*[-–]\s*(\d{3})/;
  const match = text.match(pattern);
  if (match) {
    return {
      lens_width: parseInt(match[1], 10),
      bridge_size: parseInt(match[2], 10),
      temple_length: parseInt(match[3], 10),
      frame_shape: null,
    };
  }
  return { lens_width: null, bridge_size: null, temple_length: null, frame_shape: null };
}

/**
 * Use AI to extract measurements when regex fails.
 */
async function aiExtract(
  name: string,
  description: string | null,
  apiKey: string
): Promise<ExtractedMeasurements> {
  const prompt = `Extract eyeglasses frame measurements from this product info. Return ONLY valid JSON.

Product name: "${name}"
${description ? `Description: "${description}"` : ""}

Return JSON: {"lens_width": number|null, "bridge_size": number|null, "temple_length": number|null, "frame_shape": "rectangle"|"round"|"oval"|"aviator"|"cat-eye"|"square"|"browline"|null}

Rules:
- lens_width is typically 40-62mm
- bridge_size is typically 14-24mm  
- temple_length is typically 120-155mm
- If a measurement like "54-18-145" appears, that means lens_width=54, bridge_size=18, temple_length=145
- If you can't determine a value with confidence, use null
- frame_shape should be inferred from brand/model keywords if possible`;

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
                },
                required: ["lens_width", "bridge_size", "temple_length", "frame_shape"],
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
    return { lens_width: null, bridge_size: null, temple_length: null, frame_shape: null };
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
      };
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e);
  }
  return { lens_width: null, bridge_size: null, temple_length: null, frame_shape: null };
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

    const { batch_size = 50, dry_run = false } = await req.json().catch(() => ({}));

    // Get try-on eligible frames without measurements
    const { data: products, error: fetchErr } = await supabase
      .from("products")
      .select("id, name, description")
      .eq("item_type", "frames")
      .eq("is_active", true)
      .not("image_url", "is", null)
      .limit(batch_size);

    if (fetchErr) throw fetchErr;

    // Get existing frame_attributes to skip already-enriched products
    const productIds = (products || []).map((p: any) => p.id);
    const { data: existingAttrs } = await supabase
      .from("frame_attributes")
      .select("product_id, lens_width, bridge_size, temple_length")
      .in("product_id", productIds);

    const alreadyEnriched = new Set(
      (existingAttrs || [])
        .filter((a: any) => a.lens_width != null && a.bridge_size != null && a.temple_length != null)
        .map((a: any) => a.product_id)
    );

    const hasPartialRecord = new Map(
      (existingAttrs || []).map((a: any) => [a.product_id, true])
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
