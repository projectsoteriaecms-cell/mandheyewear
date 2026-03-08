
Goal: make the ECMS admin area reliably show the uploaded product image count again (the ~300+ value), and keep it updated even after imports/syncs.

What I verified
- Current backend data still has the expected range: 3444 active products, 334 with primary images, 333 complete.
- The Product Images page already uses `useProductImageStats`, but updates can still look stale when product records are changed through flows that don’t always force a fresh stats fetch in the current session.
- Main admin dashboard (`/admin`) currently shows total products, not “products with images,” which can look like the image count disappeared.

Implementation plan

1) Make one canonical “image count” definition and enforce it everywhere
- Metric: active products with a non-empty primary image URL.
- Keep “complete” as primary + at least 5 additional images (6/6).
- File: `src/modules/products/hooks/useAdminProducts.ts` (`useProductImageStats`).

2) Add live refresh protection (Realtime + polling fallback)
- In `useProductImageStats`, add:
  - periodic refetch (`refetchInterval`) as a safety net,
  - focus/reconnect refetch enabled,
  - lightweight realtime invalidation on product row changes.
- If realtime is used, add backend publication for `products` so updates trigger invalidation.
- This prevents stale counts if live events are missed.

3) Close remaining mutation/sync refresh gaps
- Ensure stats invalidation is triggered after all product-changing flows, especially:
  - `src/hooks/admin/useZohoSync.ts` (sync completion path),
  - `src/components/admin/products/LinkToZohoDialog.tsx` (merge/delete path).
- Keep existing invalidations in upload/import hooks (already present).

4) Surface the 300+ value clearly in the ECMS admin dashboard
- Add a dedicated “Products with Images” stat card on `/admin` so the uploaded-image count is visible in the main dashboard, not only `/admin/products/images`.
- File: `src/pages/admin/Dashboard.tsx` (reuse `useProductImageStats`).

5) Hardening and UX clarity
- Keep loading state instead of transient zero on all image-count cards.
- Optional: add “Last updated” timestamp near the stat card to reduce confusion during sync windows.

Technical details (implementation targets)
- `src/modules/products/hooks/useAdminProducts.ts`
  - tighten count query conditions (`is_active`, non-empty URL guard),
  - add refetch behavior + realtime invalidation integration.
- `src/hooks/admin/useZohoSync.ts`
  - add query invalidation for `["product-image-stats"]`, `["admin-products"]`, `["products"]` when sync settles.
- `src/components/admin/products/LinkToZohoDialog.tsx`
  - include `["product-image-stats"]` invalidation after link/merge mutation.
- `src/pages/admin/Dashboard.tsx`
  - add “Products with Images” card bound to `stats.withPrimary`.

Validation plan
1. Open `/admin/products/images` and confirm “With Images” shows ~334.
2. Upload and delete a primary image in Quick Upload; count updates immediately.
3. Run ECMS/Zoho sync flow; count updates without manual hard refresh.
4. Open `/admin`; confirm new “Products with Images” card matches `/admin/products/images`.
5. Repeat in a second tab/session to confirm polling fallback keeps numbers consistent.
