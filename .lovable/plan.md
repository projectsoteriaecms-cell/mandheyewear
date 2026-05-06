## Problem

The admin Products page shows **Product Catalog (0)** and "No products found", but the database actually contains **11,496 active products**.

Root cause: `src/modules/products/hooks/useAdminProducts.ts` fetches the entire catalog in one query by looping 1,000-row batches with heavy joins (`category`, `supplier`, `frame_attributes`, `lens_attributes`). With ~11.5k rows that's ~12 sequential round-trips. React Query aborts the in-flight chain on remount/refetch (visible as `AbortError: signal is aborted without reason`), so `products` resolves to `[]` and the UI renders the empty state.

Filtering and search are also done client-side over the full result set, which only works if the full set arrives — making the failure mode total.

## Fix

Switch the admin list from "load everything" to **server-side paginated + filtered** queries.

### 1. `useAdminProducts` (hook)
- Accept params: `{ page, pageSize, search, brandFilter, statusFilter }`.
- Use a single Supabase query with:
  - `.select(..., { count: 'exact' })` (drop `frame_attributes`/`lens_attributes` from the list query — fetch on edit instead).
  - `.range(from, to)` for the current page only.
  - `.ilike('name', %search%)` / `.or('name.ilike.%q%,sku.ilike.%q%')` when `search` is set.
  - `.eq('brand_line', brandFilter)` when not "all".
  - `.eq('is_active', true/false)` when not "all".
- Return `{ products, totalCount, isLoading, ... }`.
- Keep `createProduct` / `updateProduct` / `bulkCreateProducts` / `deleteProduct` mutations as-is.

### 2. `src/pages/admin/Products.tsx`
- Add `page` state (default `1`) and `pageSize` (default `50`).
- Reset `page` to 1 whenever `searchQuery`, `brandFilter`, or `statusFilter` changes (debounce search ~300ms via existing `useDebouncedValue`).
- Pass filters + page into `useAdminProducts` instead of filtering client-side.
- Remove the local `filteredProducts` block.

### 3. `ProductsTable` (`src/pages/admin/products/ProductsTable.tsx`)
- Show `Product Catalog ({totalCount})` instead of `products.length`.
- Add a simple pager footer: "Page X of Y · Prev / Next" using shadcn `Button`s.

### 4. Image-stats card
`useProductImageStats` already uses an RPC and is fine — leave it.

## Out of scope

- No DB schema or RLS changes (data and policies are correct; counts confirmed via SQL).
- No changes to bulk import / Zoho sync / image-stats RPC.
- Edit dialog will continue to load `frame_attributes` / `lens_attributes` on demand (already does via its own query path).

## Acceptance

- `/admin/products` loads in one network round-trip and shows the real count (11,496) in the header.
- Search, brand filter, and status filter narrow results server-side.
- No more `AbortError` from the chained batch loop.
