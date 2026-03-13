

## Sync Stock Without Warehouse Mapping

### Problem Analysis

After investigating:
- **10,149 products** were synced successfully from Zoho, but **0 stock records** exist — the stock sync code was deployed *after* your last sync ran.
- "Fetch Zoho Warehouses" returned nothing because Zoho Books' `/settings/warehouses` endpoint isn't available on your plan, and the list `/items` response doesn't include per-warehouse breakdown.
- The fallback path (use total `stock_on_hand` → assign to head office) should work but hasn't been triggered yet.

### Plan

**1. Add a "Sync Stock Only" action to the edge function**

A new `action: "sync_stock"` that re-fetches all Zoho items page-by-page but *only* updates inventory (skips product upsert). This avoids re-running the full product sync just to get stock levels. It uses `stock_on_hand` from each item and assigns it to a configurable default branch (stored in Settings or falling back to head office).

**2. Add a default branch selector to WarehouseMappingCard**

Since per-warehouse mapping isn't available, replace the warehouse discovery flow with a simpler "Default Stock Branch" dropdown. The admin selects which branch receives Zoho stock totals. This is stored in a new `zoho_warehouse_mapping` row with a sentinel `zoho_location_id = '__default__'`.

**3. Add "Sync Stock" button to admin Products page**

A separate button next to "Sync from Zoho" that triggers the stock-only sync. Shows progress and results (X products updated with stock levels).

**4. Ensure `pull_items` also syncs stock on future runs**

The existing `pull_items` action already has stock sync code — it just needs a re-run. No code change needed here, but we'll verify the `stock_on_hand` field is being read correctly from the Zoho response.

### Files to modify
- **`supabase/functions/zoho-sync/index.ts`** — add `sync_stock` action, update fallback logic to check for `__default__` mapping
- **`src/components/admin/settings/WarehouseMappingCard.tsx`** — replace warehouse discovery UI with a "Default Stock Branch" selector
- **`src/modules/integrations/hooks/useZohoSync.ts`** — add `syncStock()` function
- **`src/pages/admin/Products.tsx`** or toolbar — add "Sync Stock" button

