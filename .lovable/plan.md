

## Inventory Dashboard Findings and Required Fixes

### Current State (Post-Sync)

| Metric | Value | Explanation |
|---|---|---|
| Total inventory rows | 8,600 | Created by the latest sync |
| Total stock units | **0** | Zoho returns `stock_on_hand = 0` for all items |
| Low stock alerts | 8,600 | All rows are at 0, which is below threshold |
| Out of stock | 8,600 | All rows have exactly 0 |
| M&H products | **0** | Every single product has `brand_line = 'soteria_medical'` |

### Three Problems Identified

**1. Zoho returns zero stock for all items**
The sync processed 8,600 items and created inventory rows, but Zoho Books returned `stock_on_hand = 0` for every one. This is likely because:
- Zoho Books (not Zoho Inventory) may not track physical stock by default
- The API endpoint may need the `?warehouse_id=...` parameter to get real quantities
- Or these items genuinely aren't stock-tracked in Zoho

Without diagnostic logs (they appear to have rotated), we can't confirm what Zoho returned. We need to re-run the sync with more visible logging or make a direct test API call.

**2. ALL products are `soteria_medical` — zero `m_and_h_fashion`**
The `brand_line` column has only one value across all 11,400 products. The earlier filter we added (`useProducts("m_and_h_fashion", true)`) means the **storefront currently shows nothing** from the database query. Products with images that appear on the shop are likely from a cached state or the ECMS imports that aren't Zoho-linked.

We need to either:
- Identify which products are M&H and update their `brand_line` (by name pattern, category, or Zoho group)
- Or temporarily remove the `m_and_h_fashion` filter until the separation is properly done

**3. 1,250 ECMS products (with images) aren't in inventory**
The products that actually have images (ECMS imports) don't have `zoho_item_id` set, so the sync skipped them. They also don't have inventory rows since we deleted the orphaned ECMS rows. These are the products customers can see, but they have no stock data.

### Recommended Fix Plan

**Step 1: Investigate Zoho stock data** — Make a direct API call to Zoho Books to check if `stock_on_hand` is genuinely 0 or if we need a different API parameter (e.g., composite items, or Zoho Inventory vs Books).

**Step 2: Fix brand_line classification** — Update the ECMS-imported products (those with images, which are the M&H eyewear products) to `brand_line = 'm_and_h_fashion'`. These are the ones with names like "Frame : M&H...", "CHANEL...", "LA VITA...", "SUNNY CORD..." etc.

**Step 3: Create inventory rows for M&H products** — Insert inventory records for the ~1,250 ECMS products at the Warri Head Office branch with a reasonable default stock level (or 0 until real counts come in).

**Step 4: Re-verify dashboard counts** — After fixes, the dashboard should show meaningful numbers.

### Technical Changes

1. **Database update** — `UPDATE products SET brand_line = 'm_and_h_fashion' WHERE zoho_item_id IS NULL AND image_url IS NOT NULL` (the ECMS imports with images are the M&H eyewear products)

2. **Database insert** — Create inventory rows for M&H products at Warri Head Office with `quantity_on_hand = 0` so they at least appear in inventory management

3. **Edge function** — Add a direct Zoho API test call to check what stock data actually looks like for a known item, before adjusting the sync logic further

4. **`useInventoryStats` hook** — Optionally filter dashboard stats by branch or brand_line so the admin sees M&H-relevant numbers

