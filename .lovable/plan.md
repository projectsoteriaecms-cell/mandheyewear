

## Fix: Category Bar Missing Items + Product Query Limit

### Problem
The Supabase client returns a **maximum of 1000 rows** by default. With 2,967 frames in the database, the first 1000 results are all frames — so Accessories (20), Lenses (401), Contacts (10), Solutions (4), and Medications (11) never appear in the category bar or product grid.

### Solution

**1. Fix the product query to fetch all rows** (`src/hooks/useProducts.ts`)
- Add a pagination loop or use `.range()` calls to fetch beyond the 1000-row limit
- Alternative: fetch category counts separately with a lightweight query, and paginate the main product list server-side

**2. Better approach — Server-side pagination + separate count query**
Rather than loading 3,400+ products into memory:
- Create a new `useProductCounts` hook that runs `SELECT item_type, is_prescription_compatible, COUNT(*) FROM products WHERE is_active = true GROUP BY item_type, is_prescription_compatible` via an RPC function — this powers the category bar counts accurately
- Update `useProducts` to accept `categoryFilter` as a parameter and apply it server-side, fetching only the relevant slice with `.range(offset, offset + limit)`
- This keeps the page fast and ensures all categories are visible

**3. Files to change:**
| File | Change |
|------|--------|
| Database migration | Create an RPC function `get_product_category_counts()` |
| `src/hooks/useProducts.ts` | Add server-side category filtering, pagination with `.range()`, and a `useProductCounts` hook |
| `src/pages/Eyewear.tsx` | Use `useProductCounts` for the category bar, pass filters to `useProducts` for server-side filtering |
| `src/components/eyewear/ShopCategoryBar.tsx` | No changes needed (already works with counts) |

### Technical Detail
The RPC function:
```sql
CREATE OR REPLACE FUNCTION get_product_category_counts()
RETURNS TABLE(category text, count bigint) AS $$
  SELECT 'all', COUNT(*) FROM products WHERE is_active = true
  UNION ALL
  SELECT 'eyeglasses', COUNT(*) FROM products WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible IS NOT false
  UNION ALL
  SELECT 'sunglasses', COUNT(*) FROM products WHERE is_active = true AND item_type = 'frames' AND is_prescription_compatible = false
  UNION ALL
  SELECT item_type, COUNT(*) FROM products WHERE is_active = true AND item_type != 'frames' GROUP BY item_type
$$ LANGUAGE sql STABLE;
```

The updated `useProducts` hook will accept filter parameters and use `.range()` for true server-side pagination, eliminating the 1000-row ceiling entirely.

