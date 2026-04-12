import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const KNOWN_BRANDS: Record<string, string> = {
  "cartier": "Cartier",
  "gucci": "Gucci",
  "ray-ban": "Ray-Ban",
  "rayban": "Ray-Ban",
  "ray ban": "Ray-Ban",
  "oakley": "Oakley",
  "prada": "Prada",
  "versace": "Versace",
  "burberry": "Burberry",
  "chanel": "Chanel",
  "dior": "Dior",
  "fendi": "Fendi",
  "tom ford": "Tom Ford",
  "tomford": "Tom Ford",
  "dolce": "Dolce & Gabbana",
  "d&g": "Dolce & Gabbana",
  "armani": "Emporio Armani",
  "emporio armani": "Emporio Armani",
  "emporio": "Emporio Armani",
  "giorgio armani": "Giorgio Armani",
  "vogue": "Vogue",
  "polaroid": "Polaroid",
  "coach": "Coach",
  "michael kors": "Michael Kors",
  "nike": "Nike",
  "silhouette": "Silhouette",
  "bvlgari": "Bvlgari",
  "bulgari": "Bvlgari",
  "tiffany": "Tiffany & Co.",
  "swarovski": "Swarovski",
  "jimmy choo": "Jimmy Choo",
  "mont blanc": "Mont Blanc",
  "montblanc": "Mont Blanc",
  "boss": "Hugo Boss",
  "hugo boss": "Hugo Boss",
  "calvin klein": "Calvin Klein",
  "ck": "Calvin Klein",
  "persol": "Persol",
  "maui jim": "Maui Jim",
  "carrera": "Carrera",
  "fossil": "Fossil",
  "lacoste": "Lacoste",
  "kate spade": "Kate Spade",
  "ralph lauren": "Ralph Lauren",
  "polo": "Ralph Lauren",
  "chopard": "Chopard",
  "balmain": "Balmain",
  "cazal": "Cazal",
  "celine": "Celine",
  "saint laurent": "Saint Laurent",
  "ysl": "Saint Laurent",
  "bottega": "Bottega Veneta",
  "miu miu": "Miu Miu",
  "salvatore ferragamo": "Salvatore Ferragamo",
  "ferragamo": "Salvatore Ferragamo",
  "alexander mcqueen": "Alexander McQueen",
  "mcqueen": "Alexander McQueen",
  "balenciaga": "Balenciaga",
  "givenchy": "Givenchy",
  "loewe": "Loewe",
  "valentino": "Valentino",
  "roberto cavalli": "Roberto Cavalli",
  "cavalli": "Roberto Cavalli",
  "marc jacobs": "Marc Jacobs",
  "tommy hilfiger": "Tommy Hilfiger",
  "tommy": "Tommy Hilfiger",
  "ic berlin": "IC Berlin",
  "lindberg": "Lindberg",
  "mykita": "Mykita",
  "moscot": "Moscot",
  "barton perreira": "Barton Perreira",
  "oliver peoples": "Oliver Peoples",
  "garrett leight": "Garrett Leight",
  "jacques marie mage": "Jacques Marie Mage",
  "chrome hearts": "Chrome Hearts",
  "gentle monster": "Gentle Monster",
  "porsche design": "Porsche Design",
  "porsche": "Porsche Design",
  "fred": "Fred",
  "maybach": "Maybach",
  "bolon": "Bolon",
  "longchamp": "Longchamp",
  "carolina herrera": "Carolina Herrera",
  "herrera": "Carolina Herrera",
  "pierre cardin": "Pierre Cardin",
  "guess": "Guess",
  "police": "Police",
  "arnette": "Arnette",
  "smith": "Smith Optics",
  "costa": "Costa Del Mar",
  "under armour": "Under Armour",
  "adidas": "Adidas",
  "puma": "Puma",
  "hublot": "Hublot",
  "titanium": "Titanium",
  "flexi": "Flexi",
  "stepper": "Stepper",
  "safilo": "Safilo",
  "rodenstock": "Rodenstock",
  "eye": "Eye",
};

// Sort brand keys by length descending so longer matches win
const BRAND_KEYS = Object.keys(KNOWN_BRANDS).sort((a, b) => b.length - a.length);

function extractBrand(name: string): string | null {
  const lower = name.toLowerCase();
  for (const key of BRAND_KEYS) {
    // Match at word boundary
    const idx = lower.indexOf(key);
    if (idx !== -1) {
      const before = idx === 0 || /[\s,\-:]/.test(lower[idx - 1]);
      const after = idx + key.length >= lower.length || /[\s,\-:]/.test(lower[idx + key.length]);
      if (before && after) {
        return KNOWN_BRANDS[key];
      }
    }
  }
  return null;
}

function cleanProductName(name: string, itemType: string | null): { cleaned: string; brand: string | null } {
  let cleaned = name;

  // 1. Strip category prefixes
  cleaned = cleaned.replace(/^(Frame|Frames|FRAME|FRAMES|Contact Lens|Contact Lenses|CONTACT LENS|CONTACT LENSES|Contact Lens Solution|Drugs|DRUGS|ACCESSORIES|Accessories|Solutions|Medications|Other|Cleanser|Packaging)\s*:\s*/i, "");

  // 2. Strip embedded prices - various patterns
  // "2,600,000" or "105,000" or "1,200,000"
  cleaned = cleaned.replace(/\b\d{1,3}(,\d{3}){1,3}\b/g, "");
  // "N105,000" or "₦2,600,000"  
  cleaned = cleaned.replace(/[N₦]\s*\d{1,3}(,\d{3}){0,3}/gi, "");
  // "15K" "120K" "1.2M" patterns (standalone, not part of model numbers)
  cleaned = cleaned.replace(/\b(\d{1,4}(\.\d)?)\s*[Kk]\b/g, (match, num) => {
    const val = parseFloat(num);
    // Only strip if it looks like a price (>= 5K)
    return val >= 5 ? "" : match;
  });

  // 3. Strip redundant "FRAME" / "FRAMES" when item_type is frames
  if (itemType === "frames") {
    cleaned = cleaned.replace(/\bFRAMES?\b/gi, "");
  }

  // 4. Extract brand before further processing
  const brand = extractBrand(cleaned);

  // 5. Clean up extra whitespace
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  // Remove leading/trailing dashes, colons, commas
  cleaned = cleaned.replace(/^[\s\-:,]+|[\s\-:,]+$/g, "").trim();

  // 6. Title Case - but preserve model codes (uppercase sequences with numbers)
  cleaned = cleaned
    .split(" ")
    .map((word) => {
      // If it looks like a model code (has digits mixed with letters, or all caps short), keep as-is
      if (/\d/.test(word) || (word.length <= 4 && word === word.toUpperCase())) {
        return word;
      }
      // Title case
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // 7. Final cleanup
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

  // If cleaned name is empty or too short, keep a sanitized version of original
  if (cleaned.length < 3) {
    cleaned = name.replace(/^[^:]*:\s*/, "").trim();
  }

  return { cleaned, brand };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const body = await req.json();
    const { action = "preview", brand_line = "all", limit = 50, offset = 0, push_to_zoho = false } = body;

    // Build query for products that need cleanup
    let query = supabase
      .from("products")
      .select("id, name, brand, item_type, brand_line, zoho_item_id, description_raw")
      .eq("is_active", true);

    if (brand_line !== "all") {
      query = query.eq("brand_line", brand_line);
    }

    // Filter for products that likely need cleanup
    // Has category prefix OR embedded price OR no brand
    query = query.or(
      "name.ilike.Frame :%,name.ilike.ACCESSORIES :%,name.ilike.Contact Lens :%,name.ilike.Drugs :%,name.ilike.Contact Lens Solution:%,brand.is.null,brand.eq.[NEEDS_RESEARCH]"
    );

    if (action === "preview") {
      const { data: products, error, count } = await query
        .range(offset, offset + limit - 1)
        .order("name");

      if (error) throw error;

      // Get total count
      let countQuery = supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);

      if (brand_line !== "all") {
        countQuery = countQuery.eq("brand_line", brand_line);
      }
      countQuery = countQuery.or(
        "name.ilike.Frame :%,name.ilike.ACCESSORIES :%,name.ilike.Contact Lens :%,name.ilike.Drugs :%,name.ilike.Contact Lens Solution:%,brand.is.null,brand.eq.[NEEDS_RESEARCH]"
      );

      const { count: totalCount } = await countQuery;

      const previews = (products || []).map((p) => {
        const { cleaned, brand } = cleanProductName(p.name, p.item_type);
        return {
          id: p.id,
          original_name: p.name,
          cleaned_name: cleaned,
          original_brand: p.brand,
          extracted_brand: brand,
          brand_line: p.brand_line,
          has_zoho: !!p.zoho_item_id,
        };
      });

      return new Response(
        JSON.stringify({ previews, total: totalCount || 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "execute") {
      // Process ALL matching products in batches
      const BATCH_SIZE = 100;
      let totalUpdated = 0;
      let totalFailed = 0;
      let totalProcessed = 0;
      const errors: { id: string; error: string }[] = [];
      const updatedProductIds: string[] = [];

      let currentOffset = 0;
      let hasMore = true;

      while (hasMore) {
        let batchQuery = supabase
          .from("products")
          .select("id, name, brand, item_type, brand_line, zoho_item_id, description_raw")
          .eq("is_active", true);

        if (brand_line !== "all") {
          batchQuery = batchQuery.eq("brand_line", brand_line);
        }

        batchQuery = batchQuery.or(
          "name.ilike.Frame :%,name.ilike.ACCESSORIES :%,name.ilike.Contact Lens :%,name.ilike.Drugs :%,name.ilike.Contact Lens Solution:%,brand.is.null,brand.eq.[NEEDS_RESEARCH]"
        );

        const { data: batch, error } = await batchQuery
          .range(currentOffset, currentOffset + BATCH_SIZE - 1)
          .order("id");

        if (error) throw error;
        if (!batch || batch.length === 0) {
          hasMore = false;
          break;
        }

        for (const product of batch) {
          try {
            const { cleaned, brand } = cleanProductName(product.name, product.item_type);

            const updateData: Record<string, unknown> = {
              name: cleaned,
              // Store original name for audit trail (only if not already stored)
              description_raw: product.description_raw || product.name,
            };

            // Only set brand if we extracted one and current is null/NEEDS_RESEARCH
            if (brand && (!product.brand || product.brand === "[NEEDS_RESEARCH]")) {
              updateData.brand = brand;
            }

            const { error: updateError } = await supabase
              .from("products")
              .update(updateData)
              .eq("id", product.id);

            if (updateError) {
              totalFailed++;
              errors.push({ id: product.id, error: updateError.message });
            } else {
              totalUpdated++;
              updatedProductIds.push(product.id);
            }
          } catch (e) {
            totalFailed++;
            errors.push({ id: product.id, error: e.message });
          }
          totalProcessed++;
        }

        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        } else {
          currentOffset += BATCH_SIZE;
        }
      }

      // Trigger Zoho push if requested
      let zohoResult = null;
      if (push_to_zoho && updatedProductIds.length > 0) {
        try {
          const zohoProductIds = [];
          // Only push products that have zoho_item_id
          const { data: zohoProducts } = await supabase
            .from("products")
            .select("id")
            .in("id", updatedProductIds)
            .not("zoho_item_id", "is", null);

          if (zohoProducts && zohoProducts.length > 0) {
            zohoProductIds.push(...zohoProducts.map((p) => p.id));
          }

          if (zohoProductIds.length > 0) {
            const zohoResp = await fetch(
              `${supabaseUrl}/functions/v1/zoho-sync`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${serviceKey}`,
                },
                body: JSON.stringify({
                  action: "push_updates",
                  product_ids: zohoProductIds,
                }),
              }
            );
            zohoResult = await zohoResp.json();
          }
        } catch (e) {
          zohoResult = { error: e.message };
        }
      }

      return new Response(
        JSON.stringify({
          updated: totalUpdated,
          failed: totalFailed,
          total: totalProcessed,
          errors: errors.slice(0, 50),
          zoho_result: zohoResult,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'preview' or 'execute'" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
