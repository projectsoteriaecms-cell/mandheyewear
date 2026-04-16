

# Product Page UX Optimization — Amazon-Grade Experience

## Current Problems Identified

1. **Image gallery is static** — no auto-slide, no swipe gestures, no zoom. Users must manually click thumbnails.
2. **Mobile PDP requires excessive scrolling** — image takes full viewport square, then price/title/description/actions are all below the fold.
3. **QuickView dialog has no auto-slide** — manual arrows only, no swipe on mobile.
4. **No image zoom** — Amazon lets users hover (desktop) or pinch-zoom (mobile) to inspect product details.
5. **Desktop layout wastes vertical space** — the hero section (image + price + Add to Cart) should all be visible without scrolling, like Amazon.
6. **Duplicate action buttons** — PDP has both an `AddToCartSection` (desktop) AND separate Wishlist/Try-On buttons outside it, creating redundancy.
7. **MobileActionBar is minimal** — only shows price + Add to Cart, missing Try-On and Wishlist quick actions.

## What We'll Build

### 1. Auto-Sliding Image Carousel (Both PDP and QuickView)
- Replace the static `ProductImageGallery` with an Embla-powered carousel (already installed)
- **Auto-play every 3 seconds**, pauses on hover/touch
- **Swipe gestures** on mobile (left/right to navigate)
- **Dot indicators** on mobile, **thumbnail strip** on desktop
- **Prev/Next arrows** on desktop hover
- Shared hook `useProductCarousel` for both PDP and QuickView

### 2. Desktop: "Above the Fold" Hero Layout
- Make the image carousel use `aspect-[4/5]` instead of `aspect-square` to be taller and more impactful
- Ensure price, Add to Cart, and Buy Now are all visible without scrolling on a 1024px+ viewport
- Add a **"Buy Now"** button (skips cart, goes straight to checkout) alongside Add to Cart — Amazon's biggest conversion trick
- Sticky right column on desktop so product info stays visible while scrolling through details

### 3. Mobile: Compact Above-the-Fold Product Hero
- Image carousel takes ~60% of viewport height (not full square)
- Price and product name overlay on the bottom of the image (semi-transparent gradient) so users see them immediately
- Swipe-to-navigate images
- Enhanced `MobileActionBar` with "Buy Now" + "Add to Cart" split buttons

### 4. QuickView Dialog Upgrade
- Same auto-sliding carousel with swipe support
- Tighter layout: image takes 50% width on desktop, details on right
- "Buy Now" button added alongside Add to Cart

### 5. Image Zoom
- **Desktop**: CSS `transform: scale(2)` on hover with `overflow: hidden` container, following cursor position
- **Mobile**: Tap-to-zoom fullscreen overlay with pinch-zoom support

### 6. Streamlined Product Info Hierarchy
Reorder the right column to match Amazon's proven layout:
```text
1. Product Name (h1)
2. Rating stars + review count
3. Price (large, bold) + Stock badge
4. Social proof ("X viewing today")
5. [Buy Now] [Add to Cart] — side by side
6. [Virtual Try-On] [Wishlist] — secondary row
7. Trust badges (shipping, returns)
8. Specs accordion (collapsed)
9. Description accordion (collapsed)
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/product/ProductImageCarousel.tsx` | **NEW** — Embla carousel with auto-play, swipe, zoom |
| `src/components/product/ProductImageGallery.tsx` | **REPLACE** — swap to use `ProductImageCarousel` |
| `src/pages/ProductDetail.tsx` | **EDIT** — reorder layout, add sticky column, Buy Now, compact mobile hero |
| `src/components/product/AddToCartSection.tsx` | **EDIT** — add Buy Now button, streamline layout |
| `src/components/mobile/MobileActionBar.tsx` | **EDIT** — add Buy Now split action |
| `src/modules/storefront/components/shared/ProductQuickView.tsx` | **EDIT** — use new carousel, add Buy Now |

## Technical Notes
- Uses existing Embla Carousel dependency (already in `components/ui/carousel.tsx`)
- Auto-play plugin: `embla-carousel-autoplay` (needs install)
- Swipe is native to Embla — no custom gesture code needed
- Image zoom uses pure CSS transforms — no additional libraries
- "Buy Now" navigates to `/checkout` with a single-item cart override (query param `?buyNow=productId&qty=1`)
- All changes are frontend-only, no backend modifications

