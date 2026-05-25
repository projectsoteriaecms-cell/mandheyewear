## Goal

Add a one-click **"Seed Descriptions"** flow to the admin Products page that pushes the bundled frame copy (`frame_descriptions.json` + `frame_data.json`) into `products` and `frame_attributes` — with a dry-run preview before commit, and an optional file upload override. No service_role key needed; everything runs inside Lovable with existing admin auth + RLS.

## UX flow

1. Admin clicks **Seed Descriptions** in the Products toolbar.
2. Dialog opens with:
   - Source selector: **Bundled JSON** (default) or **Upload file** (.json or .csv).
   - "Skip rows where description/tagline already filled" toggle (default on).
   - **Analyze** button → runs dry-run.
3. Dry-run results panel shows a per-SKU diff table:
   - SKU · matched product? · fields that would change (tagline, description, lens_height, pd_range, rx_sph, progressive_compatible, size_label, best_for_faces, best_for_occasions, frame_shape, frame_material, lens_width, bridge_size, temple_length).
   - Summary: X matched · Y unmatched SKUs · Z would change · W skipped (already filled).
4. **Commit changes** button (disabled until dry-run completes) writes to DB and shows a final report.

## SKU → field mapping

From `frame_descriptions.json` (rich copy):
- `headline` → `products.tagline`
- `short_description` + `bullets` (rendered as HTML `<p>` + `<ul>`) → `products.description` (and `description_html` mirror)
- `specs.lens_height` → `frame_attributes.lens_height` (parse "46 mm" → 46)
- `specs.total_frame_width` → `frame_attributes.total_width`
- `fit.size` → `frame_attributes.size_label`
- `fit.pd_range` → split into `pd_range_min` / `pd_range_max`
- `fit.rx_range` → parse "-8.00 to +6.00" → `rx_sph_min` / `rx_sph_max`
- `fit.progressive` ("Yes"/"No") → `progressive_compatible`
- `fit.frame_shape` → `frame_shape`, `fit.frame_material` → `frame_material`
- `style_guide.face_shapes` → `best_for_faces`
- `style_guide.occasions` → `best_for_occasions`

From `frame_data.json` (structured fallback) — used when description JSON is missing a field:
- `lens_width`, `bridge_width`, `temple_length` → corresponding `frame_attributes` columns.

Matching: by `products.sku` (e.g. `MH-471`).

## Architecture

**Edge function `seed-product-descriptions`** (one function, two modes):
- Input: `{ mode: "dry_run" | "commit", source: "bundled" | "upload", payload?: <parsed records>, skipFilled: boolean }`.
- Verifies caller is `admin` or `super_admin` via JWT + `has_role` RPC (RLS already permits admins to write `products` and `frame_attributes`, so we use the user's JWT — no service_role).
- When `source: "bundled"`, reads the JSON files committed into the function's own folder (we copy `frame_descriptions.json` and `frame_data.json` into `supabase/functions/seed-product-descriptions/` at deploy time).
- Builds a normalized list of `{ sku, productPatch, framePatch }`.
- Fetches all candidate products in one query (`select id, sku, description, tagline from products where sku in (...)`).
- Dry-run: returns the diff. Commit: runs `upsert` on `frame_attributes` (by product_id) and `update` on `products`. Returns summary.

**Frontend**
- New file `src/modules/products/components/SeedDescriptionsDialog.tsx` (dialog + diff table).
- New hook `src/modules/products/hooks/useSeedDescriptions.ts` (wraps `supabase.functions.invoke`).
- Wire into `ProductsToolbar` as a new admin-only button beside **Enrich Metadata**.

## Files to add / change

- `supabase/functions/seed-product-descriptions/index.ts` (new)
- `supabase/functions/seed-product-descriptions/frame_descriptions.json` (copy of repo file)
- `supabase/functions/seed-product-descriptions/frame_data.json` (copy of repo file)
- `src/modules/products/components/SeedDescriptionsDialog.tsx` (new)
- `src/modules/products/hooks/useSeedDescriptions.ts` (new)
- `src/modules/products/components/index.ts` (export)
- `src/pages/admin/products/ProductsToolbar.tsx` (add button + prop)
- `src/pages/admin/Products.tsx` (state + dialog mount)

No DB migration needed — all target columns already exist from the previous migration.

## Security

- Function calls `supabase.auth.getUser()` on the incoming JWT and rejects non-admins with 403.
- DB writes use the user's JWT (not service_role), so existing RLS ("Admins can manage products", "Managers can manage frame attributes") remains the enforcement layer.
- Uploaded files are parsed in-memory only; never written to storage.

## Out of scope (can follow later)

- Image uploads (you're handling those manually in the storage bucket).
- Auto-categorization / brand inference — leaves existing values untouched.
- Re-running enrichment AI — this is a pure copy push.