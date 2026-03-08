

## Fix: Product Image Count Not Reflecting All 300+ Images

### Problem
The `useAdminProducts` hook in `src/modules/products/hooks/useAdminProducts.ts` fetches products without a `.range()` limit, so Supabase returns only the default 1,000 rows. With ~3,400 products, the Product Images Manager stats cards are computed from incomplete data, causing the "With Images" count to be wrong.

### Solution

Two changes:

**1. Add `.range(0, 4999)` to the admin products query** (`src/modules/products/hooks/useAdminProducts.ts`)
- Ensures all 3,400+ products are fetched for the grid view and client-side filtering

**2. Add a dedicated `useProductImageStats` hook** (`src/modules/products/hooks/useAdminProducts.ts`)
- Uses server-side `count: "exact"` queries with `.not("image_url", "is", null)` filtering
- Three separate lightweight count queries: total products, products with images, complete products (with 6+ images)
- This guarantees accurate stats regardless of row limits

**3. Update Product Images page** (`src/pages/admin/ProductImages.tsx`)
- Use `useProductImageStats` for the four stats cards instead of deriving from the client-side array
- Keep existing client-side filtering for the product grid (which now gets all rows via the range fix)

**4. Export new hook** (`src/modules/products/hooks/index.ts`, `src/modules/products/index.ts`)

### Files to Change
| File | Change |
|---|---|
| `src/modules/products/hooks/useAdminProducts.ts` | Add `.range(0, 4999)` to query; add `useProductImageStats` hook |
| `src/modules/products/hooks/index.ts` | Export `useProductImageStats` |
| `src/modules/products/index.ts` | Export `useProductImageStats` |
| `src/pages/admin/ProductImages.tsx` | Import and use `useProductImageStats` for stats cards |

