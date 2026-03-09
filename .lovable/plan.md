

## Diagnosis

I navigated to `/admin` and got stuck on "Verifying access..." (no login session in the browser tool). This confirms the dashboard requires authentication.

The code and database are verified correct:
- Database: **334 products with primary images**, 333 complete (6/6), 3,444 total active
- `useProductImageStats` hook: correct queries with `is_active = true`, realtime + polling
- Dashboard `StatCard`: properly wired to `imageStats.withPrimary`

**Most likely root cause**: The client-side queries in `useProductImageStats` are failing silently (auth/RLS error) and falling back to `0` via `?? 0`. There is zero error handling — if a query throws, the card just shows "0" with no indication of failure.

## Plan

### 1. Create a server-side database function for image stats
- Create a `SECURITY DEFINER` function `get_product_image_stats()` that returns total, with_primary, and complete counts
- This bypasses RLS entirely, ensuring the count is always accurate for any authenticated admin user
- SQL migration to create the function

### 2. Update `useProductImageStats` to call the database function
- File: `src/modules/products/hooks/useAdminProducts.ts`
- Replace the three separate queries with a single `.rpc('get_product_image_stats')` call
- Keep the realtime invalidation and polling fallback
- Add `onError` logging so failures are visible in console

### 3. Add error fallback display to the Dashboard stat card
- File: `src/pages/admin/Dashboard.tsx`
- If `imageStats` has an error, show a warning indicator instead of "0" so the user knows something went wrong vs. a genuine zero count

### Technical details

Database function:
```sql
CREATE OR REPLACE FUNCTION public.get_product_image_stats()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*) FROM products WHERE is_active = true),
    'with_primary', (SELECT count(*) FROM products WHERE is_active = true AND image_url IS NOT NULL AND image_url <> ''),
    'complete', (SELECT count(*) FROM products WHERE is_active = true AND image_url IS NOT NULL AND image_url <> '' AND coalesce(array_length(additional_images, 1), 0) >= 5)
  );
$$;
```

Hook change: single query instead of three, same return shape, same invalidation logic.

