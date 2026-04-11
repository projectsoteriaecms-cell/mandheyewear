

## Non-Working Buttons — Analysis and Fix Plan

### Issues Found

1. **Chat Assistant button (Index.tsx, line 53-58)** — The floating Sparkle button at the bottom-right has **no `onClick` handler**. It does nothing when clicked.

2. **Heart/Wishlist button on Product Detail page (AddToCartSection.tsx, line 127-129)** — The outline Heart button next to "Virtual Try-On" has **no `onClick` handler** and doesn't use the `WishlistButton` component. It's a dead button.

3. **Flash Deal product links (HeroSection.tsx, line 485)** — Products in the hero strip link to `/eyewear/${product.id}`, but the actual product route is `/product/:productId`. These links lead to a 404 page.

4. **Product links in ProductCard (ProductCard.tsx, line 79)** — Same issue: links to `/product/${product.id}` — this one is correct. But the hero section uses the wrong path.

### Plan

**File: `src/components/product/AddToCartSection.tsx`**
- Replace the dead `<Button variant="outline" size="icon"><Heart /></Button>` with `<WishlistButton productId={product.id} />` so the heart button actually toggles wishlist.

**File: `src/modules/storefront/components/home/HeroSection.tsx`**
- Change `/eyewear/${product.id}` to `/product/${product.id}` on line 485 so flash deal cards navigate to the correct product page.

**File: `src/pages/Index.tsx`**
- Either wire the chat assistant button to open a chat dialog/route, or remove it entirely if there's no chat feature implemented yet. Will check if a chat feature exists; if not, remove the dead button to avoid confusing users.

### Technical Details
- `WishlistButton` already exists at `src/components/wishlist/WishlistButton.tsx` and handles auth checks + toggle logic
- The correct product detail route is `/product/:productId` (defined in `public.routes.tsx` line 60)
- All editorial grid links (`/booking`, `/eyewear`, `/try-on`, `/style-quiz`, `/about`) have valid routes

