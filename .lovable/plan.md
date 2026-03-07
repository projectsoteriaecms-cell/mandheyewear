

## Featured Products & Luxury Brand Image Reordering

### Current Problems

1. **Featured Frames shows nothing** — The `FeaturedFrames` component queries `brand_line = 'm_and_h_fashion'` which has **0 products**. All 3,444 products are `soteria_medical`. The section is completely empty on the homepage.

2. **M&H pouch images in luxury brand galleries** — Every luxury brand product (33 total across Cartier, Gucci, Burberry, Chanel, etc.) has a `main.png` file in their `additional_images` array. This is the M&H branded pouch/packaging photo. While it's not the primary `image_url` (good), it still shows up in the product gallery alongside the actual product shots, which hurts brand credibility.

### Data Summary

- **334 products** have images (all `soteria_medical` brand_line)
- **33 luxury brand products** with images: GUCCI (15), CARTIER (5), GENTLE MONSTER (4), BURBERRY (3), SAINT LAURENT (3), CHANEL (1), CHROME HEART (1), VERSACE (1)
- All 33 have `main.png` (pouch photo) in their `additional_images` — needs reordering to last position

### Plan

**1. Fix FeaturedFrames to show products with good images**

Change `FeaturedFrames` to query products that have a primary image AND at least 3 additional images, regardless of `brand_line`. Prioritize luxury/premium brands (Gucci, Cartier, Burberry, etc.) to showcase the best of the catalog on the homepage.

Add a dedicated `useFeaturedProducts` hook that:
- Filters `image_url IS NOT NULL`  
- Filters `additional_images` has 3+ entries
- Orders by price descending (premium first) to surface luxury items
- Limits to 4-8 products

**2. Reorder luxury brand images via SQL**

Run a database update to move the `main.png` (pouch) image to the **last position** in `additional_images` for all 33 luxury brand products. This ensures:
- Product gallery shows actual product photos first (front view, side view, etc.)
- The pouch/packaging image appears last in the gallery, if at all
- Primary `image_url` remains untouched (already correct)

The SQL will target products where `brand IN ('CARTIER','GUCCI','BURBERRY','CHANEL','CHROME HEART','GENTLE MONSTER','SAINT LAURENT','VERSACE')` and rearrange `additional_images` to push any URL containing `/main.` to the end.

**3. Update ProductCard and eyewear listing**

Remove the `m_and_h_fashion` brand_line dependency from any storefront component that currently filters by it. The eyewear page should show all products with images.

### Files to Change

| File | Change |
|---|---|
| `src/components/storefront/FeaturedFrames.tsx` | Remove `m_and_h_fashion` filter. Add query for products with sufficient images, prioritize luxury brands |
| `src/hooks/useProducts.ts` | Add `useFeaturedProducts` hook with image-quality filtering |
| Database migration | SQL to reorder `additional_images` for 33 luxury brand products, pushing `main.png` to last position |

### Technical Detail: Image Reorder SQL

For each of the 33 luxury brand products, the update will:
1. Extract all URLs from `additional_images` that do NOT contain `/main.`
2. Extract all URLs that DO contain `/main.`
3. Concatenate them as `[non-pouch images] + [pouch images]`

This is a one-time data fix. Future image uploads through the admin panel already support drag-and-drop reordering so your team can manage order going forward.

