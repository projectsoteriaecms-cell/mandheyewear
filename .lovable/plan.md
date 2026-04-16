

# Tablet & Mobile PDP Layout Fix

## Problem
At tablet viewports (768–1023px), the product grid stacks vertically because the side-by-side layout only kicks in at `lg` (1024px). The user wants image and details side-by-side on tablet too.

## Changes

### 1. ProductDetail.tsx — Grid breakpoint `lg` → `md`
- Line 203: `grid lg:grid-cols-2 gap-5 lg:gap-8` → `grid md:grid-cols-2 gap-5 md:gap-6 lg:gap-8`
- Line 214: `lg:sticky lg:top-24 lg:self-start` → `md:sticky md:top-24 md:self-start`
- Various `lg:` prefixed classes throughout the hero section updated to `md:` where they control the two-column layout

### 2. ProductImageCarousel.tsx — Responsive aspect & height
- Line 81: `aspect-[3/4] lg:aspect-[4/3]` → `aspect-[3/4] md:aspect-[4/3]`
- Line 93: `max-h-[45vh] lg:max-h-[calc(100vh-180px)]` → `max-h-[45vh] md:max-h-[calc(100vh-180px)]`
- Zoom visibility classes: `lg:block` → `md:block`

### 3. Mobile (< 768px) stays stacked
The mobile layout remains single-column with the compact hero image and sticky bottom action bar — no changes needed there.

### Files
| File | Change |
|------|--------|
| `src/pages/ProductDetail.tsx` | Switch grid/sticky breakpoints from `lg` to `md` |
| `src/components/product/ProductImageCarousel.tsx` | Switch aspect/height/zoom breakpoints from `lg` to `md` |

