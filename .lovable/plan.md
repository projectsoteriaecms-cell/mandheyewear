# Extend Seed Descriptions: Images + Editable Copy

Build on the existing one-click "Seed Descriptions" admin flow (Products page) by adding two capabilities:

1. **Seed Images** — bulk-upload bundled frame photos to the `product-images` bucket and wire them onto products.
2. **Editable copy in dry-run** — let admins tweak each SKU's tagline/description/specs in the preview table before committing.

Same auth model as today: admin/super_admin only, RLS-enforced, no service_role key.

---

## 1. Seed Images

**Source.** 67 files already committed at repo root `frame_images/MH-<SKU>.{jpg,png}`. Same "Bundled / Upload" choice as the descriptions flow — upload mode accepts a multi-file picker so admins can drop a fresh batch from disk without committing them to the repo.

**New edge function: `seed-product-images`**
- Modes: `dry_run` (per-SKU plan: which products match, which already have a primary image, file size/extension) and `commit`.
- For `bundled`, the function reads `frame_images/*` shipped alongside `index.ts` (same pattern as the JSON files in `seed-product-descriptions`).
- For `upload`, the dialog converts each file to base64 and sends `{ sku, filename, contentType, dataBase64 }[]` in the request body.
- For each file:
  - Derive SKU from filename (`MH-1234.jpg` → `MH-1234`), match against `products.sku`.
  - Upload to `product-images/seed/<sku>.<ext>` using the user's JWT (existing bucket RLS already allows admin writes).
  - Get the public URL and update `products`:
    - If `image_url` is empty OR `skipFilled = false` → set `image_url`.
    - Otherwise append to `additional_images` (de-duped) so we never silently overwrite a curated hero shot.
- Return `{ matched, wouldUpload, skipped, unmatched, uploads: [{ sku, url, action }], errors }`.

**UI: new "Seed Images" button next to "Seed Descriptions"**
- Opens `SeedImagesDialog.tsx` (mirrors the descriptions dialog: source selector, skip-filled toggle, Analyze → Commit, per-SKU result table with thumbnails).
- On commit success, invalidate `admin-products`, `products`, and `product-image-stats` queries.

No new tables. No migration. Existing `product-images` bucket is reused.

---

## 2. Editable copy in dry-run

Make the descriptions dry-run preview act like a mini spreadsheet so admins can adjust seed text per SKU before committing.

**Changes to `SeedDescriptionsDialog.tsx`**
- After dry-run returns, store `changes` in local state as an editable map keyed by SKU.
- Replace the read-only `<table>` rows with inline editors:
  - `tagline` → single-line `<Input>`
  - `description_html` → `<Textarea>` (3 rows, monospace)
  - Frame numeric fields (`lens_height`, `total_width`, `pd_range_min/max`, `rx_sph_min/max`) → small number inputs in a compact grid
  - Boolean (`progressive_compatible`) → `<Switch>`
  - Text fields (`size_label`, `best_for_faces`, `best_for_occasions`, `frame_shape`, `frame_material`) → `<Input>`
- Add a per-row "Skip this SKU" checkbox.
- "Commit changes" now sends the edited array back as `overrides` instead of re-reading from source.

**Edge function `seed-product-descriptions` — add `overrides` mode**
- New optional `overrides: Array<{ sku, productPatch, framePatch, skip? }>` on the commit request.
- When present, skip the bundled/upload resolution entirely and use overrides directly. `skipFilled` still respected on the server.
- Existing dry-run path is unchanged.

---

## Files

**New**
- `supabase/functions/seed-product-images/index.ts`
- `supabase/functions/seed-product-images/frame_images/MH-*.{jpg,png}` (copied from repo `frame_images/`)
- `src/modules/products/components/SeedImagesDialog.tsx`
- `src/modules/products/hooks/useSeedImages.ts`

**Edited**
- `src/modules/products/components/SeedDescriptionsDialog.tsx` — editable rows, overrides payload
- `src/modules/products/hooks/useSeedDescriptions.ts` — add `overrides` to the request type
- `supabase/functions/seed-product-descriptions/index.ts` — honor `overrides`
- `src/modules/products/components/index.ts`, `hooks/index.ts` — exports
- `src/pages/admin/Products.tsx` — mount second dialog
- `src/pages/admin/products/ProductsToolbar.tsx` — add "Seed Images" button

---

## Out of scope

- Auto-generating images with AI (already handled in the PDCA flow).
- Per-image cropping/resizing in the browser.
- Touching `frame_attributes` schema or RLS — everything fits the existing columns.

Approve and I'll build it.