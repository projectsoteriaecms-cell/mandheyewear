

## Enhance Stock Overview with Zoho Sync and Stats Dashboard

### What we have now
The Stock Overview page (`/admin/inventory`) has:
- Branch filter, search, low stock toggle
- Import Stock / Export CSV buttons
- Inventory table with SKU, product, branch, quantities, status, bin location
- No summary stats cards
- No Zoho stock sync trigger — that button only exists on the Products page

### What to build

**1. Add inventory stats cards at the top**

Add a row of summary cards above the filters showing:
- Total Stock Units (sum of all `quantity_on_hand`)
- Low Stock Items (count where qty <= threshold)
- Out of Stock (count where qty = 0)
- Active Products / Active Suppliers

Use the existing `useInventoryStats` hook which already computes all of these.

**2. Add "Sync Stock from Zoho" button to the header toolbar**

Import `useZohoSync` and add a "Sync Stock" button next to Import Stock / Export CSV. This triggers `syncStock()` which calls the `sync_stock` action on the zoho-sync edge function. Show a spinner while syncing. After sync completes, inventory queries auto-invalidate so the table refreshes.

**3. Show last sync timestamp**

Query the latest `zoho_sync_log` entry with `sync_type = 'stock'` to display "Last synced: X minutes ago" near the header.

### Files to modify
- **`src/pages/admin/Inventory.tsx`** — Add stats cards row, Zoho sync button, last sync info
- **`src/modules/inventory/hooks/useInventoryOverview.ts`** — No changes needed (stats hook exists)

### No database or edge function changes needed
All backend logic is already implemented. This is purely a UI enhancement to surface the existing sync capability on the Stock Overview page.

