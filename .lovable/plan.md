

## Stabilize & Properly Fit Glasses on Face

### Problem
The glasses overlay jitters and doesn't sit naturally — the temple arms don't extend to the ears, and the frame width/position doesn't match the actual face geometry properly.

### Root causes
1. **Smoothing too weak** — `SMOOTH_FACTOR = 0.3` lets too much raw noise through, causing jitter
2. **Width too narrow** — `TEMPLE_PADDING = 1.15` doesn't extend the frame wide enough for temple arms to reach the ears
3. **Vertical position wrong** — the blend of eye-top (40%) and nose bridge (60%) places the frame too low; real glasses sit higher, at the brow/eye-top level
4. **Depth scale too aggressive** — `DEPTH_SCALE_FACTOR = 2.0` causes large size fluctuations with small head movements

### Changes — single file: `src/shared/lib/glasses-overlay.ts`

1. **Increase smoothing** — change `SMOOTH_FACTOR` from `0.3` to `0.15` for much more stable, less jittery tracking

2. **Widen frame to reach ears** — change `TEMPLE_PADDING` from `1.15` to `1.35` so the temple arms extend past the face sides toward the ears

3. **Use ear landmarks for width** — replace temple landmarks (#234, #454) with tragion/ear landmarks (#127, #356) which sit right at the ear, giving a more accurate ear-to-ear width for temple arm placement

4. **Fix vertical positioning** — change the vertical blend from `eyeTop * 0.4 + noseBridge * 0.6` to `eyeTop * 0.7 + noseBridge * 0.3` so the frame sits at natural brow height where glasses actually rest

5. **Reduce depth sensitivity** — change `DEPTH_SCALE_FACTOR` from `2.0` to `0.8` to prevent erratic size changes

6. **Add velocity damping** — enhance the EMA to also dampen sudden large jumps by clamping per-frame deltas, preventing the frame from "teleporting" during fast head movements

### Expected result
- Glasses frame spans ear-to-ear with temple arms visually reaching the sides of the face
- Frame sits at natural eye/brow height
- Smooth, stable tracking with minimal jitter
- No erratic size changes when leaning forward/back

