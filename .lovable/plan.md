

# Mobile Image — Square Aspect Ratio

## Problem
The current `aspect-[5/6]` with `max-h-[40vh]` is making the image shorter but also narrower, leaving a gap on the right. A square aspect ratio (`aspect-square`) would balance width and height naturally while keeping the image well-contained.

## Change

### ProductImageCarousel.tsx (line 81)
```
// Before
"aspect-[5/6] max-h-[40vh] md:max-h-none md:aspect-[4/3]"

// After
"aspect-square max-h-[45vh] md:max-h-none md:aspect-[4/3]"
```

- `aspect-square` → 1:1 ratio, perfectly balanced width-to-height
- `max-h-[45vh]` → bumped slightly from 40vh to 45vh so the square doesn't get overly compressed on shorter screens (on a 390px phone this gives ~380px, which is essentially full-width square)
- Tablet/desktop unchanged (`md:aspect-[4/3]`)

### Result
On 390px mobile: image renders at ~390×390px — full width, balanced square, no wasted space on the right, no excessive vertical stretch. Product info (title, price, CTA) remains visible below.

### File
| File | Change |
|------|--------|
| `src/components/product/ProductImageCarousel.tsx` | `aspect-[5/6] max-h-[40vh]` → `aspect-square max-h-[45vh]` |

