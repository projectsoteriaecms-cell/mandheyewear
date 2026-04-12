

## Product Nomenclature Cleanup for All Remaining Products

### The Problem

The screenshot shows a product named "Frame : CARTIER 2,600,000 FRAME BC6K01AH CT0344O 003 Rimless" — this is ugly and confusing for customers. After analyzing the database:

- **10,659 soteria_medical products** still have messy names
- **5,595** have prices embedded in the name (e.g., "120K", "15K", "2,600,000")
- **352** have category prefixes like "Frame :", "Drugs :", "ACCESSORIES :"
- **10,302** have no brand extracted (null or `[NEEDS_RESEARCH]`)
- Remaining ~212 M&H products not in the Excel also have the same issues

### What Will Be Built

#### 1. Name Cleanup Edge Function (`clean-product-names`)

A server-side function that applies systematic regex-based transformations to all product names:

**Rules derived from the cleaned Excel data pattern:**
- Strip category prefixes: `Frame :`, `ACCESSORIES :`, `Contact Lens :`, `Drugs :`, `Contact Lens Solution :`
- Strip embedded prices: remove patterns like `15K`, `120K`, `2,600,000`, `N105,000` from names
- Strip redundant words: remove "FRAME" when `item_type` is already `frames`
- Clean up extra whitespace and normalize casing to Title Case
- Extract brand name from the cleaned name (first word/known brand match)
- Store original name in `description_raw` for audit trail

**Example transformations:**
```text
"Frame : CARTIER 2,600,000 FRAME BC6K01AH CT0344O 003 Rimless"
  → "Cartier BC6K01AH CT0344O 003 Rimless"

"Frame :  15K FRAME CA1202 57 17-145 C3"
  → "CA1202 57-17-145 C3"

"ACCESSORIES :  10K BEIAGE MARBLE ROPE"
  → "Beige Marble Rope"

"Emporio Armani 120K Ea 3038 5063"
  → "Emporio Armani EA 3038 5063"
```

#### 2. Brand Extraction

Using a known-brands list (Cartier, Gucci, Ray-Ban, Oakley, Vogue, Polaroid, Emporio Armani, Prada, etc.), automatically populate the `brand` column from the cleaned name.

#### 3. Admin UI: Cleanup Preview + Confirm

Add a "Clean Names" action in the admin Products toolbar that:
- Shows a before/after preview table of affected products
- Lets admin filter by brand_line (soteria_medical, m_and_h_fashion, or all)
- Confirm button triggers the edge function
- Option to push cleaned names to Zoho after

#### 4. Zoho Sync for Cleaned Names

After DB cleanup, trigger the existing `push_updates` action on the zoho-sync function to update product names in Zoho Books for all products that have a `zoho_item_id`.

### Files to Create
- `supabase/functions/clean-product-names/index.ts` — regex-based name cleanup + brand extraction
- `src/modules/products/components/NameCleanupDialog.tsx` — preview + confirm UI

### Files to Modify
- `src/pages/admin/products/ProductsToolbar.tsx` — add "Clean Names" button
- `src/pages/admin/Products.tsx` — wire up the dialog

### Database Changes
- None — uses existing `name`, `brand`, `description_raw` columns

### Processing Approach
- Process in batches of 100 server-side
- Preserve `image_url`, `additional_images`, `price`, `sku` — only touch `name`, `brand`, `description_raw`
- Log results to `import_history` with `import_type = 'name_cleanup'`
- Fire-and-forget Zoho push after completion

