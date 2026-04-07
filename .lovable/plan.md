

## Fix Known Brand Packaging Images (Remove M&H Branding)

### The Problem

Around 40+ known brand products (Gucci, Polaroid, Ray-Ban, Tommy Hilfiger, etc.) have AI-generated packaging shots that incorrectly show "M&H Opticals" on the leather case. The prompt logic in the code is already correct — known brands get their own brand name on the case. The issue is that these images were likely generated before the brand classification was properly wired, or the AI ignored the prompt. The fix requires **regenerating the packaging shot** for all affected products.

### What We'll Build

**1. Bulk packaging regeneration tool**
Add a "Fix Brand Packaging" action on the Admin Products page (or Image Manager) that:
- Finds all known-brand products with 5+ generated images (full gallery)
- Regenerates ONLY the packaging shot (slot 6 / last image in `additional_images`) using the correct brand-specific prompt
- Runs sequentially to avoid rate limits, showing progress

**2. How it works**
For each affected product:
- Call the existing `generate-product-image` edge function with just the `packaging` shot slug
- Use the product's first image as the reference photo
- Replace the last image in `additional_images` with the new one

### Technical Details

**File: `supabase/functions/generate-product-image/index.ts`**
- Add a new action `regenerate_shot` that accepts a product ID and a specific shot slug (e.g., `packaging`)
- Generates only that one shot and replaces it in the correct position in `additional_images`

**File: `src/modules/products/components/BulkPackagingFixButton.tsx`** (new)
- Button component that queries known-brand products with full galleries
- Calls the edge function for each, showing a progress bar
- Logs results (success/fail per product)

**File: `src/pages/admin/Products.tsx`**
- Add the bulk fix button to the toolbar (visible to admins only)

### Scope
- ~40 known-brand products need their packaging shot regenerated
- Each regeneration takes ~10-15 seconds
- Total runtime: ~7-10 minutes with sequential processing
- No changes needed to the prompt logic (already correct)

