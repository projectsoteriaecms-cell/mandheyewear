

## Always-Visible Flash Deals Strip with Product Fallback

### Problem
The Flash Deals horizontal bar below the hero only appears when the `slideshow_items` table has data. Since no items have been added yet, users see nothing. It should always be visible as a constant advertising/marketing strip.

### Changes — Single file: `HeroSection.tsx`

1. **Add a fallback query**: When `slideshowItems` is empty, fetch the 6 most recent active products from the `products` table (same fallback pattern used in `PromoSlideshow.tsx`) and map them into the same `SlideshowProduct` shape with `discount_percent: null` and `discount_label: null`.

2. **Remove the `flashDeals.length > 0` conditional**: The strip always renders. If there are admin-curated slideshow items, use those. If not, show the latest products as "New Arrivals" — the header label changes from "Flash Deals" to "New Arrivals" when using fallback data.

3. **Adjust the empty state**: If somehow even the fallback returns zero products, show nothing (edge case safety net).

### Result
The horizontal marketing strip is **always visible** beneath the hero, showing either admin-curated deals or the newest products from the catalog.

