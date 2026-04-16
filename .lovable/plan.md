

# Mobile Product Image — Full-Width Balanced Frame

## Problem
On mobile (390px), the image uses `aspect-[3/4]` (portrait/tall) combined with `max-h-[45vh]`, which makes the image appear narrow and constrained. The user wants the image to fill the screen width with a balanced, well-proportioned frame.

## Changes

### ProductImageCarousel.tsx
- Change mobile aspect from `aspect-[3/4]` (tall portrait) to `aspect-[4/5]` — wider and more balanced while still showing the product well
- Remove `rounded-lg` on mobile so the image goes edge-to-edge (full bleed) — add it back at `md:` breakpoint
- Remove the `max-h-[45vh]` constraint on mobile — the `aspect-[4/5]` ratio on a 390px screen naturally produces ~488px height which is well-contained
- Keep `md:aspect-[4/3]` and `md:max-h-[calc(100vh-180px)]` for tablet/desktop unchanged

### Result
At 390px wide, the image will be 390×488px — filling the width completely with a balanced frame that shows the product prominently without excessive scrolling.

### File
| File | Change |
|------|--------|
| `src/components/product/ProductImageCarousel.tsx` | Mobile aspect `3/4` → `4/5`, full-bleed edges, remove `max-h-[45vh]` on mobile |

