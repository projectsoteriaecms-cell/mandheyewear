

## Hero Section Redesign — Jumia-Inspired Layout with Discount Showcase

### What Changes

The hero becomes a **two-column layout** (text left, large product image right) with a smaller headline, static glasses-frame "OO", and a prominent discount/clearance banner strip — inspired by Jumia's hero structure.

### 1. Reduce Headline Size
- Change `text-[clamp(2.2rem,9vw,8rem)]` to `text-[clamp(1.8rem,5.5vw,4.5rem)]` — roughly 45% smaller
- Tighten line-height and spacing to match

### 2. Remove IMG1 (rotating frame after "clearer")
- Remove the `FrameSlot` for IMG1 from the first line
- The word "clearer" renders as plain text now

### 3. TwinLens "OO" becomes static glasses image
- Replace the SVG `TwinLensSVG` with a static glasses product image (pill-shaped, non-rotating) sized to fit inline with the "outl__k" text
- Reuse the `FrameSlot` component but with a fixed image (no rotation logic)

### 4. Large Product Image on Right
- Restructure the hero content area into a **two-column grid** (`lg:grid-cols-[1fr_1fr]`)
- Left column: headline, subtext, CTAs (as they are now, left-aligned)
- Right column: large hero product image (rounded, with subtle gold border and glow) — uses the first image from the product catalog or a static fallback

### 5. Discount/Clearance Strip (Jumia-style)
- Below the headline grid, add a **"Flash Deals" bar** similar to Jumia's orange flash sale strip
- Shows: "🔥 Flash Deals" label, countdown timer, "See All →" link
- Below it: a horizontal scroll row of 4-6 admin-curated slideshow items (from the `slideshow_items` table) showing product thumbnail, discount badge, original/discounted price
- This replaces the current promo banner card which is bulky — the promo info (title, discount value) moves into this compact strip format

### 6. Cleanup
- Remove unused `img1Index`/`img2Index` rotation state and effects (slot 1 rotation no longer needed; slot 2 simplified to static)
- Remove the large promo banner card (lines 324-383) — its data now feeds the flash deals strip

### Files Modified
- **`HeroSection.tsx`** — all changes in this single file

### Technical Details
- Flash deals strip queries `slideshow_items` joined with `products` (same query pattern as `PromoSlideshow.tsx`)
- Countdown timer uses `useState` + `setInterval` ticking every second, reading `date_label` or a hardcoded end-of-day target
- The large right-side image uses the first product from `allFrames` array with no rotation
- Mobile: stacks vertically (image above or below text), flash deals row scrolls horizontally

