

## Assessment: Image Stats Are Already Working Correctly

After thorough investigation, the code and data are both in good shape:

- **Database confirms**: 3,444 total active products, **334 with primary images**, 333 complete (6/6)
- **`useProductImageStats`** correctly uses server-side `count: "exact"` with `is_active = true` filter — bypasses the 1,000-row limit
- **`useProductImageUpload`** has centralized query invalidation for `["product-image-stats"]` after every upload/delete
- **Stats cards** on `/admin/products/images` show loading spinners during fetch, then display correct numbers
- **All exports** are properly wired

### No code changes needed

The 300+ image count (specifically 334) should already be displaying correctly on the Product Images Manager page at `/admin/products/images`. 

### What to verify

Navigate to `/admin/products/images` in the preview and confirm the "With Images" card shows **334**. If it shows a different number, please share a screenshot so I can identify whether this is:
1. A role/permissions issue (branch_manager vs super_admin seeing different counts)
2. A caching issue in the browser
3. A different page than `/admin/products/images` where you expect to see the count

