import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BATCH_SIZE_PER_AI_CALL = 20;
const MAX_AI_CALLS_PER_INVOCATION = 5;
const DELAY_BETWEEN_CALLS_MS = 600;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Verify the caller is admin/super_admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) throw new Error("Unauthorized");

    // Check role
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleCheck } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });
    const { data: superCheck } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "super_admin",
    });
    if (!roleCheck && !superCheck) throw new Error("Insufficient permissions");

    const body = await req.json().catch(() => ({}));
    const dryRun = body.dryRun === true;
    const maxProducts = body.maxProducts || BATCH_SIZE_PER_AI_CALL * MAX_AI_CALLS_PER_INVOCATION;

    // Fetch unenriched frame products
    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, name, description, sku, brand_line, color, brand, style, material, gender")
      .eq("is_active", true)
      .eq("item_type", "frames")
      .is("style", null)
      .order("created_at", { ascending: true })
      .limit(maxProducts);

    if (fetchError) throw new Error(`Failed to fetch products: ${fetchError.message}`);
    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ done: true, enriched: 0, failed: 0, remaining: 0, message: "No unenriched products found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalEnriched = 0;
    let totalFailed = 0;
    const errors: Array<{ productId: string; error: string }> = [];

    // Process in batches
    const batches: typeof products[] = [];
    for (let i = 0; i < products.length; i += BATCH_SIZE_PER_AI_CALL) {
      batches.push(products.slice(i, i + BATCH_SIZE_PER_AI_CALL));
    }

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];

      if (batchIdx > 0) {
        await new Promise((r) => setTimeout(r, DELAY_BETWEEN_CALLS_MS));
      }

      try {
        const productList = batch
          .map(
            (p, i) =>
              `${i + 1}. ID: ${p.id} | Name: "${p.name}" | SKU: "${p.sku}" | Description: "${p.description || ""}" | Brand Line: ${p.brand_line}`
          )
          .join("\n");

        const systemPrompt = `You are a product metadata extraction specialist for an eyewear company. Given a list of eyewear product names and descriptions, extract structured attributes for each product.

Use ONLY these allowed values:

**style**: Rectangular, Square, Round, Oval, Cat Eye, Aviator, Wraparound, Geometric, Butterfly, Browline, Clubmaster, Wayfarer, Sport, Shield, Oversized, Rimless, Semi-Rimless, Other
**material**: Acetate, Metal, Titanium, TR90, Plastic, Stainless Steel, Carbon Fiber, Wood, Mixed, Nylon, Other
**gender**: male, female, unisex, kids
**color**: Extract the primary color from the name. Use simple color names (Black, Brown, Gold, Silver, Tortoise, Blue, Red, Green, Pink, White, Grey, Havana, Crystal, Nude, Burgundy, Navy, etc.)
**brand**: Extract the brand name from the product name (e.g., "Ray-Ban", "Chanel", "Charlie Temple", "Prada", etc.)

If you cannot confidently determine a value, use null. Parse dimensions from names like "51 23 145" (lens-bridge-temple).`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Extract metadata for these ${batch.length} eyewear products:\n\n${productList}`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "enrich_products",
                  description: "Submit extracted metadata for a batch of products",
                  parameters: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string", description: "Product UUID" },
                            brand: { type: ["string", "null"] },
                            style: { type: ["string", "null"] },
                            material: { type: ["string", "null"] },
                            color: { type: ["string", "null"] },
                            gender: { type: ["string", "null"], enum: ["male", "female", "unisex", "kids", null] },
                          },
                          required: ["id"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["products"],
                    additionalProperties: false,
                  },
                },
              },
            ],
            tool_choice: { type: "function", function: { name: "enrich_products" } },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          if (response.status === 429) {
            console.error("Rate limited, stopping batch processing");
            errors.push({ productId: "batch", error: `Rate limited at batch ${batchIdx + 1}` });
            break;
          }
          throw new Error(`AI gateway error ${response.status}: ${errText}`);
        }

        const aiResult = await response.json();
        const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
        if (!toolCall?.function?.arguments) {
          throw new Error("No tool call in AI response");
        }

        const extracted = JSON.parse(toolCall.function.arguments);
        const enrichedProducts = extracted.products || [];

        if (dryRun) {
          totalEnriched += enrichedProducts.length;
          console.log(`[DRY RUN] Batch ${batchIdx + 1}: Would enrich ${enrichedProducts.length} products`);
          continue;
        }

        // Write updates back to DB
        for (const ep of enrichedProducts) {
          const updates: Record<string, string | null> = {};
          const original = batch.find((p) => p.id === ep.id);
          if (!original) continue;

          // Only set NULL fields
          if (!original.brand && ep.brand) updates.brand = ep.brand;
          if (!original.style && ep.style) updates.style = ep.style;
          if (!original.material && ep.material) updates.material = ep.material;
          if (!original.color && ep.color) updates.color = ep.color;
          if (!original.gender && ep.gender) updates.gender = ep.gender;

          if (Object.keys(updates).length === 0) continue;

          const { error: updateError } = await supabase
            .from("products")
            .update(updates)
            .eq("id", ep.id);

          if (updateError) {
            totalFailed++;
            errors.push({ productId: ep.id, error: updateError.message });
          } else {
            totalEnriched++;
          }
        }
      } catch (batchError) {
        console.error(`Batch ${batchIdx + 1} error:`, batchError);
        totalFailed += batch.length;
        errors.push({
          productId: `batch-${batchIdx + 1}`,
          error: batchError instanceof Error ? batchError.message : "Unknown error",
        });
      }
    }

    // Count remaining
    const { count: remaining } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("item_type", "frames")
      .is("style", null);

    return new Response(
      JSON.stringify({
        done: (remaining || 0) === 0,
        enriched: totalEnriched,
        failed: totalFailed,
        remaining: remaining || 0,
        processed: products.length,
        dryRun,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("enrich-products error:", e);
    const message = e instanceof Error ? e.message : "Unknown error";
    const status = message.includes("Unauthorized") || message.includes("Insufficient") ? 403 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
