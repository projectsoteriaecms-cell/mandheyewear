

## Remove Packaging Shots & Fix Primary Images for All Known-Brand Products

### The Problem
27 known-brand products still have AI-generated images as their primary `image_url`, and 68 known-brand products have packaging/casing shots (the last image in `additional_images`) that may show incorrect "M&H Opticals" branding. The frontend `getDisplayImages` utility helps reorder on display, but the underlying data is still wrong.

### What We'll Do (One-Time Bulk Data Fix)

**Step 1: Remove the packaging shot (last image) from all 68 known-brand products with full galleries**
- For each product with 5+ additional images, remove the last entry from `additional_images` (the packaging/casing shot)
- This eliminates the M&H-branded casing image entirely

**Step 2: Fix the 27 products where `image_url` is still an AI-generated image**
- Find the original upload (`/main.` URL) in `additional_images`
- Swap it into `image_url`
- Move the old AI `image_url` into `additional_images` where `/main.` was

**Step 3: Delete the packaging image files from storage**
- Remove the actual files from the `product-images` bucket so they don't linger

### Implementation
All done via a single edge function call or SQL operations — no manual per-product work needed.

**Files Modified:**
1. `supabase/functions/zoho-sync/index.ts` — Add a `fix_brand_images` action that:
   - Queries all 68 known-brand products with full galleries
   - Removes the last `additional_images` entry (packaging shot)
   - Swaps `image_url` to the original `/main.*` photo where needed
   - Deletes the removed image files from storage
2. No frontend changes needed — `getDisplayImages` already handles ordering correctly as a safeguard

### Scope
- 68 products affected (known brands with 5+ additional images)
- 27 of those also need `image_url` swapped back to the original photo
- Fully reversible if needed (images stay in storage until explicitly deleted)
- One-click execution from admin or direct edge function call

