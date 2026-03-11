

## Per-Shot Regeneration for Individual Frame Images

After the initial 6-shot gallery is generated, admins can now fix individual bad images without regenerating the entire set.

### Changes

**1. Edge function (`supabase/functions/generate-product-image/index.ts`)**
- Accept optional `shotSlug` param alongside `productId`
- When both are provided, generate only that one shot, upload it, and update the correct position:
  - `hero` (index 0) → update `image_url`
  - `front/side/rear/macro/packaging` (index 1-5) → read current `additional_images`, replace the URL at the matching index, update
- Reuses existing `buildFramePrompts`, `generateImage`, and `uploadImage` functions

**2. DraggableImageItem (`src/components/admin/products/DraggableImageItem.tsx`)**
- Add `onRegenerate?: () => void` and `isRegenerating?: boolean` props
- Render a Lightning icon button in the hover overlay (between set-primary and delete) that triggers regeneration
- Show a spinner overlay on the tile when `isRegenerating` is true

**3. QuickImageUploadModal (`src/components/admin/products/QuickImageUploadModal.tsx`)**
- Add `regeneratingIndex: number | null` state
- Map gallery index to shot slug: `["hero", "front", "side", "rear", "macro", "packaging"]`
- Only show per-shot regenerate buttons when `product.item_type === "frames"` (non-frames have a single shot, so the existing full-regenerate button suffices)
- Call edge function with `{ productId, shotSlug }`, update state and invalidate queries on completion
- Pass `onRegenerate` and `isRegenerating` to each `DraggableImageItem`

### Shot Slug Mapping
```text
Index 0 → "hero"      → updates image_url
Index 1 → "front"     → updates additional_images[0]
Index 2 → "side"      → updates additional_images[1]
Index 3 → "rear"      → updates additional_images[2]
Index 4 → "macro"     → updates additional_images[3]
Index 5 → "packaging" → updates additional_images[4]
```

### Files Changed
- `supabase/functions/generate-product-image/index.ts`
- `src/components/admin/products/DraggableImageItem.tsx`
- `src/components/admin/products/QuickImageUploadModal.tsx`

