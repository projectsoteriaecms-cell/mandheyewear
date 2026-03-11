

## Add Image Preview with Zoom

### What
Add a lightbox-style image preview when clicking on any product image thumbnail in the `QuickImageUploadModal`. Clicking an image opens it full-size in a centered overlay with zoom (scroll/pinch to zoom, click to toggle zoom level), plus left/right navigation between images.

### Changes

**1. New component: `src/components/admin/products/ImagePreviewLightbox.tsx`**
- A `Dialog` overlay showing the full-resolution image
- State: `scale` (1x default, toggle to 2x on click, scroll wheel for finer control)
- Left/right arrow buttons + keyboard arrows to navigate between images in the set
- Close on backdrop click or Escape
- Shows position label ("Hero", "Left 45°", etc.) and image index

**2. Update `DraggableImageItem.tsx`**
- Add an `onPreview?: (url: string) => void` prop
- Add a small "expand" icon button (or make clicking the image itself trigger preview instead of drag)
- Clicking the image area calls `onPreview(url)` — the drag handle remains separate for reordering

**3. Update `QuickImageUploadModal.tsx`**
- Add `previewIndex` state (`number | null`)
- Pass `onPreview` to each `DraggableImageItem`
- Render `ImagePreviewLightbox` when `previewIndex !== null`, passing `allImages` and current index
- Navigation updates `previewIndex`

### Zoom Implementation
- CSS `transform: scale()` on the image, constrained within the viewport
- Click toggles between 1x and 2x
- Mouse wheel / pinch adjusts scale between 0.5x–4x
- When zoomed, mouse drag pans the image (cursor changes to grab)

