
Goal: restore a reliable “Products with images” count (300+) in the ECMS admin experience and keep it accurate immediately after uploads.

What I found
- The main counting hook exists and currently returns server-side counts.
- The stale-count issue can still happen because some image upload paths do not refresh the stats query after mutation.
- Current count logic should be explicitly scoped to active products (your chosen scope), not role-dependent visibility behavior.
- Current “complete” calculation still uses a fixed `.range(0, 4999)` and should be made future-safe.

Implementation plan

1) Make image stats strictly “active products only”
- File: `src/modules/products/hooks/useAdminProducts.ts`
- Update `useProductImageStats` queries to include `is_active = true` for:
  - total products
  - with primary image
  - complete products
- This guarantees the count always matches your chosen catalog scope.

2) Remove remaining ceiling risk for “complete” count
- File: `src/modules/products/hooks/useAdminProducts.ts`
- Replace fixed-range complete counting with paginated fetch (looped batches) or equivalent server-safe approach so stats stay correct beyond 5,000 records.

3) Centralize query refresh after all image mutations
- File: `src/modules/products/hooks/useProductImageUpload.ts`
- Add React Query invalidation inside the hook after successful:
  - single upload
  - multiple upload
  - delete image
  - bulk upload by SKU
- Invalidate:
  - `["admin-products"]`
  - `["products"]`
  - `["product-image-stats"]`
- This covers all upload entry points (Quick modal, Edit dialog, Bulk upload, ECMS-related image updates) without depending on each UI component to remember invalidation.

4) Keep existing invalidations in place where already added
- Files already updated (no rollback needed):
  - `QuickImageUploadModal`
  - `useECMSImport`
  - product create/update/bulk/delete handlers
- These remain compatible with centralized refresh and are harmless if duplicated.

5) UX consistency check on stats cards
- File: `src/pages/admin/ProductImages.tsx`
- Ensure cards reflect loading state cleanly (avoid temporary misleading zeros during fetch) so users don’t interpret loading as wrong counts.

Validation plan (end-to-end)
1. Open `/admin/products/images` and note baseline “With Images”.
2. Upload a new primary image via Quick Image Upload modal → count should increment immediately.
3. Delete that image → count should decrement immediately.
4. Upload via Bulk Image Upload dialog from Products page → returning to Product Images should show updated count without hard refresh.
5. Run one ECMS import/update flow and confirm stats update right after completion.

Expected result
- The dashboard consistently reflects ~300+ uploaded-image products (currently 334 active products with primary images) and updates instantly after any image upload/delete workflow.
