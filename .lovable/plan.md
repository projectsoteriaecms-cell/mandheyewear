## Understanding
You're confirming the operating model for Soteria (M&H Medical) inventory:

- The `products` table (where `brand_line = 'soteria_medical'`) is **not** manually curated.
- It's a **mirror** of Zoho Books — Zoho is the single source of truth.
- We just cleared it (0 Soteria rows) so the next Zoho sync will rehydrate it cleanly.

## What's already in place (no build needed)
- `zoho-sync` edge function exists and maps every Zoho item → `products` row with `brand_line: 'soteria_medical'` (line 50 of `supabase/functions/zoho-sync/index.ts`).
- Stock per branch flows into `inventory` via `zoho_warehouse_mapping`.
- Admin UI to trigger/monitor sync already exists:
  - `src/pages/admin/Inventory.tsx`
  - `src/modules/products/components/ZohoSyncHistoryPanel.tsx`
  - `src/modules/integrations/hooks/useZohoSync.ts`
  - `src/pages/admin/inventory/ReconciliationCard.tsx`

## Operating contract going forward
- **Soteria catalog**: pulled from Zoho via `zoho-sync`. Never insert/edit Soteria products by hand.
- **M&H Eyewear catalog** (`m_and_h_fashion`): curated manually (the 162 frames we just inserted). Not synced from Zoho.
- Filter rules from memory still apply: skip `[NEEDS_RESEARCH]` and ₦0 items at the storefront layer.

## Next action options
Pick one — none require code changes:

1. **Trigger a fresh full Zoho sync now** — I run the `zoho-sync` edge function so the Soteria catalog repopulates from scratch (cleanest baseline).
2. **Wait** — let it sync on the next scheduled/manual run from the Admin → Inventory page.
3. **Add a guard** (optional, small code change) — a DB trigger that blocks manual inserts into `products` where `brand_line = 'soteria_medical'` unless they come from the sync function, to enforce "Zoho only" by contract.

Which one do you want?
