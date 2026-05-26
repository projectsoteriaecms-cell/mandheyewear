## Goal
Populate product thumbnails now AND make the existing "Link Anchor Images" flow work — using the 48 bundled PNGs already in the repo.

## Approach

Extend the existing `seed-product-images` edge function with a new `target` option so a single Commit run does both jobs in one pass:

1. **Seed (current behavior)** — uploads to `product-images/seed/{SKU}-{timestamp}.{ext}` and sets `products.image_url` (or appends to `additional_images` when primary exists).
2. **Anchor (new behavior)** — also uploads the same bytes to the bucket **root** as `MH-XXX.{ext}` (the path `link-anchor-images` scans for), so the anchor-linking workflow can pick them up and lock them as VTO/AR source-of-truth.

UI: add a "Target" selector to `SeedImagesDialog` with three options — `Seed only`, `Anchor only`, `Both (recommended)`. Default = Both.

After Commit with `target=both` or `target=anchor`, automatically invoke `link-anchor-images` so the anchor records get linked in one click — no second button press needed.

## Files

- `supabase/functions/seed-product-images/index.ts` — accept `target: "seed" | "anchor" | "both"`; when anchor, also upload to bucket root at `{SKU}.{ext}` with upsert; include anchor upload results in response.
- `src/modules/products/hooks/useSeedImages.ts` — add `target` arg; after successful commit with anchor target, call `supabase.functions.invoke("link-anchor-images")` and return its result merged into the response.
- `src/modules/products/components/SeedImagesDialog.tsx` — add Target radio group; show anchor upload count + link-anchor result in the summary.

## Result

One click: thumbnails appear on storefront (seed), anchor images populated at bucket root, anchor records linked for VTO/AR. No service-role key, no Python.
