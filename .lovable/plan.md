

## Zoho-ECMS Product Deduplication & Central Stock Sync

### Current State
- **1,250 ECMS-only products** (334 have images, enriched data). Identified by `external_id`, no `zoho_item_id`.
- **2,194 Zoho products** (no images, basic catalog data). Have both `zoho_item_id` and `external_id` set to Zoho's item_id.
- **Only 1 name overlap** found currently between the two sets. SKU schemes are completely different (no SKU matches).
- Total: 3,444 products with potential for more duplicates as Zoho catalog grows.

### Goal
Make the `products` table the single source of truth where:
- Zoho owns **pricing and stock data** (managed centrally by the Zoho team)
- ECMS/admin owns **images, descriptions, and enrichment** (uploaded locally)
- Duplicates are merged, not duplicated

### Strategy: Smart Merge During Zoho Sync

**1. Modify `zoho-sync` edge function — name-based matching before insert**

Instead of blindly upserting by `zoho_item_id`, the sync will:
1. For each Zoho item, first check if an ECMS product with a matching name (case-insensitive) already exists and has no `zoho_item_id`
2. If found: **link** the existing product by setting its `zoho_item_id`, updating price/cost_price from Zoho, but **preserving** `image_url`, `additional_images`, `description`, `external_id`, and all other enriched fields
3. If not found: upsert as before (new Zoho-only product)

This is done per-batch by:
- Collecting all names from the current Zoho page
- Querying existing products where `zoho_item_id IS NULL AND LOWER(name) IN (...)` 
- For matches: issuing targeted UPDATEs that only set `zoho_item_id`, `price`, `cost_price`, `is_active`
- For non-matches: batch upsert as current

**2. Protect enriched fields during future syncs**

Modify the upsert mapping to exclude fields that should be preserved when updating existing linked products:
- Remove `name` override (keep ECMS name if already set)
- Remove `description` override
- Never overwrite `image_url` or `additional_images`
- Only update: `price`, `cost_price`, `is_active` from Zoho

This is achieved by splitting the upsert into two operations:
- **New products** (no match): full insert with all Zoho fields
- **Existing linked products** (have `zoho_item_id`): selective update of price/cost/status only

**3. Add a manual linking UI on the admin Products page**

A small "Link to Zoho" feature for products that don't auto-match by name:
- On the Products page, show an indicator for ECMS products not yet linked to Zoho
- Provide a dialog where admin can search Zoho products (unlinked ones) and manually link them
- This merges the two records (keeps ECMS images/data, adds `zoho_item_id`)

**4. Track merge statistics in sync log**

Update the sync log `metadata` to include:
- `matched_existing`: count of ECMS products linked to Zoho items
- `new_products`: count of genuinely new Zoho products
- `updated_prices`: count of already-linked products with price updates

### Files to Change

| File | Change |
|------|--------|
| `supabase/functions/zoho-sync/index.ts` | Add name-matching logic in `processPage`, split upsert into match/insert paths, preserve enriched fields |
| `src/hooks/admin/useZohoSync.ts` | Update result type to include merge stats |
| `src/components/admin/products/ZohoSyncHistoryPanel.tsx` | Show merge stats (matched, new, updated) |
| `src/components/admin/products/ProductListView.tsx` | Add "Zoho linked" indicator column |
| New: `src/components/admin/products/LinkToZohoDialog.tsx` | Manual linking dialog for unmatched products |

### Technical Details

The name matching in the edge function will normalize names before comparison:
```text
LOWER(TRIM(name)) — on both Zoho item name and existing product name
```

The `processPage` function changes from a single batch upsert to:
1. Fetch names of all items in the batch
2. Query DB for matches: `SELECT id, name FROM products WHERE zoho_item_id IS NULL AND LOWER(TRIM(name)) = ANY($1)`
3. For matched items: `UPDATE products SET zoho_item_id = $1, price = $2, cost_price = $3 WHERE id = $4`
4. For unmatched items: `INSERT ... ON CONFLICT (zoho_item_id) DO UPDATE SET price, cost_price, is_active` (preserves images)
5. For already-linked items (have zoho_item_id): only update price/cost/status

The ON CONFLICT update clause will explicitly exclude image and description fields to prevent Zoho from overwriting local enrichment.

