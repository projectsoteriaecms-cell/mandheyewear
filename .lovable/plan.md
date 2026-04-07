

## Build Live AR Try-On with TensorFlow.js Face Mesh

Replace the non-functional Camera Kit shell with a working TensorFlow.js + MediaPipe Face Mesh implementation that overlays product images on the user's face in real-time via webcam. Camera Kit code stays as a fallback when configured.

### How It Works

The webcam feed streams to a `<video>` element. MediaPipe Face Mesh detects 468 facial landmarks every frame. We use key landmarks (eye corners, nose bridge, ear tips) to compute position, width, and rotation for the glasses overlay. A `<canvas>` composites the video frame + the product's `image_url` on top, giving real-time AR.

```text
Webcam → Video element → Face Mesh detects landmarks
                              ↓
Canvas draws: video frame + product image overlay
              (positioned at eye/nose landmarks)
```

### Changes

**1. Install dependencies**
- `@mediapipe/face_mesh` — face landmark detection
- `@mediapipe/camera_utils` — webcam helper

**2. New: `src/shared/hooks/useFaceMesh.ts`**
- Initializes MediaPipe Face Mesh model
- Manages webcam stream lifecycle (start/stop, permission handling)
- On each frame: runs face detection, returns 468 landmarks
- Exposes: `isReady`, `isLoading`, `error`, `landmarks`, `videoRef`, `canvasRef`, `start()`, `stop()`

**3. New: `src/shared/lib/glasses-overlay.ts`**
- Pure utility: given landmarks + frame image, computes overlay transform
- Key landmarks used: left eye outer (#33), right eye outer (#263), nose bridge (#6)
- Calculates: center position, width (eye-to-eye × scale factor), rotation angle
- Draws the product image onto the canvas with correct transform

**4. New: `src/components/try-on/FaceMeshCanvas.tsx`**
- Replaces `CameraKitCanvas` as default AR view
- Renders hidden `<video>` + visible `<canvas>`
- Animation loop: draw video frame → run face mesh → draw glasses overlay
- Shows loading skeleton while model loads, permission-denied state, error state
- Shows "No face detected" indicator when landmarks are empty
- LIVE indicator when running

**5. New: `src/components/try-on/ARFrameSelector.tsx`**
- Replaces `ARLensSelector` — shows actual product catalog frames (not Snap lenses)
- Horizontal scrollable list of frame products with thumbnail + name
- Takes products from the same `useProducts` data used in Photo Mode
- Filters to `item_type === "frames"` with valid `image_url`

**6. Rewrite: `src/components/try-on/LiveARTryOn.tsx`**
- Use `FaceMeshCanvas` instead of `CameraKitCanvas`
- Use `ARFrameSelector` with real products instead of `ARLensSelector` with Snap lenses
- Pass selected product's `image_url` to the canvas for overlay
- Capture button takes a snapshot of the canvas (toDataURL)
- If `isCameraKitConfigured()` is true, show a toggle to switch to Camera Kit premium mode (keeps existing code path)
- Accept products list as a prop from `TryOn.tsx`

**7. Update: `src/pages/TryOn.tsx`**
- Pass `frameProducts` to `LiveARTryOn` so it can populate the frame selector
- No other changes needed — mode toggle and history already work

**8. Update: `src/components/try-on/index.ts`**
- Export new components (`FaceMeshCanvas`, `ARFrameSelector`)

### What stays unchanged
- All Camera Kit files (`useCameraKit.ts`, `CameraKitCanvas.tsx`, `ARLensSelector.tsx`, `snap-lenses.ts`) — kept intact as premium path
- Photo Mode — completely untouched
- `TryOnModeToggle` — no changes
- Try-on history integration — same interface

### Technical Notes
- MediaPipe Face Mesh runs entirely in-browser (no API calls, no credits)
- Works on Chrome, Edge, Safari, Firefox with webcam support
- Product images are pre-loaded as `Image` objects for smooth rendering
- Canvas capture uses `canvas.toDataURL("image/png")` for snapshots
- Frame overlay uses 2D canvas transforms (translate, rotate, scale) for proper positioning

