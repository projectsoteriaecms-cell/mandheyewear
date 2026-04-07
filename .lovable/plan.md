

## Hide Zero/Missing Price Products from Storefront

Add a price filter to the storefront product query so products with `price = 0` or `price IS NULL` are excluded from customer-facing pages. Admin dashboard remains unchanged.

### Changes

**1. `src/modules/products/hooks/useProducts.ts`**
- In `useProducts()`: when `brandLine` is `"m_and_h_fashion"` or `withImagesOnly` is true (storefront contexts), add `.gt("price", 0)` to the query
- In `useFeaturedProducts()`: add `.gt("price", 0)` since this is always storefront-facing
- Leave the base query without `brandLine` (admin) untouched

**2. `src/modules/products/hooks/useProducts.ts` — `get_product_category_counts` RPC**
- No change needed — the RPC counts all active products regardless of price, which is acceptable for category pill counts. Alternatively, we could update the DB function, but the visual difference (off by 2 items) is negligible.

### Implementation Detail
```typescript
// In useProducts, after existing filters:
if (withImagesOnly || brandLine === "m_and_h_fashion") {
  query = query.gt("price", 0);
}

// In useFeaturedProducts, add to query chain:
.gt("price", 0)
```

One file modified. No database changes needed.

