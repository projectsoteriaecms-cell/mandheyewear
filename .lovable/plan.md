

## Fix Eyewear Page: Show Real Products with Real Images

### Problems Found

1. **Eyewear page main grid is empty or wrong** — Line 98 of `Eyewear.tsx` calls `useProducts("m_and_h_fashion")` which returns **0 products** (all 3,444 products are `soteria_medical`). The "Recommended For You" section works because `usePersonalizedProducts` calls `useProducts()` without filter.

2. **Placeholder images showing for products without images** — `ProductCard.tsx` falls back to generic stock photos (`frame-1.jpg` through `frame-4.jpg`) when `image_url` is null. These don't match the product names, hurting credibility. Only ~334 products have real images out of 3,444.

3. **Personalized recommendations show products without images** — `usePersonalizedProducts` scores ALL products regardless of whether they have images, so recommendations can include products with mismatched placeholder photos.

### Plan

**1. Fix Eyewear page query** (`src/pages/Eyewear.tsx`)
- Remove `"m_and_h_fashion"` filter from `useProducts()` call on line 98
- Add a filter to only show products that have a real `image_url` (not null)

**2. Filter products with images only** (`src/hooks/useProducts.ts`)
- Add a `withImages` option to `useProducts` hook, or add `.not("image_url", "is", null)` to the Eyewear query
- This ensures only the ~334 products with real uploaded photos appear in the storefront

**3. Remove placeholder image fallback from ProductCard** (`src/components/eyewear/ProductCard.tsx`)
- Since we're now filtering to only show products with images, remove the placeholder fallback logic
- Keep a simple fallback for edge cases but don't show unrelated stock photos

**4. Filter personalized recommendations** (`src/hooks/usePersonalizedProducts.ts`)
- Add `.not("image_url", "is", null)` filter so recommendations only include products with real images

### Files to Change

| File | Change |
|---|---|
| `src/pages/Eyewear.tsx` | Remove `"m_and_h_fashion"` from `useProducts()` call |
| `src/hooks/useProducts.ts` | Add image filtering option to base `useProducts` hook |
| `src/components/eyewear/ProductCard.tsx` | Remove misleading placeholder image fallback |
| `src/hooks/usePersonalizedProducts.ts` | Filter to products with images only |

