
## Problem Diagnosis

The database function `get_product_image_stats()` works correctly — direct query returns `{"total": 3444, "with_primary": 334, "complete": 333}`. The super admin sees "0" on `/admin`, which means:

1. **The RPC function exists and executes correctly** (verified via direct query).
2. **The hook calls the RPC**, but either:
   - The response is malformed, or
   - The TypeScript typing issue causes `data` to be `null` while an actual value is returned as JSONB.

### Root Cause

The TypeScript types in `src/integrations/supabase/types.ts` show:
```typescript
get_product_image_stats: { Args: never; Returns: Json }
```

The function returns `jsonb` as a single JSON object. However, Supabase's PostgREST response for `rpc` calls wraps the value differently when the return type is `jsonb`. The hook code casts `data` as:
```typescript
const result = data as { total: number; with_primary: number; complete: number } | null;
```

But `data` may already be the object (not a separate type), or the numeric fields are `bigint` instead of `number`, which Postgres `count(*)` returns as `bigint`. If the fields are actually `bigint`, JSON serialization yields strings, not numbers.

### Solution

1. **Fix the DB function** to explicitly cast counts to `int` (not `bigint`).
2. **Update the hook** to handle the response robustly — parse numeric fields defensively.

---

## Implementation Plan

### 1. Fix Database Function — Cast Counts to Integer
Update `get_product_image_stats()` to cast `count(*)::int` so Postgres returns an integer (fits JSON number) instead of bigint (JSON string).

**File**: SQL migration

```sql
CREATE OR REPLACE FUNCTION public.get_product_image_stats()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'total', (SELECT count(*)::int FROM products WHERE is_active = true),
    'with_primary', (SELECT count(*)::int FROM products WHERE is_active = true AND image_url IS NOT NULL AND image_url <> ''),
    'complete', (SELECT count(*)::int FROM products WHERE is_active = true AND image_url IS NOT NULL AND image_url <> '' AND coalesce(array_length(additional_images, 1), 0) >= 5)
  );
$$;
```

### 2. Harden the Hook — Parse Numbers Defensively
Update `useProductImageStats` to use `Number()` on each field in case they arrive as strings.

**File**: `src/modules/products/hooks/useAdminProducts.ts`

```typescript
// After RPC call
const result = data as Record<string, unknown> | null;
return {
  total: Number(result?.total ?? 0),
  withPrimary: Number(result?.with_primary ?? 0),
  complete: Number(result?.complete ?? 0),
};
```

---

## Validation
Once deployed, navigate to `/admin` — the "With Images" card should display **334**.
