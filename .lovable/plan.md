
Goal: fix the Live AR experience so the glasses overlay looks realistic, faces the same direction as the mirrored camera, and only appears when actual face landmarks are being tracked.

What’s causing the current problems
- The AR mode is using `selectedProduct.image_url` directly as the overlay. Those product images are normal catalog photos, often with a white background and sometimes showing the frame at an angle, so they are not suitable as transparent AR assets.
- The canvas mirrors the webcam, and the landmarks are mirrored too, but the product image itself is not corrected. If the source image is photographed from the opposite side, it will look backwards on the face.
- Face sensing does exist in `useFaceMesh` and `FaceMeshCanvas`, but the visual result feels wrong because the overlay asset itself is poor, not because landmarks are missing.

Implementation plan

1. Add AR-safe frame image selection
- Introduce a small utility to choose the best image for AR overlays instead of always using `image_url`.
- Prefer a transparent overlay image if one exists in the product’s extra images.
- If no transparent asset exists, fall back to a safer front-facing image and reject obvious bad candidates.

2. Add image suitability checks before rendering
- Detect whether a selected frame image likely has a solid white background.
- Detect whether the image appears unsuitable for AR (for example, non-transparent catalog shot or angled product photo).
- If unsuitable, do not render it as a live overlay; show a clear message that this frame is not AR-ready yet.

3. Fix left/right orientation handling
- Add a configurable horizontal flip step for the overlay draw routine.
- Default the live overlay to match the mirrored selfie preview so the frame faces the same way as the user.
- Keep this isolated in `drawGlassesOverlay` or through a transform flag so tracking logic stays simple.

4. Tighten face-tracking gating
- Only draw the overlay when landmarks are present and the image has passed AR suitability checks.
- Reset smoothing when the face is lost or when the selected frame changes, so the frame does not “float” from stale coordinates.
- Keep the existing face-mesh tracking pipeline, but make the UI reflect whether the frame is actually being tracked and rendered.

5. Improve the Live AR UI feedback
- In `LiveARTryOn` / `FaceMeshCanvas`, add a helpful status for:
  - no face detected
  - frame image loading
  - selected frame not AR-ready
- This makes it obvious the issue is with the chosen frame asset, not the camera.

Files to update
- `src/components/try-on/LiveARTryOn.tsx`
- `src/components/try-on/FaceMeshCanvas.tsx`
- `src/shared/lib/glasses-overlay.ts`
- likely one new small helper for AR image selection / validation

Technical notes
- The biggest functional issue is asset quality, not landmark detection.
- Good AR overlays need transparent PNG/WebP assets cropped tightly around the frame.
- If your product catalog only has normal storefront photos, live AR will never look correct consistently until AR-ready assets are available.
- The plan keeps the current face-mesh tracking and improves rendering behavior around it rather than replacing the tracking engine.

Expected result
- The overlay will no longer show an obvious white rectangle.
- The frame will face the correct direction in the mirrored preview.
- The app will only render overlays when both face tracking and a usable AR asset are available, which makes the feature feel accurate instead of broken.
