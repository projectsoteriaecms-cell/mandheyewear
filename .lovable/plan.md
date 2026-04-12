

## Bulk Product Data Update + Zoho Sync for M&H Cleaned Data

### What You Need

You've cleaned up the M&H product nomenclature and want to:
1. Upload the corrected data from `InventoryReport_15.xls` to replace flawed product records
2. Insert any new products that don't already exist
3. Push all corrections to Zoho Books automatically

### Current State

- 837 M&H Fashion products in the database, most with `[NEEDS_RESEARCH]` brand tags and messy names like `"ACCESSORIES :  10K BEIAGE MARBLE ROPE"`
- Products are matched by `external_id` (the ProductId from ECMS)
- Most M&H products lack `zoho_item_id` (not yet linked to Zoho), while ~10,156 Zoho-synced products exist elsewhere
- Existing ECMS import system handles new product insertion but not bulk updates of existing products
- Zoho sync edge function exists for pulling items in but lacks an outbound "push updates" action

### What Will Be Built

#### 1. Bulk Product Update Edge Function

Create a new edge function `bulk-product-update` that:
- Accepts a JSON payload of product rows (parsed client-side from the Excel file)
- Matches existing products by `external_id` first, then by SKU as fallback
- For matched products: **updates all fields** (name, price, brand, item_type, description, etc.) preserving only `image_url` and `additional_images` (since those were manually curated)
- For unmatched products: inserts them as new with `brand_line = 'm_and_h_fashion'`
- Returns a summary of updated/inserted/failed counts

#### 2. Zoho Outbound Push

Add a new action `push_updates` to the existing `zoho-sync` edge function that:
- Takes a list of product IDs
- For products WITH `zoho_item_id`: calls Zoho Books API `PUT /items/{item_id}` to update name, SKU, rate, description
- For products WITHOUT `zoho_item_id`: calls Zoho Books API `POST /items` to create them, then saves the returned `zoho_item_id` back to the database
- Processes in batches of 25 (Zoho rate limits)
- Logs results to `zoho_sync_log`

#### 3. Admin UI: Data Cleanup Upload Page

Add a "Data Update" option to the existing Products toolbar that:
- Opens a dialog to upload the cleaned Excel file
- Parses it client-side (same ExcelJS approach as ECMS import)
- Shows a preview: "X products will be updated, Y new products will be inserted"
- Highlights the specific fields that will change (old value → new value)
- On confirm: calls the `bulk-product-update` edge function
- After DB update succeeds: optionally triggers Zoho push for all affected products

### Files to Create
- `supabase/functions/bulk-product-update/index.ts` — handles bulk upsert logic with external_id matching
- `src/modules/products/components/DataCleanupDialog.tsx` — upload + preview + confirm UI

### Files to Modify
- `supabase/functions/zoho-sync/index.ts` — add `push_updates` action to push corrected data outbound to Zoho
- `src/pages/admin/products/ProductsToolbar.tsx` (or equivalent toolbar component) — add "Update Product Data" button
- `src/modules/integrations/hooks/useZohoSync.ts` — add `pushUpdates` method

### Database Migration
- None needed — existing `products` table schema already supports all fields

### Technical Details
- Excel parsing uses ExcelJS (already in the project)
- Matching priority: `external_id` → `sku` → skip
- Protected fields during update: `image_url`, `additional_images`, `zoho_item_id` (preserved unless the Zoho push creates a new link)
- Zoho push uses the existing OAuth token refresh flow
- Batch size: 50 products per DB upsert call, 25 per Zoho API call

