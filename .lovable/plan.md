

## The Real Problem: Rendering Quality, Not Tracking

The MediaPipe face tracking is working correctly — landmarks, transformation matrix, blendshapes all functioning. The issue is that `ParametricGlasses3D.tsx` creates **procedural geometry** (extruded rectangles/ovals with tube temples). These will never look like real frames.

### Option Comparison

```text
┌─────────────────────────┬──────────────┬─────────────┬──────────────┐
│ Approach                │ Visual Quality│ Per-Product │ Effort       │
│                         │              │ Work        │              │
├─────────────────────────┼──────────────┼─────────────┼──────────────┤
│ A. Enhanced 2D Overlay  │ ★★★★☆        │ None        │ Medium       │
│    (AI-segmented images)│ (photo-real) │ (automated) │ (1-2 days)   │
├─────────────────────────┼──────────────┼─────────────┼──────────────┤
│ B. 3D Model Files       │ ★★★★★        │ High        │ Very High    │
│    (.glb per product)   │ (best)       │ ($5-50 each)│ (months)     │
├─────────────────────────┼──────────────┼─────────────┼──────────────┤
│ C. Better Parametric    │ ★★★☆☆        │ None        │ Medium       │
│    (PBR materials, etc) │ (still fake) │             │ (1-2 days)   │
├─────────────────────────┼──────────────┼─────────────┼──────────────┤
│ D. Third-Party SDK      │ ★★★★★        │ Varies      │ High         │
│    (Banuba, Designhubz) │ (pro-grade)  │ ($$$/month) │ (weeks)      │
└─────────────────────────┴──────────────┴─────────────┴──────────────┘
```

### Recommended: Option A — Enhanced 2D Overlay with AI Segmentation

This is what **Warby Parker, Zenni, and most successful try-on platforms actually use** — 2D product images, properly segmented and overlaid with perspective transforms. The key is having **clean, front-facing frame images with transparent backgrounds**.

**What we'd build:**

1. **AI Frame Segmentation Edge Function** — Takes each product's catalog image, uses an AI model to extract just the frame (no case, no background, no packaging), outputs a clean PNG with transparency. Stores the result as `ar_overlay_url` in `frame_attributes`.

2. **Improved 2D Overlay Renderer** — The current 2D path already handles perspective (yaw scaling via cos), position tracking, and smoothing. We enhance it with:
   - Better aspect ratio handling from the segmented images
   - Lens tint overlay (semi-transparent colored fill matching product color)
   - Subtle shadow beneath the frame for realism

3. **Batch Process All Products** — Run the segmentation on all ~10,800 products that have images. No manual work per product — fully automated.

**Result**: Every product with an image becomes try-on ready (not just 101). The overlay looks like the actual product because it IS the actual product image.

### What Changes

| File | Change |
|------|--------|
| New edge function `segment-frame-image` | AI-powered background removal + frame extraction |
| `frame_attributes` table | Add `ar_overlay_url` column for segmented images |
| `FaceMeshCanvas.tsx` | Use `ar_overlay_url` when available, improve overlay rendering |
| `LiveARTryOn.tsx` | Remove 3D-only filter, show all products with AR overlays |
| `ParametricGlasses3D.tsx` | Keep as fallback only for products without images |

### Why Not 3D Models?

Real .glb files per frame would look amazing but require either:
- A 3D artist modeling each of 10,800+ frames ($50K-500K)
- AI 3D reconstruction (emerging tech, not production-ready for eyewear)
- Manufacturer-provided CAD files (most don't share these)

### Why Not Third-Party SDKs?

Banuba, Designhubz, FittingBox etc. offer turnkey solutions but cost $500-5,000/month and still require per-product setup. They're viable long-term but the 2D overlay approach gets us 90% of the way for free.

