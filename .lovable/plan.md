
# Meta Product Feed Generator Implementation Plan

## Overview
Create an edge function that generates a **Facebook/Instagram-compatible XML product feed** from your products database. This publicly accessible feed URL can be added to Meta Commerce Manager for automatic catalog synchronization.

## Feed Specification
The feed follows the [Meta Product Catalog RSS/XML specification](https://developers.facebook.com/docs/commerce-platform/catalog/fields) with these key fields:

| Meta Field | Source | Notes |
|------------|--------|-------|
| `g:id` | `products.id` | Unique product identifier |
| `g:title` | `products.name` | Product name |
| `g:description` | `products.description` or auto-generated | Falls back to brand + style |
| `g:link` | Published URL + `/product/{id}` | Deep link to product page |
| `g:image_link` | `products.image_url` | Main product image |
| `g:price` | `products.price` | Format: `25000.00 NGN` |
| `g:availability` | Hardcoded | `in stock` for active products |
| `g:brand` | `products.brand` | Brand name |
| `g:condition` | Hardcoded | `new` |
| `g:google_product_category` | Fixed | `2521` (Eyewear Frames) |
| `g:product_type` | `products.style` | e.g., Rectangular, Aviator |
| `g:gender` | `products.gender` | male/female/unisex |
| `g:material` | `products.material` | Frame material |
| `g:color` | `products.color` | Frame color |

## Implementation

### 1. Edge Function: `meta-product-feed`
**File:** `supabase/functions/meta-product-feed/index.ts`

```text
Key features:
├── Public endpoint (no JWT required)
├── Returns Content-Type: application/xml
├── Queries active products with images
├── Generates Meta-compliant RSS 2.0 XML
├── Includes deep links to your published domain
├── Formats prices in NGN (Nigerian Naira)
└── Caches response for performance
```

**Core Logic:**
1. Query all active products with `is_active = true` and `image_url IS NOT NULL`
2. Join with `frame_attributes` for additional metadata
3. Generate XML with proper escaping for special characters
4. Return with `Content-Type: application/xml` and CORS headers

### 2. Configuration Update
**File:** `supabase/config.toml`

Add the new function with JWT verification disabled (feed must be publicly accessible for Meta to poll):

```toml
[functions.meta-product-feed]
verify_jwt = false
```

### 3. Feed URL
Once deployed, the feed will be accessible at:
```
https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/meta-product-feed
```

This URL can be added directly to Meta Commerce Manager as a "Scheduled Feed".

## Technical Details

### XML Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>M&amp;H Eyewear - Product Catalog</title>
    <link>https://soteriaeyeclinic.lovable.app</link>
    <description>Premium eyewear collection from Soteria Eye Clinic</description>
    <item>
      <g:id>3e145666-bb55-4358-9de8-0fd0bc12d883</g:id>
      <g:title>CARTIER 360K FRAME CT00630 135</g:title>
      <g:description>Premium rectangular frame in metal/titanium</g:description>
      <g:link>https://soteriaeyeclinic.lovable.app/product/3e145666-bb55-4358-9de8-0fd0bc12d883</g:link>
      <g:image_link>https://ispizamxlrukxmysgyjv.supabase.co/storage/v1/object/public/product-images/...</g:image_link>
      <g:price>360000.00 NGN</g:price>
      <g:availability>in stock</g:availability>
      <g:brand>CARTIER</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>2521</g:google_product_category>
      <g:gender>unisex</g:gender>
      <g:material>Metal/Titanium</g:material>
      <g:color>Various</g:color>
    </item>
    <!-- Additional items... -->
  </channel>
</rss>
```

### Error Handling
- Returns proper error XML if database query fails
- Logs errors for debugging in edge function logs
- Returns empty feed (valid XML) if no products match criteria

### Performance Considerations
- Single database query with JOIN
- No pagination needed (Meta handles incremental updates)
- XML generated server-side, no client-side processing

## After Implementation

### Adding to Meta Commerce Manager
1. Go to Meta Commerce Manager → Catalog → Data Sources
2. Select "Scheduled Feed"
3. Enter the feed URL: `https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/meta-product-feed`
4. Set update schedule (recommended: daily)
5. Map fields if needed (auto-mapping should work with g: prefix)

### Instagram Shopping Setup
1. Connect your Instagram Business account to Commerce Manager
2. Enable Shopping in Instagram settings
3. Tag products in posts/stories using catalog items

## Files to Create/Modify
| File | Action |
|------|--------|
| `supabase/functions/meta-product-feed/index.ts` | Create - Main feed generator |
| `supabase/config.toml` | Modify - Add function config |

## Future Enhancements (Phase 2+)
- Add `additional_image_link` for galleries
- Include inventory availability from `inventory` table
- Add UTM parameters for attribution tracking
- Create TikTok-specific feed format
- Add Snapchat product catalog feed
