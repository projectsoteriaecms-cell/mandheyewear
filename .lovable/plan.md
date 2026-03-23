

## Add FREIGEIST 863037 60 Product with Rich Metadata for AI Image Generation

### What we know about this frame (from Edel-Optics)
- **Brand**: FREIGEIST (German brand, part of Eschenbach Optik group)
- **Model**: FG 863037
- **Color code**: 60 (color 50 = "Rot / Rosa / Violett"; color 60 likely a different variant)
- **Lens width**: 59mm
- **Bridge size**: 18mm
- **Temple length**: 155mm
- **Frame shape**: Rectangular, Full rim
- **Material**: Plastic (lightweight, flexible)
- **Gender**: Unisex (Women and Men)
- **Size category**: XXL

### Why this matters for AI accuracy
The `describeProduct()` function in the edge function builds prompts from: `brand`, `name`, `color`, `material`, `style`. Currently many products lack these fields, resulting in vague prompts. By inserting this product with full metadata, the AI prompt becomes something like: *"FREIGEIST Frame : FREIGEIST FG 863037-60 in Plastic rectangular style"* — far more specific than just a name.

### Plan

**Step 1: Add FREIGEIST to known brands list**
- Add `"FREIGEIST"` to `LUXURY_BRANDS` set in both:
  - `src/modules/products/lib/brand-classification.ts` (client-side PDCA gate)
  - `supabase/functions/generate-product-image/index.ts` (edge function)
- This allows text-to-image generation without requiring reference photos

**Step 2: Insert product with rich metadata (database migration)**
- `products` table: SKU `FREIGEIST-863037-60`, name `Frame : FREIGEIST FG 863037-60`, brand `FREIGEIST`, item_type `frames`, brand_line `m_and_h_fashion`, material `Plastic`, style `Rectangular`, gender `unisex`, color `Color 60`, frame_width `59`, bridge_size `18`, temple_length `155`, description with full specs
- `frame_attributes` table: lens_width `59`, bridge_size `18`, temple_length `155`, model_code `863037`, front_color `60`, frame_shape `rectangular`, frame_material `plastic`

**Step 3: Enrich the `describeProduct()` function**
- Add `frame_shape` and `gender` to the description builder so prompts include "rectangular full-rim unisex frame"
- Pull `frame_attributes` data when building prompts (the query already joins this table)

**Step 4: Enhance the product query in the edge function**
- The edge function currently only selects from `products`. Update it to also join `frame_attributes` so model_code, frame_shape, and frame_material are available for richer prompt construction

### Technical Details

**Files modified:**
1. `src/modules/products/lib/brand-classification.ts` — Add `"FREIGEIST"` to `LUXURY_BRANDS`
2. `supabase/functions/generate-product-image/index.ts` — Add `"FREIGEIST"` to brands set, enhance `describeProduct()` to use frame_attributes data, update product query to join frame_attributes
3. Database migration — Insert the product and frame_attributes rows

After implementation, you can go to the Product Images page, find FREIGEIST 863037-60, and trigger "Generate with AI" to test the full flow with rich metadata.

