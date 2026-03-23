

## Hide Products Without Images from E-commerce Storefront

### Problem
Products without images are still showing on the storefront (just sorted to the bottom). The user wants to completely remove them from the customer-facing shop until images are available.

### Solution
Add `withImagesOnly: true` filter to all storefront product queries so only products with an `image_url` appear on the e-commerce frontend. Admin pages remain unaffected.

### Files to modify

1. **`src/pages/Eyewear.tsx`** (line 79) — Pass `withImagesOnly` flag:
   ```typescript
   const { data: products, isLoading, error } = useProducts("m_and_h_fashion", true);
   ```

2. **`src/modules/products/hooks/useProducts.ts`** — Update `useFeaturedProducts` to also filter by `m_and_h_fashion` brand line (it already filters `image_url IS NOT NULL`).

3. **`src/modules/storefront/components/home/QuickDiscovery.tsx`** and **`src/modules/storefront/components/shared/FeaturedFrames.tsx`** — Verify they use filtered hooks. If they call `useProducts()` directly, pass `"m_and_h_fashion"` and `true`.

This also applies the M&H-only brand filter from the previously approved plan, combining both changes.

### No database changes needed
The `useProducts` hook already supports both `brandLine` and `withImagesOnly` parameters — they just aren't being passed from the storefront pages.

