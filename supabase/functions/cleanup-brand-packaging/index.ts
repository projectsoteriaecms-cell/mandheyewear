import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KNOWN_BRANDS = new Set([
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
  "JIMMY FAIRLY", "FREIGEIST",
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch all known-brand frame products with 5+ additional images
    const { data: products, error } = await supabase
      .from("products")
      .select("id, sku, brand, image_url, additional_images")
      .eq("is_active", true)
      .eq("item_type", "frames")
      .not("additional_images", "is", null)
      .not("brand", "is", null);

    if (error) throw error;

    // Filter: known brands that either have 5+ images (packaging to remove) OR need primary fix
    const affected = (products || []).filter((p) => {
      const brand = (p.brand || "").toUpperCase().trim();
      if (!KNOWN_BRANDS.has(brand)) return false;
      const hasPackaging = Array.isArray(p.additional_images) && p.additional_images.length >= 5;
      const needsPrimaryFix = p.image_url && !p.image_url.includes("/main.") &&
        Array.isArray(p.additional_images) && p.additional_images.some((url: string) => url.includes("/main."));
      return hasPackaging || needsPrimaryFix;
    });

    const results = {
      total: affected.length,
      packagingRemoved: 0,
      primaryFixed: 0,
      storageDeleted: 0,
      errors: [] as string[],
    };

    for (const product of affected) {
      try {
        const images: string[] = [...product.additional_images];
        let removedUrl: string | null = null;
        
        // Remove packaging (last image) if 5+ additional images
        if (images.length >= 5) {
          removedUrl = images.pop()!;
        }
        
        let newImageUrl = product.image_url;
        let newAdditional = images;

        // Fix primary image: if image_url doesn't contain '/main.', find the main photo
        if (product.image_url && !product.image_url.includes("/main.")) {
          const mainIdx = newAdditional.findIndex((url: string) => url.includes("/main."));
          if (mainIdx !== -1) {
            newImageUrl = newAdditional[mainIdx];
            // Put current image_url into additional at the position where main was
            newAdditional[mainIdx] = product.image_url;
            results.primaryFixed++;
          }
        }

        // Update database
        const { error: updateError } = await supabase
          .from("products")
          .update({
            additional_images: newAdditional,
            image_url: newImageUrl,
          })
          .eq("id", product.id);

        if (updateError) {
          results.errors.push(`${product.sku}: DB update failed - ${updateError.message}`);
          continue;
        }

        results.packagingRemoved++;

        // Delete the removed image from storage
        if (removedUrl.includes("/product-images/")) {
          const storagePath = removedUrl.split("/product-images/").pop();
          if (storagePath) {
            const decodedPath = decodeURIComponent(storagePath);
            const { error: deleteError } = await supabase.storage
              .from("product-images")
              .remove([decodedPath]);
            if (!deleteError) {
              results.storageDeleted++;
            }
          }
        }
      } catch (err) {
        results.errors.push(`${product.sku}: ${err.message}`);
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
