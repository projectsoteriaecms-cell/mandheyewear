

## Require Reference Image for ALL Products & Make Prompts Flexible

### Problem
Currently, known brands can generate images from text alone (no reference photo). This produces inaccurate results even for known brands because the AI guesses the frame design. Additionally, the prompt templates are rigid — the same structure is used regardless of product context.

### What Changes

**1. Universal reference photo requirement**

ALL products (known brands AND house brands) must have at least 1 reference image uploaded before AI generation is allowed. The system will always use image-to-image editing, never text-to-image alone.

- `MIN_REFERENCE_PHOTOS` stays at `2` for house brands
- New constant: `MIN_REFERENCE_PHOTOS_KNOWN = 1` for known brands
- The `isHouseBrandBlocked` check in the UI will be expanded to also block known brands with 0 images
- The edge function's PDCA gate will require at least 1 reference for known brands too

**2. Flexible, context-aware prompts**

The prompt builders will be refactored to adapt based on:
- Whether the product is a known brand vs house brand (brand-specific instructions differ)
- Whether a reference image exists (reference mode always on, but prompt phrasing adjusts)
- Product metadata richness (if color/material/shape are available, use them; if not, rely more heavily on the reference image instruction)

The `buildReferenceFramePrompts()` function will become the **primary** prompt builder since references are now mandatory. The text-only `buildFramePrompts()` will be kept as a fallback but never used in the normal flow.

For known brands with references, prompts will say: *"This is a reference photo of the actual [brand] [model]. Preserve the exact design. Maintain brand logos and engravings..."*

For house brands with references, prompts will say: *"This is a reference photo of the actual [name] frame. Preserve the exact color, shape, material. Use M&H Opticals branding on packaging..."*

### Technical Changes

**File 1: `src/modules/products/lib/brand-classification.ts`**
- Add `MIN_REFERENCE_PHOTOS_KNOWN = 1`
- Update `getImageReadiness()` to return `needs_photos_0` for known brands with 0 images (currently returns `ready_ai`)
- New status: known brands with 0 images show "Needs Reference (0/1)" instead of "Ready for AI"

**File 2: `src/modules/products/lib/prompt-builders.ts`**
- Merge `buildFramePrompts` and `buildReferenceFramePrompts` into a single `buildFramePrompts(product, options)` that accepts `{ hasReference: boolean, isKnownBrand: boolean }`
- When `hasReference` is true (always in normal flow): use reference-preserving language plus brand-specific instructions
- Known brand + reference: include brand logo preservation notes
- House brand + reference: include "M&H Opticals" packaging branding
- Make the packaging shot prompt context-aware: use actual brand name for known brands, "M&H Opticals" for house brands

**File 3: `supabase/functions/generate-product-image/index.ts`**
- Update PDCA gate: known brands also need at least 1 reference image
- Error message for known brands: "Upload at least 1 reference photo for accurate generation"
- Remove the text-only generation path from the main flow (keep `generateImage` function for non-frame products)
- Mirror the prompt builder changes (the edge function has its own copy)

**File 4: `src/modules/products/components/QuickImageUploadModal.tsx`**
- Update blocking logic: block AI generation for ALL products with 0 images, not just house brands
- Known brands with 0 images: show "Upload at least 1 reference photo" message
- House brands with < 2 images: keep existing "Upload at least 2 reference photos" message
- Update button label: always show "Generate from Reference" when images exist

### Files Modified
1. `src/modules/products/lib/brand-classification.ts` — Add known brand minimum, update readiness logic
2. `src/modules/products/lib/prompt-builders.ts` — Unified context-aware prompt builder
3. `supabase/functions/generate-product-image/index.ts` — Universal reference gate, flexible prompts
4. `src/modules/products/components/QuickImageUploadModal.tsx` — Block all products without references

