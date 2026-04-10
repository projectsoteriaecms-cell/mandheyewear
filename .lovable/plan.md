

## Simplify Hero Section — Static Image, Clean Frame, Standard Layout

### What changes

1. **Use single static hero image** — Remove the image rotation logic entirely. Use `heroEyewear` (the original hero image) as the sole image for both mobile and desktop. Remove the `heroIndex` state, the rotation `useEffect`, the `allFrames` mapping, and the `productImages` query.

2. **Remove overlays from the hero image** — Strip the "20% OFF" discount badge and the "New Season Collection / April 2026 Drop" label overlay from both mobile and desktop image containers. The frame will show just the clean product image with a subtle gradient.

3. **Make the frame wider on mobile** — Increase the mobile image from `max-w-[220px]` to `w-full max-w-[320px]` so it spans closer to the viewport width (390px), giving it more visual impact.

4. **Cleaner, more standard hero** — The image becomes a simple rounded container with the static hero photo, no promotional overlays, just the brand aesthetic. Keep the gradient overlay for depth but remove all text/badges on top of the image.

### Technical details

**File: `HeroSection.tsx`**

- Remove `heroIndex` state and its rotation `useEffect` (lines 92, 195-201)
- Remove `productImages` query (lines 161-176) and `allFrames` memo (lines 178-183) — replace with just `const heroImage = heroEyewear`
- Replace the `allFrames.map(...)` image stack with a single `<img src={heroEyewear} />` in both mobile (line 313-319) and desktop (line 366-372) containers
- Remove the discount badge div (lines 322-328 mobile, 377-383 desktop)
- Remove the brand tag div (lines 329-334 mobile, 385-390 desktop)
- Mobile image container: change from `max-w-[220px] md:max-w-[280px]` to `w-full max-w-[320px] md:max-w-[380px]` and use `aspect-[4/3]` instead of `aspect-square` for a wider, more cinematic feel
- Keep the `GlassesOO` component using `heroEyewear` as its source

