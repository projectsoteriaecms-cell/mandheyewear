

## Fix Category Filter and Stats Coherence in Product Image Manager

### Problem
1. The category dropdown only shows categories that have products in the database — categories with zero products are missing from the list. All 9 database enum values should always appear in the dropdown for completeness.
2. The four stats cards (Total, With Images, Missing Primary, Complete) always show global numbers regardless of which category is selected. When filtering by category, the stats should reflect the filtered subset so the numbers "balance" and make sense together.

### Changes — `src/pages/admin/ProductImages.tsx`

**1. Show all categories in the dropdown, not just ones with products**
- Build dropdown options from a static list of all `item_type` enum values (the existing `ITEM_TYPE_LABELS` map) instead of only from products that exist
- Still show per-category product counts next to each label, but include categories with 0 count so admins can see the full picture

**2. Make stats cards respond to filters**
- Compute a `filteredStats` memo that recalculates total, withPrimary, missingPrimary, and complete counts from the current `filteredProducts` (after search + category + status filters are applied)
- When no filters are active, use the existing RPC stats (accurate global numbers)
- When any filter is active (category, search, or status), use the locally computed stats from the filtered product list
- This ensures the four stat cards always reflect what the user is currently viewing

**3. Update results badge**
- When a category filter is active, show the category name in the results summary (e.g., "142 products in Frames")

### Files Changed
- `src/pages/admin/ProductImages.tsx` — single file update

