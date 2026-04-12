import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const KNOWN_BRANDS: Record<string, string> = {
  // Luxury
  "cartier": "Cartier",
  "gucci": "Gucci",
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
  "dolce & gabbana": "Dolce & Gabbana",
  "dolce and gabbana": "Dolce & Gabbana",
  "armani": "Emporio Armani",
  "emporio armani": "Emporio Armani",
  "emporio": "Emporio Armani",
  "giorgio armani": "Giorgio Armani",
  "bvlgari": "Bvlgari",
  "bulgari": "Bvlgari",
  "tiffany": "Tiffany & Co.",
  "chopard": "Chopard",
  "balmain": "Balmain",
  "cazal": "Cazal",
  "celine": "Celine",
  "saint laurent": "Saint Laurent",
  "ysl": "Saint Laurent",
  "bottega": "Bottega Veneta",
  "bottega veneta": "Bottega Veneta",
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
  "fred": "Fred",
  "maybach": "Maybach",
  "jacques marie mage": "Jacques Marie Mage",
  "chrome hearts": "Chrome Hearts",
  "hublot": "Hublot",

  // Premium
  "ray-ban": "Ray-Ban",
  "rayban": "Ray-Ban",
  "ray ban": "Ray-Ban",
  "oakley": "Oakley",
  "coach": "Coach",
  "michael kors": "Michael Kors",
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
  "kate spade": "Kate Spade",
  "ralph lauren": "Ralph Lauren",
  "polo": "Ralph Lauren",
  "marc jacobs": "Marc Jacobs",
  "tommy hilfiger": "Tommy Hilfiger",
  "tommy": "Tommy Hilfiger",
  "gentle monster": "Gentle Monster",
  "porsche design": "Porsche Design",
  "porsche": "Porsche Design",
  "longchamp": "Longchamp",
  "carolina herrera": "Carolina Herrera",
  "herrera": "Carolina Herrera",
  "swarovski": "Swarovski",
  "oliver peoples": "Oliver Peoples",
  "barton perreira": "Barton Perreira",
  "garrett leight": "Garrett Leight",
  "ic berlin": "IC Berlin",
  "lindberg": "Lindberg",
  "mykita": "Mykita",
  "moscot": "Moscot",

  // Mid-range & Sport
  "vogue": "Vogue",
  "polaroid": "Polaroid",
  "nike": "Nike",
  "fossil": "Fossil",
  "lacoste": "Lacoste",
  "guess": "Guess",
  "police": "Police",
  "arnette": "Arnette",
  "smith": "Smith Optics",
  "costa": "Costa Del Mar",
  "under armour": "Under Armour",
  "adidas": "Adidas",
  "puma": "Puma",
  "pierre cardin": "Pierre Cardin",
  "bolon": "Bolon",

  // Clinical / Soteria common brands
  "silhouette": "Silhouette",
  "stepper": "Stepper",
  "safilo": "Safilo",
  "rodenstock": "Rodenstock",
  "flexi": "Flexi",
  "titanium": "Titanium",
  "eye": "Eye",
  "john richmond": "John Richmond",
  "richmond": "John Richmond",
  "alex barkey": "Alex Barkey",
  "barkey": "Alex Barkey",
  "oga": "OGA",
  "morel": "Morel",
  "lightec": "Lightec",
  "koali": "Koali",
  "nomad": "Nomad",
  "oxibis": "Oxibis",
  "philippe charriol": "Philippe Charriol",
  "charriol": "Philippe Charriol",
  "zeiss": "Zeiss",
  "hoya": "Hoya",
  "essilor": "Essilor",
  "crizal": "Crizal",
  "transitions": "Transitions",
  "varilux": "Varilux",
  "nikon": "Nikon",
  "seiko": "Seiko",
  "acuvue": "Acuvue",
  "alcon": "Alcon",
  "bausch": "Bausch + Lomb",
  "bausch & lomb": "Bausch + Lomb",
  "bausch and lomb": "Bausch + Lomb",
  "cooper vision": "CooperVision",
  "coopervision": "CooperVision",
  "soflens": "SofLens",
  "freshlook": "FreshLook",
  "air optix": "Air Optix",
  "dailies": "Dailies",
  "proclear": "Proclear",
  "biofinity": "Biofinity",
  "avaira": "Avaira",
  "biotrue": "Biotrue",
  "renu": "ReNu",
  "opti-free": "Opti-Free",
  "optifree": "Opti-Free",
  "complete": "Complete",
  "solo care": "Solo Care",
  "boston": "Boston",
  "systane": "Systane",
  "refresh": "Refresh",
  "genteal": "GenTeal",
  "visine": "Visine",
  "allergan": "Allergan",
  "restasis": "Restasis",
  "lumigan": "Lumigan",
  "xalatan": "Xalatan",
  "travatan": "Travatan",
  "timolol": "Timolol",
  "dorzolamide": "Dorzolamide",
  "brimonidine": "Brimonidine",
  "vigamox": "Vigamox",
  "ocuflox": "Ocuflox",
  "tobradex": "Tobradex",
  "maxitrol": "Maxitrol",
  "pred forte": "Pred Forte",
  "fml": "FML",
  "lotemax": "Lotemax",
  "ilevro": "Ilevro",
  "nevanac": "Nevanac",
  "catridge": "Catridge",
  "specsavers": "Specsavers",
  "warby parker": "Warby Parker",
  "zenni": "Zenni",
};

// Sort brand keys by length descending so longer matches win
const BRAND_KEYS = Object.keys(KNOWN_BRANDS).sort((a, b) => b.length - a.length);

function extractBrand(name: string): string | null {
  const lower = name.toLowerCase();
  for (const key of BRAND_KEYS) {
    const idx = lower.indexOf(key);
    if (idx !== -1) {
      const before = idx === 0 || /[\s,\-:(/]/.test(lower[idx - 1]);
      const after = idx + key.length >= lower.length || /[\s,\-:)/]/.test(lower[idx + key.length]);
      if (before && after) {
        return KNOWN_BRANDS[key];
      }
    }
  }
  return null;
}

// Detect and collapse repeated substrings
function deduplicateName(name: string): string {
  const words = name.split(/\s+/);
  if (words.length < 4) return name;

  // Try half-length substring dedup
  for (let halfLen = Math.floor(words.length / 2); halfLen >= 2; halfLen--) {
    const firstHalf = words.slice(0, halfLen).join(" ");
    const secondHalf = words.slice(halfLen, halfLen * 2).join(" ");
    if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
      // Keep first half + any remainder after the duplicate
      const remainder = words.slice(halfLen * 2).join(" ");
      return remainder ? `${firstHalf} ${remainder}` : firstHalf;
    }
  }

  // Word-level consecutive dedup: "Kids Kids" → "Kids"
  const deduped: string[] = [words[0]];
  for (let i = 1; i < words.length; i++) {
    if (words[i].toLowerCase() !== words[i - 1].toLowerCase()) {
      deduped.push(words[i]);
    }
  }
  return deduped.join(" ");
}

const GENERIC_WORDS = new Set([
  "frame", "frames", "lens", "lenses", "sunglass", "sunglasses",
  "eyeglass", "eyeglasses", "optical", "optics", "reading",
  "glasses", "spectacles", "specs", "kids", "men", "women",
  "unisex", "adult", "child", "children",
]);

function cleanProductName(name: string, itemType: string | null): { cleaned: string; brand: string | null } {
  let cleaned = name;

  // 1. Strip category prefixes
  cleaned = cleaned.replace(/^(Frame|Frames|FRAME|FRAMES|Contact Lens|Contact Lenses|CONTACT LENS|CONTACT LENSES|Contact Lens Solution|Drugs|DRUGS|ACCESSORIES|Accessories|Solutions|Medications|Other|Cleanser|Packaging)\s*:\s*/i, "");

  // 2. Strip embedded prices - various patterns
  // "2,600,000" or "105,000" or "1,200,000"
  cleaned = cleaned.replace(/\b\d{1,3}(,\d{3}){1,3}\b/g, "");
  // "N105,000" or "₦2,600,000"
  cleaned = cleaned.replace(/[N₦]\s*\d{1,3}(,\d{3}){0,3}/gi, "");
  // "NGN 105000" patterns
  cleaned = cleaned.replace(/\bNGN\s*\d+/gi, "");
  // "15K" "120K" "1.2M" patterns - strip if >= 5
  cleaned = cleaned.replace(/\b(\d{1,4}(\.\d)?)\s*[Kk]\b/g, (match, num) => {
    const val = parseFloat(num);
    return val >= 5 ? "" : match;
  });
  // Standalone large numbers without commas (e.g. "105000", "2600000")
  cleaned = cleaned.replace(/\b\d{5,}\b/g, "");

  // 3. Strip redundant "FRAME" / "FRAMES" when item_type is frames
  if (itemType === "frames") {
    cleaned = cleaned.replace(/\bFRAMES?\b/gi, "");
  }

  // 4. Deduplicate repeated substrings before brand extraction
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  cleaned = deduplicateName(cleaned);

  // 5. Extract brand
  const brand = extractBrand(cleaned);

  // 6. Clean up extra whitespace
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  // Remove leading/trailing dashes, colons, commas, parens
  cleaned = cleaned.replace(/^[\s\-:,()]+|[\s\-:,()]+$/g, "").trim();

  // 7. Title Case - but preserve model codes
  cleaned = cleaned
    .split(" ")
    .map((word) => {
      if (/\d/.test(word) || (word.length <= 4 && word === word.toUpperCase())) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // 8. Final cleanup
  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();

  // 9. If cleaned name is empty, too short, or only generic words, fall back
  const cleanedWords = cleaned.split(/\s+/).filter(w => w.length > 0);
  const allGeneric = cleanedWords.every(w => GENERIC_WORDS.has(w.toLowerCase()));
  if (cleaned.length < 3 || allGeneric) {
    // Try to salvage from original minus prefix
    let fallback = name.replace(/^[^:]*:\s*/, "").trim();
    // Also strip prices from fallback
    fallback = fallback.replace(/\b\d{1,3}(,\d{3}){1,3}\b/g, "").trim();
    fallback = fallback.replace(/\b(\d{1,4}(\.\d)?)\s*[Kk]\b/g, (match, num) => {
      return parseFloat(num) >= 5 ? "" : match;
    }).trim();
    if (fallback.length >= 3) {
      cleaned = fallback;
    }
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

    query = query.or(
      "name.ilike.Frame :%,name.ilike.ACCESSORIES :%,name.ilike.Contact Lens :%,name.ilike.Drugs :%,name.ilike.Contact Lens Solution:%,brand.is.null,brand.eq.[NEEDS_RESEARCH]"
    );

    if (action === "preview") {
      const { data: products, error } = await query
        .range(offset, offset + limit - 1)
        .order("name");

      if (error) throw error;

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
              description_raw: product.description_raw || product.name,
            };

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
          const { data: zohoProducts } = await supabase
            .from("products")
            .select("id")
            .in("id", updatedProductIds.slice(0, 500))
            .not("zoho_item_id", "is", null);

          if (zohoProducts && zohoProducts.length > 0) {
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
                  product_ids: zohoProducts.map((p) => p.id),
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
