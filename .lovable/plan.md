

## Redesign Dashboard with M&H vs Central Inventory Breakdown

### Current Problems
1. **No stock data**: The ECMS report quantities were never imported into the `inventory` table. All 8,945 records show 0 stock.
2. **Dashboard is flat**: Stats show one combined number for everything. No distinction between M&H e-commerce stock vs central Soteria stock.
3. **No visibility into "excess" central inventory**: You can't see what's sitting in other branches available for sourcing.

### Phase 1: Import ECMS Stock Quantities

Run a data script to parse the uploaded `InventoryReport_15.xlsx` again, this time writing the actual stock quantities into the `inventory` table for the M&H branch. Products matched by SKU/name get their `quantity_on_hand` updated.

### Phase 2: Redesign Dashboard Stats

Replace the current single-row stats with a **two-section layout**:

**Section A — M&H E-Commerce (your storefront)**
- M&H Stock Units (total quantity at M&H branch)
- M&H Products (count of `m_and_h_fashion` products)
- Low Stock (M&H items below threshold)
- Out of Stock (M&H items at zero)

**Section B — Central / Other Branches**
- Central Stock Units (total quantity at non-M&H branches)
- Soteria Products (count of `soteria_medical` products)
- Available for Sourcing (items with stock at other branches but zero at M&H)
- Total Branches

### Phase 3: Update `useInventoryStats` Hook

Rewrite the hook to query inventory joined with branches, splitting by `is_mh_location`:
- M&H stats: filter `branches.is_mh_location = true`
- Central stats: filter `branches.is_mh_location = false`
- "Available for sourcing" count: products with 0 at M&H but >0 elsewhere

Update the `InventoryStats` type to include the new fields.

### Phase 4: Add "Central Inventory Excess" Card

Add a new card below the stats grid showing a summary of stock sitting in other branches that isn't allocated to M&H. This is the "excess" that remains unless requested. Shows top items by quantity with branch location.

### Files Modified
1. Data script (exec) — Import ECMS stock quantities into `inventory` table for M&H branch
2. `src/modules/inventory/types.ts` — Extend `InventoryStats` with M&H vs central fields
3. `src/modules/inventory/hooks/useInventoryOverview.ts` — Split stats by M&H vs central
4. `src/pages/admin/Dashboard.tsx` — Two-section stats layout + central excess card
5. `src/shared/layouts/admin/dashboard/StatCard.tsx` — Minor: support section headers if needed

