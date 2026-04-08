

## Fix Live AR Face Tracking Accuracy

### Problems Identified

1. **Over-smoothing kills responsiveness** — EMA factor is 0.08 (extremely sluggish). The glasses visibly lag behind head movement by 10-15 frames. Velocity clamps (MAX_POSITION_DELTA 0.03) further choke fast movements.

2. **Low camera resolution** — Running at 640x480 gives MediaPipe fewer pixels to work with, reducing landmark precision especially at distance.

3. **Incorrect vertical flip in drawing** — `ctx.scale(1, -1)` flips the glasses image upside-down, then relies on the image already being pre-flipped. This causes misalignment on many frame images.

4. **Weak depth scaling** — `cos(yaw * 0.5)` barely changes width when turning head. Should use full yaw for realistic foreshortening.

5. **Vertical positioning is off** — The 0.7/0.3 blend of eye-top vs nose-bridge places glasses too high or too low depending on face shape. Should use the actual brow ridge landmarks (#65, #295) for where frames actually rest.

### Changes

**File: `src/shared/lib/glasses-overlay.ts`**
- Increase `SMOOTH_FACTOR` from 0.08 → 0.35 (much more responsive while still stable)
- Increase `MAX_POSITION_DELTA` from 0.03 → 0.08
- Increase `MAX_SIZE_DELTA` from 0.04 → 0.08  
- Increase `MAX_ANGLE_DELTA` from 0.02 → 0.05
- Reduce `WARMUP_FRAMES` from 3 → 2
- Use full `cos(yaw)` instead of `cos(yaw * 0.5)` for depth scaling
- Add roll from transformation matrix to the angle calculation for better tilt tracking
- Use brow landmarks (#65, #295) blended with nose bridge for vertical positioning instead of eye-top landmarks
- Remove the `ctx.scale(1, -1)` vertical flip from `drawGlassesOverlay` — draw the image right-side up

**File: `src/shared/hooks/useFaceMesh.ts`**
- Increase camera resolution from 640x480 → 1280x720 for better landmark precision
- Add `ideal` constraints so it gracefully falls back on weaker devices

### What stays the same
- The FaceLandmarker configuration (GPU, blendshapes, transformation matrix) — already correct
- Smile-to-capture and head pose guidance — unchanged
- All component structure — unchanged

### Expected result
Glasses will track the face tightly with minimal lag, sit at the correct brow height, scale properly when turning the head, and display right-side up on all frame images.

