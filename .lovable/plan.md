

## Fix Incomplete Product Counts in Image Manager

### Root Cause
The `useAdminProducts` hook fetches products with `.range(0, 4999)`, but Supabase PostgREST has a default `max_rows` limit of 1000. So only ~1000 of the 3,444 active products are returned. The category dropdown counts and filtered stats are computed client-side from this incomplete list, producing wrong numbers (e.g., showing ~300 frames instead of 2,967).

Additionally, the page is crashing (console errors in ProductImages component), likely from the recent edits.

### Solution — Two-Part Fix

**1. Server-side category counts via new RPC function** (database migration)

Create a `get_product_image_category_stats()` function that returns per-item-type counts with image stats, bypassing client-side row limits:

```sql
CREATE FUNCTION get_product_image_category_stats()
RETURNS jsonb AS $$
  SELECT jsonb_agg(row_to_json(t))
  FROM (
    SELECT 
      item_type,
      count(*)::int AS total,
      count(*) FILTER (WHERE image_url IS NOT NULL AND image_url <> '')::int AS with_primary,
      count(*) FILTER (WHERE image_url IS NOT NULL AND image_url <> '' 
        AND coalesce(array_length(additional_images,1),0) >= 5)::int AS complete
    FROM products WHERE is_active = true
    GROUP BY item_type ORDER BY count(*) DESC
  ) t;
$$
```

**2. Use batch-fetching in `useAdminProducts`** (`src/modules/products/hooks/useAdminProducts.ts`)

Replace the single `.range(0, 4999)` call with a `fetchAllRows`-style loop (batch size 1000) to ensure all 3,444 products are fetched — matching the pattern already used in `useProducts.ts`.

**3. Update `ProductImages.tsx`** to use the new RPC for category dropdown counts

- Fetch `get_product_image_category_stats` via a new query
- Use server-side counts for the category dropdown labels (e.g., "Frames (2,967)")
- Keep client-side `filteredStats` for when search/status filters are active (those still work on the loaded data)
- Fix any crash from the recent edits

### Files Changed
- **Database migration** — new `get_product_image_category_stats()` RPC
- `src/modules/products/hooks/useAdminProducts.ts` — batch-fetch all products
- `src/pages/admin/ProductImages.tsx` — use server-side category stats for dropdown

