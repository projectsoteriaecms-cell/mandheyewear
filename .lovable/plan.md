

## Hero Section Adjustments — Bigger Headline, Rotating Right Image Frame

### What's Changing

Three targeted tweaks to `HeroSection.tsx`:

### 1. Slightly Bigger Headline
Bump from `text-[clamp(1.8rem,5.5vw,4.5rem)]` to `text-[clamp(2rem,6.5vw,5.5rem)]` — noticeably larger and more distinct, but not as oversized as the original.

### 2. More Space Between "clearer" and "OUTLOOK on life"
Add vertical spacing after the `<br />` between the two lines. Use a spacer div or margin to create a clear visual gap between "A clearer" and "OUTLOOK on life".

### 3. Right Column Image Rotates Through Product Frames
Currently the right-side hero image is static (`heroImage`). Add back rotation logic:
- `useState` for `heroIndex` cycling through `allFrames`
- `useEffect` with `setInterval` every 4–5 seconds
- Crossfade transition (opacity swap between current and next image) for smooth animated rotation
- The "OO" in OUTLOOK stays static (no change there)

### Files Modified
- **`HeroSection.tsx`** only — all changes contained here

