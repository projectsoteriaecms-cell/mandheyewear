

## Re-apply Logo Background Removal

### What Happened
When the logo was resized, the `mh-logo.png` file or its import path was modified for cache-busting, but the background-removal processing was lost — the current PNG still has its white/off-white background visible.

### Fix
Re-run the Python background removal script on `src/assets/mh-logo.png` to strip white/light pixels and restore full transparency. The same approach used before:

1. Open `src/assets/mh-logo.png` with PIL
2. Convert to RGBA, identify white/near-white pixels (R, G, B > 200)
3. Set those pixels' alpha to 0 (transparent)
4. Save back to the same path

No code changes needed — just re-processing the image asset.

