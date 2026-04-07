

## Auto-Swap Packaging Images Off Primary Preview for 132 Known-Brand Products

### The Problem

123 of 132 known-brand products currently have an AI-generated image (often the packaging shot with incorrect M&H branding) as their primary/preview image (`image_url`), while the original uploaded reference photo (`main.webp`/`main.png`) sits buried in `additional_images`. This means the catalog shows the wrong image as the hero shot.

### The Fix

A one-time bulk data operation that for each affected product:
1. Finds the original uploaded photo (URL containing `/main.`) inside `additional_images`
2. Swaps it into `image_url` (making it the catalog preview)
3. Moves the current `image_url` (the AI-generated shot) into the position where `main.*` was in `additional_images`

This preserves the full gallery order while ensuring the real product photo is always the hero.

### Implementation

**One-time script** (run via edge function or direct execution):
- Query all 132 known-brand products with full galleries where `image_url LIKE '%/additional-%'`
- For each product, find the index of the `main.*` URL in `additional_images`
- Swap `image_url` with that array entry
- Update the product row

**Catalog-level safeguard** (permanent):
- Add a utility function `getDisplayImages(product)` that always prioritizes the original upload (`/main.` URL) as the first image, regardless of DB ordering
- Use this in the product card, quick view, and product detail page so even if future AI generation shuffles images again, the catalog always shows the real photo first

### Files Modified
1. `supabase/functions/zoho-sync/index.ts` (or a new small edge function) — Add a `fix_primary_images` action for the one-time bulk swap
2. `src/modules/products/lib/image-utils.ts` (new) — `getDisplayImages()` helper that reorders images to prioritize real photos
3. `src/modules/products/components/BulkPackagingFixButton.tsx` — Add a second action "Fix Primary Images" that triggers the swap, with progress tracking
4. Product card / catalog components — Use `getDisplayImages()` for rendering

### Scope
- 123 products need the swap (those where `image_url` is an AI-generated image)
- 91 of those have the original `main.*` photo in `additional_images[0]`, making the swap straightforward
- The remaining ~32 may have `main.*` in other positions — the script handles all positions
- This is a safe, reversible operation (the images stay in the gallery, just reordered)

