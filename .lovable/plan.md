## Plan

### 1. Re-nuke Soteria catalog (clean slate)
- Stop the in-progress Zoho pull immediately.
- Delete every `products` row where `brand_line = 'soteria_medical'` (plus any orphaned `inventory`, `product_images`, `product_variants` tied to those products).
- Leave M&H Eyewear (162 frames, `m_and_h_fashion`) completely untouched.
- Verify counts after: M&H = 162, Soteria = 0.

### 2. Make M&H ↔ Zoho a clean two-way sync
Repurpose the existing `zoho-sync` edge function so M&H Eyewear becomes the synced brand instead of Soteria.

**Outbound (M&H → Zoho)** — push our 162 frames into Zoho as Items:
- New action `push_items`: for every M&H product not yet linked to a Zoho item, create the item in Zoho Books (name, SKU, price, stock per branch warehouse) and store the returned `zoho_item_id` on the product.
- On product update in our DB (trigger or manual "Push to Zoho" button), update the matching Zoho item.

**Inbound (Zoho → M&H)** — pull stock & price changes back:
- Existing `pull_items` logic, rewritten to:
  - Only touch products with `brand_line = 'm_and_h_fashion'` and a known `zoho_item_id`.
  - Update stock per branch via `zoho_warehouse_mapping` → `inventory`.
  - Update price if it changed in Zoho.
  - **Never insert new products** from Zoho (M&H catalog is curated, not auto-grown).

**Guardrail**: add a DB check so `brand_line = 'soteria_medical'` rows can no longer be created — Soteria is fully retired from the catalog.

**Naming integrity**: since you've already cleaned M&H names, the outbound push will overwrite whatever exists in Zoho for those SKUs (our DB becomes the source of truth for names; Zoho stays the source of truth for stock movement).

### 3. Collapsible Zoho Sync History panel
On `/admin/products` (and wherever `ZohoSyncHistoryPanel` renders), wrap the panel in a shadcn `Collapsible`:
- Header row always visible: title "Zoho Sync History" + chevron + latest status pill (e.g. "Syncing… less than a minute ago").
- Body (the list of past sync runs) hidden by default; expands on click.
- Persist open/closed state in `localStorage` so it remembers your preference.

### Technical notes
- Files touched: `supabase/functions/zoho-sync/index.ts` (rewrite item mapping for `m_and_h_fashion`, add `push_items` action), `src/modules/admin/components/ZohoSyncHistoryPanel.tsx` (Collapsible wrapper), one migration (delete Soteria rows + add brand_line guard).
- No changes to storefront filtering — it already only shows `m_and_h_fashion`.
- Sync history rows themselves are preserved (audit log untouched).

### Order of execution after approval
1. Migration: nuke Soteria + add guard.
2. Edit `ZohoSyncHistoryPanel` to be collapsible.
3. Rewrite `zoho-sync` for two-way M&H flow + add admin "Push all to Zoho" button.
4. Trigger first outbound push, verify items appear in Zoho with correct names.
