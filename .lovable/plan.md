

## Fix Live AR: Stabilize Face Detection + Test 3D Tracking

### Problem from Session Replay

The "No face detected" banner is flickering on/off every ~200ms. This happens because `faceDetected` state is set to `false` on every single frame where MediaPipe doesn't return landmarks — which can happen due to motion blur, brief occlusion, or GPU frame drops. When detection drops for even 1 frame, the 3D scene hides the glasses (`groupRef.current.visible = false`) and resets.

### Root Cause

In `FaceMeshCanvas.tsx` line 113:
```typescript
setFaceDetected(false);  // fires on EVERY missed frame
```
And in `ThreeARScene.tsx` line 94:
```typescript
if (groupRef.current) groupRef.current.visible = false;  // hides immediately
```

There's zero tolerance for dropped frames — one miss and everything disappears.

### Fixes

**File: `src/shared/hooks/useFaceMesh.ts`**
- Add a "grace period" counter: only report no-face after **5 consecutive** missed frames (~150ms at 30fps)
- Keep sending the last known good landmarks during the grace window so the 3D scene stays stable

**File: `src/components/try-on/FaceMeshCanvas.tsx`**
- Debounce `setFaceDetected(false)` — only switch to "no face" after 300ms of continuous misses
- In 3D mode, keep passing the last valid landmarks/matrix to ThreeARScene during brief detection gaps

**File: `src/components/try-on/ThreeARScene.tsx`**  
- Don't hide the glasses group on a single missed frame — keep the last position for up to 300ms
- Add `preserveDrawingBuffer: true` to the Canvas for reliable snapshot capture (already present, confirm working)

### What stays the same
- ParametricGlasses3D geometry — unchanged
- Measurement enrichment — already done (435 products ready)
- 2D fallback path — unchanged
- Smile-to-capture — unchanged

### Expected result
Face tracking becomes stable — glasses stay on the face even during brief detection drops. The "No face detected" banner only shows after a clear, sustained absence (300ms+). 3D parametric frames render and track head rotation smoothly.

