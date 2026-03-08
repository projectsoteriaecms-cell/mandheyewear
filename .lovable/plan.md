

## Problem Found: Image Stats Not Refreshing After Uploads

The database confirms **334 products with images** and **333 complete** out of 3,444 total active products. The code for counting is correct -- it uses server-side `count: "exact"` queries that bypass the 1,000-row limit.

**The bug**: After uploading/deleting images, the stats cards don't update because the `QuickImageUploadModal` (and other mutation handlers) only invalidate `["admin-products"]` but **never invalidate** `["product-image-stats"]`. This means the stats cards stay stale until a full page refresh.

### Fix

**File: `src/components/admin/products/QuickImageUploadModal.tsx`**
- Add `queryClient.invalidateQueries({ queryKey: ["product-image-stats"] })` alongside every existing `queryClient.invalidateQueries({ queryKey: ["admin-products"] })` call (4 locations: upload, delete, set primary, reorder).

**File: `src/modules/products/hooks/useAdminProducts.ts`**
- Add `queryClient.invalidateQueries({ queryKey: ["product-image-stats"] })` in `createProduct`, `updateProduct`, `bulkCreateProducts`, and `deleteProduct` mutation success handlers.

**File: `src/modules/products/hooks/useECMSImport.ts`**
- Add `queryClient.invalidateQueries({ queryKey: ["product-image-stats"] })` after ECMS import completion.

This ensures the stats cards (Total Products, With Images, Missing Primary, Complete) refresh immediately after any image or product change.

