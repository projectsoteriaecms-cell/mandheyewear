

# Auto-Generate Missing Product Images Using Your Gemini API Key

## Overview
Create an edge function that uses your existing `GEMINI_API_KEY` (same one powering Virtual Try-On) to generate product images via Google's Gemini image generation API. An admin UI button on the Product Images page triggers batch processing of all ~3,100 products missing primary images.

## Architecture

```text
Admin clicks "Generate Missing Images"
        ↓
Frontend calls edge function in batches of 5
        ↓
Edge function (generate-product-image):
  1. Queries products WHERE image_url IS NULL, LIMIT 5
  2. For each product, builds a prompt from name/brand/color/item_type
  3. Calls Gemini 2.5 Flash (generateContent with responseModalities: ["image","text"])
  4. Extracts base64 image from response
  5. Uploads to product-images bucket as {productId}/primary.webp
  6. Updates products.image_url with public URL
  7. Returns { processed, succeeded, failed, remaining }
        ↓
Frontend chains batches with progress bar until done
```

## Implementation Steps

### 1. Edge Function: `generate-product-image`
- **Auth**: Uses `GEMINI_API_KEY` from secrets (already configured) and `SUPABASE_SERVICE_ROLE_KEY` for DB writes
- **Input**: `{ batchSize?: number }` (default 5)
- **Logic**:
  - Query products with `image_url IS NULL AND is_active = true`, ordered by item_type priority (frames first)
  - For each product, build a tailored prompt based on item_type:
    - Frames: "Professional product photo of {brand} {name} eyeglasses, {color} color, {material} material, studio lighting, white background, e-commerce style"
    - Contact lenses: "Product photo of {name} contact lens box packaging, clean studio shot, white background"
    - Lenses: "Product photo of {name} optical lens, clean studio shot, white background"
    - Other: "Professional product photo of {name}, studio shot, white background"
  - Call `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent` (same pattern as VTO)
  - Extract base64 image, upload to `product-images/{id}/primary.webp`
  - Update `products.image_url` with the public storage URL
  - Handle rate limits (429) with exponential backoff between items
  - Return summary stats
- **Config**: `verify_jwt = false` (validates auth manually via service role)

### 2. Admin UI: "Auto-Generate Images" Button
- Add to `ProductImages.tsx` in the stats/toolbar area
- Confirmation dialog showing count of missing images
- On confirm, chains edge function calls (batch of 5) with a progress bar
- Shows "Generated 45 / 3,110..." with cancel button
- Idempotent: only processes products where `image_url IS NULL`

### 3. Files to Create/Edit
- **Create**: `supabase/functions/generate-product-image/index.ts`
- **Edit**: `supabase/config.toml` (add function config)
- **Edit**: `src/pages/admin/ProductImages.tsx` (add generate button + progress UI)

## Cost Considerations
- Uses your own Gemini API key, so no Lovable credits consumed
- Gemini 2.5 Flash image generation is cost-efficient
- Batch size of 5 keeps each edge function call under 60s timeout
- ~620 edge function calls total for 3,100 products

