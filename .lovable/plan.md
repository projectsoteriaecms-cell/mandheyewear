

## Fix Remaining 26 Known-Brand Products with AI Primary Images

### Problem
The previous cleanup successfully swapped primary images for products that had original `.png` reference photos available. But **26 known-brand products** have `main.webp` as their primary image (AI-generated, potentially showing M&H packaging) and **no original `.png` reference photo** in their gallery. All 26 have 4 additional AI-generated `.webp` images (the packaging shot was already removed).

### Solution
For these 26 products, simply swap `image_url` with the **first additional image** (`additional_images[0]`). The first additional image is a front-facing product shot (not packaging), so it makes a much better hero image. Move the current `main.webp` into the gallery where it was.

### Changes

**Update `supabase/functions/cleanup-brand-packaging/index.ts`**

Expand the filtering logic to also catch products where:
- `image_url` ends with `main.webp` (AI-generated primary)
- No original `.png` exists in the gallery
- Has at least 1 additional image to swap with

For these products, swap `image_url` with `additional_images[0]` and put the old primary into position 0 of the array.

The updated filter condition becomes:
```
hasPackaging || needsPrimaryFix || needsAnySwap
```
Where `needsAnySwap` is: known brand + `image_url` ends with `main.webp` + has additional images but none are `.png`.

**No UI changes needed** — the existing "Remove M&H Packaging" button already calls this function.

### Scope
- 26 products affected (GUESS, POLAROID, SANDRO, TED BAKER, JOHN RICHMOND, WILLIAMS MORRIS, PIERRE CARDIN, Chopard, Calvin Klein, etc.)
- Pure database swap — no AI credits, no storage changes
- The `main.webp` is not deleted, just moved into the gallery

