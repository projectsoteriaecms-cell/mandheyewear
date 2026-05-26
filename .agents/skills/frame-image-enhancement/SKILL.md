---
name: frame-image-enhancement
description: Enhance M&H eyewear product photos to Warby Parker–grade catalog quality without losing frame detail, brand markings, or material texture. Use when the user asks to upgrade, clean up, re-render, polish, or re-shoot frame images in this project (admin/products/images, generate-product-image edge function, bundled MH-XXX anchors, or local frame_images/ pipeline).
---

# Frame Image Enhancement

This project ships eyewear photos through two surfaces:

1. **Local Python pipeline** — `process_frames.py` (HEIC → PNG → background removal → enhance).
2. **AI re-render pipeline** — `supabase/functions/generate-product-image/index.ts` uses the bundled MH-XXX anchor as a **reference image** and re-renders 6 catalog shots via Gemini.

The user's recurring complaint: enhanced/generated images look "not professional" — washed-out, plasticky, blown highlights, lost engraving, wrong color, or generic "AI eyewear" that no longer matches the actual frame.

## Non-negotiables (detail preservation)

When enhancing or re-rendering, you must NOT alter:

- **Frame silhouette and proportions** — temple length, bridge width, lens shape, rim thickness. Use the anchor MH-XXX.jpg/png as the geometric ground truth.
- **Brand engravings and logos** — every brand in `LUXURY_BRANDS` (see `generate-product-image/index.ts`) must keep its temple/bridge logo readable. Never let the model "clean up" or omit it.
- **Material texture** — acetate grain, metal brushing, wood, tortoise pattern, marbling. These define perceived value.
- **Exact color and finish** — matte vs glossy, gradient acetate, two-tone temples. Use color words from `product.color` and any `frame_attributes`.
- **Hinge, screws, nose pads** — visible hardware must remain, not be smoothed away.

If the model can't preserve these from a single anchor, **request more reference photos** (front + 3/4 + side) rather than guess.

## Studio look (Warby Parker / Cubitts / Persol grade)

The agreed visual contract — keep prompts aligned with this:

- Seamless pure white `#FFFFFF` background, no gradient/vignette/texture.
- Soft overhead diffused light, neutral 5500K white balance.
- Single soft realistic contact shadow directly under the frame (not a hard drop shadow, not a cutout halo).
- Clear non-reflective lenses (tinted only when the frame is sunglasses or the tinted variant shot).
- Frame centered, ~70% canvas width, generous white margin.
- Tack-sharp focus edge-to-edge — no bokeh, no DOF blur.
- No models, hands, props, packaging, cases, text, watermarks.
- Square 1:1, ultra-high resolution.

## The 6-shot gallery (current spec)

The generator produces these slugs per product. Keep this set unless the user asks otherwise:

1. `hero` — 3/4 front, ~25° rotation, both temples visible, near temple sharp.
2. `front` — dead-on front, perfectly symmetric.
3. `angle` — opposite 3/4 to hero.
4. `side` — pure profile, full temple visible.
5. `top` — top-down folded view, shows bridge + temple curvature.
6. `tinted` — 3/4 with 10–15% grey tinted lenses (matches user's 4th reference photo).

Earlier `packaging` shot was removed — do not re-add it without asking.

## Workflow for "enhance these frames"

1. **Check the anchor.** Confirm a bundled `MH-XXX.{jpg,png}` exists at the storage bucket root (anchor surface). If missing, run the `link-anchor-images` flow or upload via the Seed Images dialog with `target: "both"`.
2. **Inspect the current output.** Use `code--view` on a sample generated image and `image_tools--zoom_image` on the temple/logo area to confirm what's actually being lost.
3. **Adjust the prompt, not the model.** Edit `buildFramePrompts` in `supabase/functions/generate-product-image/index.ts`. Tighten studio rules, add explicit "preserve engraving / preserve acetate grain / do not alter silhouette" clauses. Do not switch model unless quota forces it (project uses Gemini 2.5 Flash Image / Nano Banana per memory).
4. **Re-run on a single SKU first.** Use Admin → Products → Images → "Generate AI Images" on one product. QA the 6 outputs before bulk re-running.
5. **QA checklist before declaring done:**
   - Logo on temple still readable at 100% zoom.
   - Color matches anchor (sample a pixel if unsure).
   - Shadow is a soft contact shadow, not a hard cutout.
   - No lens reflections, no fake catchlights.
   - Frame silhouette matches anchor outline.
6. **Bulk re-run only after one SKU passes QA.**

## When to use the local Python pipeline instead

Use `process_frames.py` (not AI re-render) when:
- The original HEIC/JPG is already studio-grade and only needs background removal + subtle enhancement.
- The user wants to preserve the *exact* original photograph (no generative changes).
- Brand engravings are intricate enough that any re-render risks losing them.

`SHARPNESS=1.4 / CONTRAST=1.15 / BRIGHTNESS=1.05` are the agreed conservative enhancement factors. Do not raise them — higher values blow out acetate highlights and crush logo details.

## Files to know

- `supabase/functions/generate-product-image/index.ts` — prompt builder, studio rules, 6-shot spec.
- `supabase/functions/seed-product-images/index.ts` — uploads anchor + seed images (`target: "seed" | "anchor" | "both"`).
- `supabase/functions/link-anchor-images/index.ts` — links bucket-root MH-XXX files as anchor source-of-truth.
- `src/modules/products/components/SeedImagesDialog.tsx` — admin UI entry point.
- `process_frames.py` — local bg removal + enhancement (rembg `u2netp` default).
- Memory: `mem://features/anchor-image-workflow`, `mem://commerce/product-image-integrity`, `mem://features/ai-image-generation-workflow`.

## Anti-patterns (rejected before)

- Generating images without an anchor reference → produces generic "AI glasses", silhouette drifts. Always require reference.
- Adding leather cases / props / models to "make it premium" → explicitly removed.
- Raising sharpness/contrast > current values to "make it pop" → destroys luxury frame texture.
- Replacing Gemini with a different image model without checking the Google quota memory.
- Re-rendering all 50+ frames before QA-ing one. Always single-SKU first.
