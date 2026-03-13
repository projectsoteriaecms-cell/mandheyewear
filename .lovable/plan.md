

## Prioritize Products with Images in the Storefront

### Problem
The Eyewear page sorts products by `created_at` descending (from the `useProducts` hook), then optionally by price. Products without images appear mixed in with those that have images, creating a poor customer experience.

### Solution
Add a secondary sort in the `filteredProducts` memo in `src/pages/Eyewear.tsx` that pushes products with images to the top, regardless of the selected sort option. Products with images come first, then within each group the existing sort (featured/price) applies.

### Change

**`src/pages/Eyewear.tsx`** — Update the `.sort()` in the `filteredProducts` useMemo (around line 94):

```typescript
.sort((a, b) => {
  // Always prioritize products with images
  const aHasImage = a.image_url ? 1 : 0;
  const bHasImage = b.image_url ? 1 : 0;
  if (aHasImage !== bHasImage) return bHasImage - aHasImage;

  // Then apply selected sort
  if (priceSort === "low-high") return a.price - b.price;
  if (priceSort === "high-low") return b.price - a.price;
  return 0;
});
```

Single file, one edit. Products with images will always appear before those without.

