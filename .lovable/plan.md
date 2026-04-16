

# Align Mobile Product Image with Page Content

## Problem
The product image currently uses `-mx-4` on mobile, which makes it bleed edge-to-edge while all other content (Back button, badges, title, price) respects the `px-4` page padding. This creates a visual misalignment — the image is wider than everything else.

## Change

### ProductDetail.tsx (line 205)
Remove the `-mx-4 sm:mx-0` wrapper so the image sits within the same `px-4` padding as the rest of the page content.

```
// Before
<div className="-mx-4 sm:mx-0">

// After
<div>
```

### ProductImageCarousel.tsx (line 90)
Add `rounded-lg` on mobile too (currently only `md:rounded-lg`), since the image will no longer touch screen edges.

```
// Before
"relative overflow-hidden bg-secondary group md:rounded-lg"

// After
"relative overflow-hidden bg-secondary group rounded-lg"
```

### Result
On 390px mobile, the image will have 16px padding on both left and right — perfectly aligned with the Back button, title, price, and all other content below it.

| File | Change |
|------|--------|
| `src/pages/ProductDetail.tsx` | Remove `-mx-4 sm:mx-0` from image wrapper |
| `src/components/product/ProductImageCarousel.tsx` | `md:rounded-lg` → `rounded-lg` |

