## Goal

Frames are now background-less PNGs. On the storefront they currently float directly on the page/secondary background, which makes them feel disconnected. We'll give every product image a **white surface tile** with a soft contact shadow underneath, so the frame appears to rest on a clean stage — independent of whatever section background is behind it.

## Visual contract

- Tile background: solid white (`bg-white`) — non-negotiable per the frame-image-enhancement skill (pure #FFFFFF studio surface).
- Image rendering: switch from `object-cover` to `object-contain` with inner padding so the frame doesn't bleed to the tile edge.
- Soft contact shadow: a subtle radial/ellipse shadow under the lower third of the tile (CSS gradient overlay) — mimics the studio shadow already baked into hero shots and reinforces the "resting on a surface" cue for any image that lacks one.
- Tile chrome: keep existing `rounded-lg`, add a faint `ring-1 ring-border/40` so the white tile reads as a distinct surface on both light (Cream) and dark backgrounds.
- No change to layout, aspect ratios, or carousel behavior.

## Files to change (presentation only)

1. **`src/modules/storefront/components/eyewear/ProductCard.tsx`**
   - Image wrapper: `bg-secondary` → `bg-white ring-1 ring-border/40`.
   - `<img>`: `object-cover` → `object-contain p-3 sm:p-4`.
   - Add contact-shadow pseudo-element via an absolutely-positioned div with a radial gradient at the bottom.

2. **`src/modules/storefront/components/eyewear/ProductListCard.tsx`**
   - Same treatment on the left image panel.

3. **`src/components/product/ProductImageCarousel.tsx`**
   - Main carousel slide wrapper: `bg-secondary` → `bg-white ring-1 ring-border/40`.
   - Slide `<img>`: `object-cover` → `object-contain p-4 md:p-6`.
   - Zoom-lens div: keep current behavior (background-image), but on the white surface.
   - Thumbnail buttons: white bg + contain.
   - Fullscreen overlay: keep black (it's a viewer, not a card).

4. **`src/index.css`** (optional, only if we want a reusable utility)
   - Add `.product-surface` utility = white bg + ring + radial contact shadow. Use it across the 3 files above to keep the look in one place.

## Why this scope

- Pure CSS/presentation — no data, no schema, no edge function changes.
- Touches only the 3 components that render product frame images on the storefront.
- The admin compare page (`ProductImageCompare.tsx`) already shows anchor vs render at full bleed; we'll leave it alone unless you want the same surface there too.

## Out of scope

- Re-rendering or re-cropping existing images.
- Changing the storefront page background, section spacing, or card border radius.
- PDP zoom/fullscreen viewer styling (stays as-is).

Ready to implement on approval.