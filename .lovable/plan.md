

# Run Full Product Name Cleanup

## Problem
The database still contains 4,138 products with embedded prices, 804 with category prefixes, and 9,388 with no brand extracted. The `clean-product-names` edge function exists but hasn't been executed at scale.

## Plan

### 1. Review the `clean-product-names` edge function
Read the current function to confirm its cleaning logic covers:
- Stripping category prefixes ("Frame :", "Lens :", "Accessories :", etc.)
- Removing embedded prices ("120K", "55K", "2K5")
- Extracting brand names from the product name string
- Handling both `m_and_h_fashion` and `soteria_medical` lines

### 2. Run the cleanup via the NameCleanupDialog
The admin UI already has a **NameCleanupDialog** component that calls the edge function in preview → execute mode. The recommended approach:
- Open the admin Products page
- Use the Name Cleanup tool (already wired in the toolbar)
- Preview changes for `m_and_h_fashion` first (837 products — your storefront)
- Execute, then repeat for `soteria_medical` (10,659 products)
- Optionally push cleaned names to Zoho Books

### 3. If the edge function has bugs or gaps
- Fix any regex or parsing issues found during preview
- Re-deploy the edge function
- Re-run cleanup

### Technical Details
- **File to review**: `supabase/functions/clean-product-names/index.ts`
- **UI entry point**: NameCleanupDialog (already in Products toolbar)
- **Scope**: 11,496 active products across both brand lines
- No schema changes needed — this is a data operation using the existing edge function

