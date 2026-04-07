

## Improve Glasses Overlay Face Tracking & Fit

The current overlay uses only 3 landmarks (eye corners + nose bridge) with fixed scale/aspect ratios. This causes poor fitting because: the width doesn't adapt to actual face width, the vertical position uses a tiny fixed offset, and there's no smoothing so the overlay jitters frame-to-frame.

### Changes (single file: `src/shared/lib/glasses-overlay.ts`)

**1. Use temple landmarks for accurate width**
- Use landmarks #234 (left temple) and #454 (right temple) instead of eye distance × fixed scale factor
- This makes the frame width match the actual face width, adapting to distance from camera and face size

**2. Better vertical positioning**
- Use the midpoint between eye landmarks #159 (left eye top) and #386 (right eye top) combined with the nose bridge to place frames at the correct eye-level height
- Shift center to sit naturally across the brow line, not just above the nose

**3. Add temporal smoothing (EMA filter)**
- Apply exponential moving average to centerX, centerY, width, height, and angle
- This eliminates jitter/flicker when the face moves slightly between frames
- Smoothing factor ~0.3 (responsive but stable)

**4. Use actual image aspect ratio**
- Instead of hardcoded `ASPECT_RATIO = 0.45`, compute height from the loaded image's natural width/height ratio
- Pass `imageAspectRatio` into `computeGlassesTransform` so different frame shapes render correctly

**5. Add depth-aware scaling**
- Use landmark z-coordinates to slightly adjust scale when the user leans forward/back
- Subtle effect to improve realism

### File changes

- **`src/shared/lib/glasses-overlay.ts`** — rewrite transform logic with temple landmarks, smoothing, dynamic aspect ratio
- **`src/components/try-on/FaceMeshCanvas.tsx`** — pass image aspect ratio to the transform function, store smoothing state in a ref

No other files change.

