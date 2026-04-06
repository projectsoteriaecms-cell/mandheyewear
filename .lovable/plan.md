

## Fix M&H → Zoho Product Mapping for Order Push Testing

### The Problem
The current sync uses exact name matching to link ECMS products to Zoho items. ECMS and Zoho use completely different naming conventions, so only 1 of 837 M&H products matched automatically. Without `zoho_item_id` on M&H products, the `push_order` action will always fail with "No items with Zoho mapping found."

### Approach: AI-Assisted Fuzzy Matching

Instead of requiring exact names, we'll add a smarter matching strategy that uses multiple signals:

**Step 1 — Add SKU-based matching to the sync**
Update `processPage()` in `zoho-sync/index.ts` to also match by SKU (not just name). If a Zoho item's SKU matches an ECMS product's SKU, link them.

**Step 2 — Add fuzzy name matching**
Strip common prefixes/suffixes (like "Frame :", "ACCESSORIES :", price tags like "25K", "105K") and compare the core product identifier. Use token-based overlap scoring:
- Extract brand name, model code, and dimensions from both naming formats
- Score matches based on shared tokens (e.g., "Polaroid", "PLD D482", "086", "145")
- Auto-link if confidence > 80%, flag for manual review if 50-80%

**Step 3 — Bulk manual linking tool**
Enhance the existing "Link to Zoho" dialog to support:
- Side-by-side fuzzy search (search ECMS products, see suggested Zoho matches)
- Bulk link mode for faster processing
- Show match confidence scores

**Step 4 — Quick test with manual link**
For immediate testing, manually link 2-3 M&H products to their Zoho item IDs using the existing `link_product` action, then run a test order with those products.

### Technical Details

**File: `supabase/functions/zoho-sync/index.ts`**
- In `processPage()`, after name-based matching, add a second pass matching by SKU
- Add a `fuzzyMatch()` function that tokenizes names and scores overlap
- Products with score > 0.8 get auto-linked; 0.5-0.8 get flagged in metadata

**File: `src/modules/products/components/LinkToZohoDialog.tsx`**
- Add fuzzy search: when selecting an ECMS product, auto-suggest the top 3 Zoho matches by token similarity
- Add bulk mode: select multiple pairs and link all at once

**File: New helper** — `supabase/functions/zoho-sync/matching.ts` (inline in index.ts since no subfolder imports)
- Token extraction: strip "Frame :", price tags, normalize spacing
- Scoring: Jaccard similarity on token sets

### Files Modified
1. `supabase/functions/zoho-sync/index.ts` — Add SKU matching + fuzzy name matching
2. `src/modules/products/components/LinkToZohoDialog.tsx` — Add fuzzy suggestions + bulk mode
3. For immediate testing: manually link 2-3 products via edge function call

