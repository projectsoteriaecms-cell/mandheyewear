

## Flip Glasses Overlay Vertically (180°)

The glasses overlay is currently rendering upside-down relative to the face. A 180° vertical flip will correct the orientation.

### Change

**File: `src/shared/lib/glasses-overlay.ts`** — In `drawGlassesOverlay`, add `ctx.scale(1, -1)` before drawing the image. This flips the overlay top-to-bottom so what was facing up now faces down, and vice versa. This single line goes right before the `ctx.drawImage(...)` call, inside the existing `ctx.save()`/`ctx.restore()` block.

No other files change.

