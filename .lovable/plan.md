

## Fix MediaPipe ROI Error

### Problem
MediaPipe crashes with `ROI width and height must be > 0` when `detectForVideo` is called before the webcam has delivered its first frame (video dimensions are 0×0).

### Fix
**File: `src/shared/hooks/useFaceMesh.ts`** — Add a dimension guard in the detection loop, right after the existing early-return checks (line 109) and before calling `detectForVideo`:

```typescript
if (video.videoWidth === 0 || video.videoHeight === 0) {
  rafIdRef.current = requestAnimationFrame(detect);
  return;
}
```

This skips the frame silently until the camera stream has initialized real dimensions. One line change, no other files affected.

