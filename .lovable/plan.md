

## True 3D Frame Try-On: What It Takes and What We Can Do Now

### Current State (the honest picture)

Your Live AR currently works like this: MediaPipe detects 468 face landmarks in 2D, then a flat product image is stretched and rotated to sit on the face. This is fundamentally a **2D sticker on a 2D video** -- no matter how much we tune the smoothing and depth math, it will never feel like real glasses because:

- The frame doesn't wrap around the head when you turn
- Temples (arms) don't extend toward the ears
- There's no depth/perspective -- the frame is always a flat cutout
- Lens reflections and shadows don't change with lighting

### What True 3D Requires

To get glasses that actually "grip" the face and follow head rotation in 3D, you need **two things**:

1. **A 3D model of each frame** (.glb or .gltf file) -- not a flat image
2. **A 3D rendering engine** in the browser to position that model on the face using the transformation matrix

### Your Data Reality

| Metric | Count |
|--------|-------|
| Total frame products | 10,930 |
| With images (try-on eligible) | 351 |
| With frame_attributes record | 776 |
| With actual measurements (lens_width, bridge, temple) | **3** |
| With frame_shape | 2 |

Only **3 products** have the physical dimensions needed to generate accurate 3D models. The vast majority have no measurements at all.

### The Plan: Phase 1 -- Three.js 3D Rendering with Parametric Frame Models

Instead of needing a custom 3D model for every product, we build a **parametric frame generator** -- a single configurable 3D frame mesh in Three.js that reshapes itself based on measurements (lens_width, bridge_size, temple_length, frame_shape). The product's catalog image gets mapped as a texture onto this parametric mesh.

This is achievable in the browser, no external tools needed.

#### Step 1: Enrich Frame Measurements via AI

Create an edge function that uses Gemini to parse product names and descriptions to extract dimensions. Most product names contain measurements like "52-18-140" embedded in them.

For the ~351 try-on-eligible products, run this enrichment to populate `frame_attributes` with `lens_width`, `bridge_size`, `temple_length`, and `frame_shape`.

#### Step 2: Add Three.js + React Three Fiber

Install `three@>=0.133`, `@react-three/fiber@^8.18`, and `@react-three/drei@^9.122.0` (React 18 compatible versions).

Create a parametric glasses component that:
- Takes lens_width, bridge_size, temple_length as inputs
- Generates a 3D frame mesh (front piece + two temple arms)
- Maps the product image as a front-face texture
- Accepts a 4x4 transformation matrix from MediaPipe for positioning

#### Step 3: Replace 2D Overlay with 3D Scene

Replace `FaceMeshCanvas`'s `drawGlassesOverlay` (2D canvas drawing) with a Three.js `<Canvas>` overlay that:
- Renders the video feed as a background plane
- Positions the parametric 3D frame using the `facialTransformationMatrixes` from MediaPipe
- The frame rotates, tilts, and foreshortens properly because it's actual 3D geometry
- Temple arms extend toward the ears and disappear behind the head on turns

#### Step 4: Fallback for Products Without Measurements

Products that still lack measurements after enrichment fall back to the current 2D overlay (improved but still flat). A badge indicates "3D Try-On" vs "2D Preview" so users know the difference.

### Files to Create/Modify

| File | Action |
|------|--------|
| `package.json` | Add three, @react-three/fiber, @react-three/drei |
| `supabase/functions/enrich-frame-measurements/index.ts` | New -- AI extraction of dimensions from product names |
| `src/components/try-on/ParametricGlasses3D.tsx` | New -- Three.js parametric frame component |
| `src/components/try-on/ThreeARScene.tsx` | New -- Three.js canvas with video background + face-tracked frame |
| `src/components/try-on/FaceMeshCanvas.tsx` | Refactor to use ThreeARScene when 3D data is available |
| `src/shared/lib/glasses-overlay.ts` | Keep for 2D fallback |
| `src/components/try-on/LiveARTryOn.tsx` | Pass frame_attributes to the 3D scene |

### What This Achieves

- Frames rotate, tilt, and foreshorten correctly with head movement
- Temple arms visually extend toward the ears
- Bridge sits on the nose with proper depth
- Works with existing product images as textures (no custom 3D modeling needed per product)
- Degrades gracefully to current 2D overlay for products missing data

### Complexity for Stakeholders

```text
Effort Breakdown:
  Phase 1A - AI measurement enrichment:     ~2 hours
  Phase 1B - Parametric 3D frame model:      ~4 hours  
  Phase 1C - Three.js AR scene integration:  ~4 hours
  Phase 1D - Fallback + polish:              ~2 hours
  Total Phase 1:                            ~12 hours

  vs. Lens Studio path (Phase 2 if needed):
  - Snap developer account setup:            ~1 hour
  - Lens Studio installation + learning:     ~8-16 hours
  - Creating one lens per product:           ~2-4 hours EACH
  - For 351 products:                        700-1400 hours
  - Camera Kit integration (already built):  done
  - Total:                                   ~750-1450 hours
```

The Lens Studio path gives the absolute best quality (native face mesh occlusion, real-time shadows, perfect depth) but requires creating a custom lens for every single product. At scale, that's a full-time 3D artist for months.

The Three.js parametric approach gives 80% of the quality at 1% of the effort.

### Immediate First Step

Start with the measurement enrichment edge function -- this unblocks everything else and costs no AI credits beyond what's already available (Gemini). Once we know how many products get valid measurements, we'll have a clear picture of 3D coverage.

