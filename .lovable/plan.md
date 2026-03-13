

## Enhance Zoho Sync to Pull Stock Quantities

### Problem
The current `zoho-sync` edge function only syncs product catalog data (name, SKU, price, cost). Stock quantities from Zoho Books (`stock_on_hand` at top level, and per-location stock via `locations[]` array) are completely ignored.

### Zoho API Data Available
Each item from the Zoho Books `/items` endpoint includes:
- `stock_on_hand` — total stock across all locations
- `locations[]` — array with `location_id`, `location_name`, `location_stock_on_hand`, `location_available_stock`

### Current Branches
There are 5 active branches. We need a way to map Zoho location IDs to these branch IDs.

### Plan

**1. Create a `zoho_warehouse_mapping` table (migration)**

Maps Zoho Books location IDs to local branch IDs. Super admins can configure this via the admin UI.

```sql
CREATE TABLE public.zoho_warehouse_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zoho_location_id text NOT NULL UNIQUE,
  zoho_location_name text,
  branch_id uuid NOT NULL REFERENCES branches(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.zoho_warehouse_mapping ENABLE ROW LEVEL SECURITY;
-- Only super_admins can manage
CREATE POLICY "Super admins manage warehouse mapping"
  ON public.zoho_warehouse_mapping FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));
-- Staff can view
CREATE POLICY "Staff can view warehouse mapping"
  ON public.zoho_warehouse_mapping FOR SELECT
  USING (has_role(auth.uid(), 'branch_staff'::app_role)
    OR has_role(auth.uid(), 'branch_manager'::app_role)
    OR has_role(auth.uid(), 'super_admin'::app_role));
```

**2. Update `zoho-sync` edge function**

After product upsert, process stock for each item:
- Extract `stock_on_hand` and `locations[]` from raw Zoho item data (currently lost in `mapZohoItemToProduct`)
- For each Zoho location, look up the corresponding branch via `zoho_warehouse_mapping`
- Upsert into the `inventory` table (`product_id` + `branch_id`), setting `quantity_on_hand`
- Log inventory transactions with type `zoho_sync` for audit trail
- If no location data or no warehouse mapping exists, use `stock_on_hand` with a configurable default branch (head office: Warri)
- Track stock sync counts in the sync log metadata

Key changes to `processPage()`:
- Pass raw Zoho items alongside mapped products so stock fields are preserved
- After product upsert/link, call a new `syncStockForItems()` function
- `syncStockForItems()` loads warehouse mappings once, then for each item with stock data, upserts inventory records

**3. Add "Warehouse Mapping" section to Admin Settings**

Add a new card in `src/pages/admin/Settings.tsx`:
- Lists Zoho locations (fetched via a new `action: "list_warehouses"` in the edge function that calls `/settings/warehouses` or extracts from item data)
- Each row shows Zoho location name with a dropdown to select the local branch
- Save creates/updates rows in `zoho_warehouse_mapping`

Alternatively, during the first sync, auto-discover Zoho locations from item data and store them in the mapping table with `branch_id = NULL`. The admin UI then shows unmapped locations for the user to assign branches.

**4. Add `zoho_sync` transaction type to inventory_transactions**

The existing `transaction_type` is a custom enum. Add `zoho_sync` as a new value:
```sql
ALTER TYPE public.inventory_transaction_type ADD VALUE IF NOT EXISTS 'zoho_sync';
```

### Files to modify
- **New migration**: Create `zoho_warehouse_mapping` table + add `zoho_sync` enum value
- **`supabase/functions/zoho-sync/index.ts`**: Add stock sync logic after product sync, add `list_warehouses` action
- **`src/pages/admin/Settings.tsx`**: Add warehouse mapping configuration card
- **`src/integrations/supabase/types.ts`**: Will auto-update after migration

### Stock Sync Logic (pseudocode)
```text
For each Zoho item on the page:
  1. Find product_id by zoho_item_id
  2. If item has locations[]:
       For each location with mapping → branch:
         UPSERT inventory (product_id, branch_id) SET quantity_on_hand
         INSERT inventory_transaction (type: zoho_sync)
  3. Else if item has stock_on_hand:
       Use default branch (head office)
       UPSERT inventory → same as above
```

### Safety
- Stock sync only writes to inventory records for mapped warehouses — unmapped locations are skipped (logged as warnings)
- Uses service role key (already in use for product sync)
- Inventory transactions provide full audit trail

