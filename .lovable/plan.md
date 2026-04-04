

## Add "Featured vs Total" Product Counts to Dashboard

### What You'll See

The dashboard will clearly show three key numbers so you know exactly what needs work:

- **Featured Online** (348) — M&H products with images, actually visible on the storefront
- **M&H Catalog** (837) — Total M&H products (including those without images yet)
- **Total Inventory** (11,493) — Everything across all branches and brand lines

The M&H E-Commerce section will replace the current "M&H Products" card with a "Featured Online" card showing 348/837 (e.g., "348 of 837 listed"), making it immediately clear how many still need images. The combined overview row will add a "Total Products (All)" card showing the full 11,493 count.

### Technical Details

**File: `src/modules/inventory/hooks/useInventoryOverview.ts`**
- Add a query for M&H products with images: `SELECT count(*) FROM products WHERE brand_line = 'm_and_h_fashion' AND is_active AND image_url IS NOT NULL`
- Add total active product count (all brand lines) to the stats return

**File: `src/modules/inventory/types/index.ts`**
- Add `featuredOnline: number` to the `mh` object in `InventoryStats`

**File: `src/pages/admin/Dashboard.tsx`**
- Replace "M&H Products" card with "Featured Online" showing `stats.mh.featuredOnline` with description like "348 of 837 with images"
- Update "Total Stock (All)" row to also show total product count across the entire inventory

### Files Modified
1. `src/modules/inventory/types/index.ts` — Add `featuredOnline` field
2. `src/modules/inventory/hooks/useInventoryOverview.ts` — Query M&H products with images + total products
3. `src/pages/admin/Dashboard.tsx` — Update stat cards to show featured vs total breakdown

