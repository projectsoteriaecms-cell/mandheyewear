

# Enhanced Product Quick View — Shop Without Leaving the Page

## What We're Doing
Upgrade the existing `ProductQuickView` dialog into a full-featured product experience so users can browse, try on, and buy — all from the shop page without navigating away. On mobile, use a bottom sheet instead of a dialog for a native feel.

## Key Changes

### 1. Upgrade ProductQuickView Component
Transform the current bare-bones quick view into a rich product experience:
- **Image gallery** with additional images (swipeable on mobile, thumbnails on desktop)
- **Quantity selector** (reuse the +/- pattern from `AddToCartSection`)
- **Stock status badge** with availability check (reuse `StockBadge`)
- **Virtual Try-On button** — triggers `InlineTryOnModal` directly from the dialog
- **Wishlist button** alongside Add to Cart
- **Specs section** — material, gender, color, frame dimensions
- **"View Full Details" link** — still available but secondary
- Keep the dialog open after adding to cart (show success toast, don't auto-close)

### 2. Mobile: Bottom Sheet Instead of Dialog
- On screens < 640px, render the quick view as a `BottomSheet` (vaul drawer) instead of a centered dialog
- Scrollable content, drag-to-dismiss, feels native
- Use the existing `BottomSheet` component

### 3. Make Quick View the Primary Interaction
- **ProductCard**: Change the "Details/View" button to trigger `onQuickView` callback instead of navigating
- **ProductCard**: Single tap on the card opens quick view, not the product page link
- Remove the `<Link to={/product/...}>` wrapper from ProductCard — replace with an `onClick` that calls `onQuickView`
- Keep "View Full Details" link inside the quick view for users who want the full page
- **Shop.tsx**: Pass `onQuickView={handleQuickView}` to each `ProductCard`

### 4. ProductCard Cleanup
- Remove the `<Link>` wrapper — card becomes a clickable div
- The entire card click opens quick view
- Hover actions (wishlist, try-on, add-to-cart) still work as before with `stopPropagation`

## Files to Modify
- **`src/modules/storefront/components/shared/ProductQuickView.tsx`** — full rewrite with gallery, quantity, try-on, stock, specs, responsive dialog vs bottom sheet
- **`src/modules/storefront/components/eyewear/ProductCard.tsx`** — replace Link wrapper with onClick, add `onQuickView` prop
- **`src/pages/Shop.tsx`** — pass `onQuickView` to ProductCard, remove double-click trigger

## What Stays the Same
- `/product/:id` detail page still exists and works
- `InlineTryOnModal` reused as-is
- `BottomSheet` component reused as-is
- All cart, auth, and wishlist logic unchanged

