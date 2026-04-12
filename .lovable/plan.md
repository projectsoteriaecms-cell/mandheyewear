

## Fix Cleanup Logic + Execute Preview + Generate Reference Sheet

### Issues Found in Preview

The current regex cleanup has gaps:
1. Names like `"15K Frame"` become just `"15K Frame"` instead of being emptied (edge case where entire name is a price+generic word)
2. Duplicate text patterns like `"15K Kids Frames 15K Kids Frames"` produce `"Kids Kids"`
3. Brand extraction is too conservative — only 5-10% of products get a brand match

### Plan

#### 1. Fix the `clean-product-names` edge function
- Improve price stripping: handle `15K` at start of name followed by generic words
- Add deduplication logic: detect repeated substrings and collapse them
- Expand brand matching: add more brands common in the Soteria catalog (Alex Barkey, John Richmond, etc.) and improve fuzzy matching
- Handle edge case where cleaned name becomes empty or just "Frame" — fall back to SKU or original

#### 2. Execute the cleanup (DB only, no Zoho push)
- Run with `action: "execute"`, `push_to_zoho: false`
- This updates `name`, `brand`, and saves originals to `description_raw`

#### 3. Generate Before/After Reference Sheet
- Query the database for all products where `description_raw IS NOT NULL` (meaning they were cleaned)
- Create an Excel file with columns: SKU, Original Name, New Name, Brand, Price, Item Type
- Sort by brand line, then brand, then name
- Save to `/mnt/documents/` for download
- This sheet can be shared with Zoho/inventory staff so they know the new naming convention

### Files to Modify
- `supabase/functions/clean-product-names/index.ts` — fix regex gaps, expand brand list, add dedup logic

### Files to Create
- None (reference sheet generated via script)

### No Zoho push in this step — that comes after you review the reference sheet.

