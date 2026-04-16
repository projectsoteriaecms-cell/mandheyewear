

# Product Page UX Optimization — Zero-Scroll Decision Making

## Problem
On desktop (1024px+), the product image uses `aspect-[4/5]` which is extremely tall, pushing the right-column content (price, buttons) below the fold. The grid is `[1fr_380px]` giving the image column too much space. Users must scroll to reach decision-critical elements.

## Root Causes
1. **Image aspect ratio `4/5`** — too tall for desktop; forces ~600-700px height on a typical 1080p screen
2. **Grid split `1fr / 380px`** — image column takes ~60% of width, making it massive
3. **`pt-28 sm:pt-32`** top padding — ~128px consumed before content starts
4. **Right column has `space-y-3` then `space-y-4` inside AddToCartSection** — cumulative whitespace pushes buttons down
5. **Trust badges, social proof, qty selector** all eat vertical space before the CTA buttons

## Plan

### 1. Tighten Desktop Image (ProductImageCarousel.tsx)
- Change PDP aspect from `aspect-[4/5]` to `aspect-[4/3]` on desktop (`lg:aspect-[4/3]`), keep mobile at `aspect-[3/4]` (portrait for phones)
- Add `lg:max-h-[calc(100vh-180px)]` so the image never exceeds viewport minus nav+breadcrumb
- Thumbnails stay as-is (they're compact)

### 2. Rebalance Grid Layout (ProductDetail.tsx)
- Change grid from `lg:grid-cols-[1fr_380px]` to `lg:grid-cols-2` — equal 50/50 split gives more room for the right column
- Reduce top padding: `pt-20 sm:pt-24` (save ~32px)
- Reduce breadcrumb margin: `mb-2 lg:mb-3`
- Tighten right column spacing: `space-y-2` instead of `space-y-3`

### 3. Compact AddToCartSection (AddToCartSection.tsx)
- Reduce price from `text-3xl` to `text-2xl`
- Remove the "NGN • VAT inclusive" subtitle line (save a row)
- Make qty selector inline with price row on desktop
- Change `space-y-4` to `space-y-3`
- Make Buy Now and Add to Cart side-by-side on desktop (`flex-row` on `lg:`) instead of stacked
- Compact trust badges: single row with smaller padding

### 4. Mobile Viewport (390px)
- Image: `aspect-[4/3]` with `max-h-[45vh]` — show product but leave room for title+price
- Tighter padding throughout
- Price visible immediately below image

### 5. QuickView Dialog (ProductQuickView.tsx)  
- Already decent, minor tightening: reduce `gap-5` to `gap-4`, compact specs grid

### Files Modified
| File | Changes |
|------|---------|
| `ProductImageCarousel.tsx` | Responsive aspect ratios, viewport-constrained height |
| `ProductDetail.tsx` | 50/50 grid, reduced padding, tighter spacing |
| `AddToCartSection.tsx` | Compact layout, inline price+qty, side-by-side CTAs |
| `ProductQuickView.tsx` | Minor spacing tightening |

### Result
On a 1080p desktop screen, users will see: product image, title, stars, price, Buy Now, and Add to Cart — all without scrolling. Description/specs remain in accordions below the fold.

