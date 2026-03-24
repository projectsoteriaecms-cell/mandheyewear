

## Verification Summary: What's Working vs. What's Not

### What's Already Correctly Implemented
All four files from the plan are correctly updated:
- **Brand classification** with known/house brand detection and reference minimums
- **Unified prompt builder** with context-aware reference and brand logic
- **Edge function** with PDCA gate enforcing references for all brands
- **QuickImageUploadModal** with the full 4-step PDCA flow (Plan → Check → Do → Act)

### The Problem
There are **two separate dialogs** for image generation:

1. **QuickImageUploadModal** — opened when you click a single product card. This HAS the full PDCA workflow (upload reference → review/edit prompts → generate shot-by-shot → review gallery). This is working correctly.

2. **GenerateImagesDialog** — opened via the "Generate Missing Images" button at the top of the page (your screenshot). This is the OLD bulk dialog that picks a category, sets a batch limit, and fires off generation without any PDCA guidance, prompt review, or reference checking on the client side.

### What Needs to Change

The **GenerateImagesDialog** (bulk) should NOT be the primary generation path anymore. Since the PDCA workflow requires per-product reference uploads and prompt review, bulk blind generation contradicts the quality-first approach.

**Option A — Recommended:** Remove or disable the "Generate Missing Images" bulk button entirely. The correct workflow is: filter products → click one → go through PDCA steps. This ensures every product gets proper reference photos and prompt review.

**Option B — Keep bulk but gate it:** Keep the bulk dialog but only allow it to process products that already have enough reference photos (the edge function already skips those without refs). Add a warning that bulk mode skips prompt review.

### Technical Changes

**File: `src/pages/admin/ProductImages.tsx`**
- Remove or conditionally hide the "Generate Missing Images" button at the top
- Optionally replace it with a message: "Click any product to start the guided generation workflow"

**File: `src/modules/products/components/GenerateImagesDialog.tsx`**
- If keeping (Option B): Add a prominent warning that bulk mode does not allow prompt review and will skip products without sufficient references
- If removing (Option A): No changes needed, just stop rendering it

### Files Modified
1. `src/pages/admin/ProductImages.tsx` — Remove/modify bulk generate button
2. `src/modules/products/components/GenerateImagesDialog.tsx` — Add PDCA warning (if keeping)

