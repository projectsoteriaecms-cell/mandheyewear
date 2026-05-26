## Problem

- Image 1 (PDP): frame fills the white tile nicely — correct.
- Image 2 (Shop list/card): frame appears tiny, floating in a huge sea of white — wrong.

Same image is used in both places. The PNGs have built-in transparent padding, so they render fine in the large PDP container but look lost in the smaller card/list tiles. We need **visual evenness** — the frame should occupy roughly the same proportion of its white surface everywhere.

## Fix

Apply a per-surface scale compensation in the global `.product-surface img` rule so card/list thumbnails visually match the PDP density, while the PDP itself stays at 1.0 (it already looks right).

### Changes

1. **`src/index.css`** — replace the single global rule with surface-aware variants:

   ```css
   .product-surface img {
     object-fit: contain;
     object-position: center;
     width: 100%;
     height: 100%;
     padding: 4%;
   }
   /* Shop grid + list cards: compensate for baked-in transparent padding */
   .product-surface[data-surface="card"] img,
   .product-surface[data-surface="list"] img {
     transform: scale(1.45);
     transform-origin: center;
     transition: transform 400ms ease;
   }
   .product-surface[data-surface="card"]:hover img,
   .product-surface[data-surface="list"]:hover img {
     transform: scale(1.55);
   }
   /* PDP carousel stays at natural size (already correct) */
   .product-surface[data-surface="pdp"] img {
     transform: none;
   }
   ```

2. **Tag the three surfaces** with `data-surface`:
   - `src/modules/storefront/components/eyewear/ProductCard.tsx` → `data-surface="card"`
   - `src/modules/storefront/components/eyewear/ProductListCard.tsx` → `data-surface="list"`
   - `src/components/product/ProductImageCarousel.tsx` → `data-surface="pdp"`

3. Remove any lingering per-image `scale-[...]` Tailwind classes on those three components (keep only `object-contain` + transitions) so the CSS rule is the single source of truth.

### Why this works

- One global selector controls frame sizing for every current and future product.
- PDP is untouched (1.0) because it already matches the reference.
- Cards/list scale up to ~145% so the actual frame (after its transparent margin) occupies ~the same visual share as on PDP.
- No image reprocessing needed; works for every SKU uploaded going forward.

### Out of scope

- No changes to image generation, backgrounds, or business logic.
- No layout/spacing changes outside the white image tile.
