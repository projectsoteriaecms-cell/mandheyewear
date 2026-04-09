

## Dynamic Frame Carousel + "OUTLOOK" Typographic Logo Treatment

### Two Features

**1. Rotating frame images in the headline (every 5 seconds)**

The two inline images (`IMG1` and `IMG2`) in "A clearer [IMG1] outlook [IMG2] on life" currently show static images. We'll add a `useEffect` interval that cycles through `[heroEyewear, frame1, frame2, frame3, frame4]` with a crossfade animation. Each image slot cycles independently with offset timing for visual depth.

- Add `currentImg1` and `currentImg2` state variables
- `useEffect` with `setInterval(5000)` cycling through the frame images array
- Crossfade transition: outgoing image fades + blurs out, incoming fades + blurs in (0.6s transition)
- Two image elements stacked with `absolute` positioning — one fading out while the other fades in

**2. "OUTLOOK" typographic logo treatment — twin-lens OO**

Transform the word "outlook" so the two "O"s in "look" are rendered as connected lens shapes — like a pair of glasses viewed from the front. The word gets a distinct gold color treatment.

- Split "outlook" into: `"outl"` + `"oo"` + `"k"`
- The `"oo"` renders as an inline SVG: two circles connected by a bridge line (like spectacle lenses from the front), sized to match the font
- The entire word gets `text-mh-gold` color to make it pop against cream text
- The SVG lenses get a subtle shimmer animation (a gold highlight sweep every few seconds)
- On mobile, the SVG scales proportionally with the `clamp()` font size using `1em`-based sizing

**Strategic secondary placement:**
- In the Editorial Grid section header "Stay sharp. In every sense." — the period after "sharp" becomes a tiny gold lens dot
- In the Marquee ticker — the item "STAY SHARP IN EVERY SENSE" gets the OO lens treatment on any "OO" occurrences

---

### Files Modified

1. **`HeroSection.tsx`** — Image carousel logic + "outlook" SVG lens treatment
2. **`EditorialGrid.tsx`** — Gold lens dot on "sharp."
3. **`index.css`** — `@keyframes lens-shimmer` for the SVG highlight sweep

### What Does NOT Change
- Layout, spacing, mobile responsiveness, all other copy
- Promo banner, stats, CTAs, scroll indicator
- All existing animations and transitions

