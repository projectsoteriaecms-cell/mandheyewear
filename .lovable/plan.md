

# Upgrade Image Generation to 6-Shot Luxury Photography Prompt

## Overview
Replace the current single-shot generic prompt with your M&H Opticals luxury photography meta-prompt that generates a 6-image gallery per product: Hero (3/4), Front, Side Profile, Rear/Interior, Macro Detail, and Luxury Packaging.

## Key Design Decisions

**Batch size drops to 1 product per edge function call** — generating 6 images per product takes ~30-50 seconds, which is near the edge function timeout. Processing 1 product at a time keeps it safe.

**Frames get the full 6-shot treatment; non-frames get a simpler 1-shot** — contact lenses, solutions, etc. don't need 6 angles of glasses photography.

**Branded frames get brand-specific prompt enrichment** — the ~50 luxury/premium brands you listed will have their original logos preserved in prompts, and the packaging shot (Shot 6) features their real logo on the case instead of M&H.

## Architecture

```text
Admin clicks "Generate Missing Images"
        ↓
Frontend calls edge function, 1 product per batch
        ↓
For frame products:
  Shot 1 (Hero 3/4)     → uploaded as primary image_url
  Shots 2-5 (Front, Side, Rear, Macro) → additional_images[0..3]
  Shot 6 (Packaging)    → additional_images[4]
        ↓
For non-frame products:
  Single product photo   → primary image_url only
```

## Changes

### 1. Edge Function (`generate-product-image/index.ts`) — Full Rewrite
- **Branded frames list**: Hardcode the ~50 luxury/premium brand names so the prompt knows to preserve their logos
- **6-shot prompt builder for frames**: Implements prompts 3A–3F from your meta-prompt, each referencing M&H Opticals and the product's actual brand, color, material
- **Shot 6 logic**: For branded frames, the packaging case shows the brand's real logo; for house-brand/unknown, it shows "M&H Opticals" embossed
- **Sequential generation**: Calls Gemini 6 times per frame product, uploading each image to storage under `{productId}/hero.webp`, `{productId}/front.webp`, etc.
- **Updates both fields**: Sets `image_url` to the hero shot URL, and `additional_images` to an array of the other 5 URLs
- **Non-frame fallback**: Contact lenses, solutions, etc. keep the simple single-shot prompt
- **Rate limit handling**: 2-second delay between shots, retry on 429

### 2. Admin UI (`GenerateImagesDialog.tsx`) — Minor Updates
- Update batch size from 5 to 1 (since each product now generates 6 images)
- Update description text to mention "6-image gallery per frame"
- Add note about estimated time (~30s per frame product)

### 3. Frontend Page (`ProductImages.tsx`) — No changes needed
- Already handles `additional_images` display

## Estimated Processing Time
- ~3,100 products × ~35s average = ~30 hours total for all products
- Can be run in segments, cancelled and resumed (idempotent — skips products with existing images)

## Files Modified
- `supabase/functions/generate-product-image/index.ts` — rewrite prompt builder + 6-shot loop
- `src/components/admin/products/GenerateImagesDialog.tsx` — update batch size and copy

