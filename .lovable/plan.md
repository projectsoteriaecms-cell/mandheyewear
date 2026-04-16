

# Mobile Image Height Reduction

## Problem
On mobile (390px), the image uses `aspect-[4/5]` which produces ~488px height — too tall, leaving no room for product title/price before scrolling.

## Change

### ProductImageCarousel.tsx (line 81)
- Change mobile aspect from `aspect-[4/5]` to `aspect-[5/6]` (shorter) and add `max-h-[40vh]` on mobile to cap the height
- This keeps the image wide and full-bleed but limits vertical space so title, price, and CTA peek above the fold

**Specifically:**
- Line 81: `aspect-[4/5] md:aspect-[4/3]` → `aspect-[5/6] max-h-[40vh] md:max-h-none md:aspect-[4/3]`

### Result
On a 390×844 phone: image height capped at ~338px instead of ~488px, leaving ~400px for product info visible without scrolling.

### File
| File | Change |
|------|--------|
| `src/components/product/ProductImageCarousel.tsx` | Shorter mobile aspect + `max-h-[40vh]` cap |

