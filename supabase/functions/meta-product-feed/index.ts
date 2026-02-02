import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// XML escape helper
function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Format price for Meta (e.g., "25000.00 NGN")
function formatPrice(price: number): string {
  return `${price.toFixed(2)} NGN`;
}

// Generate description fallback
function generateDescription(product: any): string {
  if (product.description) return product.description;
  
  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.style) parts.push(product.style.toLowerCase());
  if (product.material) parts.push(`in ${product.material.toLowerCase()}`);
  
  return parts.length > 0 
    ? `Premium ${parts.join(" ")} eyewear frame`
    : "Premium eyewear frame from M&H Eyewear";
}

// Generate XML item for a product
function generateProductItem(product: any, baseUrl: string): string {
  const productUrl = `${baseUrl}/product/${product.id}`;
  const description = generateDescription(product);
  
  // Map gender to Meta format
  let gender = "unisex";
  if (product.gender) {
    const g = product.gender.toLowerCase();
    if (g.includes("male") && !g.includes("female")) gender = "male";
    else if (g.includes("female")) gender = "female";
  }

  return `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(product.image_url)}</g:image_link>
      <g:price>${formatPrice(product.price)}</g:price>
      <g:availability>in stock</g:availability>
      <g:brand>${escapeXml(product.brand || "M&H Eyewear")}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>2521</g:google_product_category>
      <g:product_type>${escapeXml(product.style || "Eyewear Frames")}</g:product_type>
      <g:gender>${gender}</g:gender>
      <g:material>${escapeXml(product.material || "")}</g:material>
      <g:color>${escapeXml(product.color || "")}</g:color>
      ${product.additional_images?.length ? product.additional_images.map((img: string) => 
        `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`
      ).join("\n      ") : ""}
    </item>`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query active products with images, join with frame_attributes
    const { data: products, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        description,
        price,
        brand,
        style,
        material,
        color,
        gender,
        image_url,
        additional_images,
        item_type,
        frame_attributes (
          frame_shape,
          frame_material,
          front_color
        )
      `)
      .eq("is_active", true)
      .not("image_url", "is", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    // Published site URL for deep links
    const baseUrl = "https://soteriaeyeclinic.lovable.app";

    // Generate XML feed
    const items = (products || []).map((product: any) => {
      // Merge frame_attributes data if available (it's a one-to-one relation)
      const frameAttrs = product.frame_attributes as { frame_shape?: string; frame_material?: string; front_color?: string } | null;
      if (frameAttrs) {
        if (frameAttrs.frame_material && !product.material) {
          product.material = frameAttrs.frame_material;
        }
        if (frameAttrs.front_color && !product.color) {
          product.color = frameAttrs.front_color;
        }
        if (frameAttrs.frame_shape && !product.style) {
          product.style = frameAttrs.frame_shape;
        }
      }
      return generateProductItem(product, baseUrl);
    }).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>M&amp;H Eyewear - Product Catalog</title>
    <link>${baseUrl}</link>
    <description>Premium eyewear collection from Soteria Eye Clinic - Luxury frames and fashion eyewear</description>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error generating feed:", error);
    
    // Return error as valid XML
    const errorXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>M&amp;H Eyewear - Product Catalog</title>
    <link>https://soteriaeyeclinic.lovable.app</link>
    <description>Error generating feed: ${escapeXml(error.message)}</description>
  </channel>
</rss>`;

    return new Response(errorXml, {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
});
