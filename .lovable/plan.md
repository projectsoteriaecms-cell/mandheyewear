

## Dynamic Hero Frame Carousel — Real Product Images from Catalogue

### The Problem
Currently only 5 static asset images rotate in the hero. The user wants ~20 real frames from the product catalogue, with smooth image-only transitions (no container flicker), and the two slots must never show the same frame simultaneously.

---

### Approach

**Fetch real product images from the database** — query up to 20 active products with images (same pattern already used in `QuickDiscovery.tsx`). Fall back to the 5 static assets if the query returns nothing.

**Stable container, content-only crossfade** — the rounded-pill container stays perfectly still. Inside it, two `<img>` tags are stacked (`absolute`). The outgoing image fades to `opacity-0` while the incoming fades to `opacity-100`. No blur, no scale, no movement on the container itself.

**No duplicate logic** — slot 2 always picks the next index that isn't currently showing in slot 1, and vice versa. Simple: slot 1 uses even indices, slot 2 uses odd indices from a shuffled array, or we track both and skip collisions.

---

### Changes — Single File

**`HeroSection.tsx`**

1. Add a `useQuery` call to fetch ~20 product `image_url`s from the `products` table (active, has image, frames only) — identical pattern to QuickDiscovery
2. Merge fetched URLs with the 5 static fallbacks into a single `allFrames` array (deduplicated, capped at 20)
3. Rewrite the carousel logic:
   - Two state vars: `img1Index` and `img2Index`, initialized to `0` and `1`
   - Two `fading` states for crossfade control
   - On each 5s tick for slot 1: fade out current, after 500ms set new index (skipping whatever slot 2 is showing), fade in
   - Slot 2 offset by 2.5s, same logic but skips slot 1's current index
4. Fix the container: remove any transition/transform on the outer `<span>` wrapper. Only the `<img>` inside gets `transition-opacity duration-500`. No blur, no scale on transition — just a clean opacity swap
5. Use two stacked `<img>` elements per slot (current + next) for seamless crossfade without any container movement

### What Does NOT Change
- Container shape, size, border, shadow — all stay fixed
- Twin-lens SVG, headline layout, all other copy
- Mobile responsiveness, promo banner, stats, CTAs

