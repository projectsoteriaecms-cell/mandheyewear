

## Diagnosis: Stock Sync from Zoho Is Running But Updating Zero Items

### What I Found

I dug into your database and sync logs. Here's the situation:

1. **Stock sync IS running** — the latest sync processed 10,151 Zoho items across 51 pages. But it updated **zero** stock levels. Every sync shows `stock_updated: 0`.

2. **The inventory table has 1,250 rows** — all from the old ECMS import, all with `quantity_on_hand = 0`. These are the "1,000 low stock" and "1,000 out of stock" numbers you're seeing. They're not placeholders — they're real rows with zero stock.

3. **10,150 Zoho-linked products have NO inventory rows at all** — so they don't even show up in stock counts.

4. **Your warehouse mapping table is completely empty** — no Zoho locations are mapped to local branches, and no `__default__` fallback is configured.

### Root Cause

The stock sync logic works like this:
- For each Zoho item, it checks if the API returns per-warehouse stock (`item.warehouses` array)
- If warehouses exist, it looks up the mapping table to find which local branch each warehouse belongs to → **table is empty, so all are skipped**
- If no warehouses, it uses `item.stock_on_hand` and assigns it to a default branch → the code falls back to your head office branch, but if Zoho returns `stock_on_hand = 0` (common if items aren't inventory-tracked in Zoho Books, or if the API needs additional parameters), nothing gets created

### Fix Plan

**Step 1: Add diagnostic logging to the edge function**
- Log what Zoho actually returns for `stock_on_hand` and `warehouses` on a sample of items, so we can confirm exactly what data the API provides

**Step 2: Create a `__default__` warehouse mapping**
- Insert a row mapping `__default__` → Warri Head Office branch, guaranteeing the fallback path works

**Step 3: Fix the stock sync to handle zero-stock items too**
- Currently items with `stock_on_hand = 0` are silently skipped (line 193). Change logic to also create/update inventory rows when stock is 0 — because zero IS valid stock data from Zoho. The current code only creates inventory when `stockOnHand > 0`, which means the 10K Zoho products never get inventory rows at all.

**Step 4: Clean up the 1,250 orphaned ECMS inventory rows**
- These ECMS products (no `zoho_item_id`) are inflating the "low stock" / "out of stock" counts. For any ECMS product that now has a Zoho-linked equivalent (matched by name), the old zero-stock row is misleading.

### Technical Changes

**`supabase/functions/zoho-sync/index.ts`**:
- Add `console.log` for first 3 items showing `stock_on_hand`, `warehouses` presence, and `item_type`
- In `syncStockForItems`, remove the `if (stockOnHand > 0)` gate — allow zero-stock upserts so all Zoho products get proper inventory rows
- For the warehouse path, still skip unmapped warehouses but log the count

**Database insert** (via insert tool):
- Insert `__default__` warehouse mapping → Warri Head Office (`d902e977-981b-42bf-8b42-55a765e046ed`)

This should make the next "Sync from Zoho" actually populate real stock levels for all 10K+ Zoho products.

