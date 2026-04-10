

## Fix Hero Headline Spacing, Glasses Size & Mobile Font Size

### Problems
1. **No space between words** — The words "A", "clearer", "OUTLOOK", "on", "life" render with no visible gaps because each word is wrapped in `inline-block overflow-hidden` spans, and the trailing space (`{word}{" "}`) gets clipped by the overflow-hidden wrapper.
2. **Glasses icon too small** — The `GlassesOO` lenses at `0.45em` are hard to see, especially on mobile.
3. **Headline font too small on mobile** — The `clamp(2rem,...)` minimum could be bumped up for more impact.

### Changes — `HeroSection.tsx`

1. **Fix word spacing**: Add `mr-[0.25em]` (or `mr-2`) to each word's outer `<span className="inline-block overflow-hidden ...">` so there's a visible gap between words even though `overflow-hidden` clips the trailing whitespace. Apply this to both the first line ("A clearer") and second line ("OUTLOOK on life") word maps.

2. **Increase GlassesOO lens size**: Change lens dimensions from `w-[0.45em] h-[0.45em]` to `w-[0.55em] h-[0.55em]` and bridge from `w-[0.08em]` to `w-[0.1em]`. Also increase the height class on usage from `h-[0.55em] sm:h-[0.6em]` to `h-[0.65em] sm:h-[0.7em]`.

3. **Increase mobile headline font size**: Change the clamp from `text-[clamp(2rem,6.5vw,5.5rem)]` to `text-[clamp(2.5rem,6.5vw,5.5rem)]` — bumps the minimum from 32px to 40px on small screens.

4. **Remove the artificial `h-2 sm:h-4` spacer div** between the two word rows (line 225) — it forces a line break that isn't needed and contributes to the cramped look. Replace with natural line wrapping.

### Technical detail
- The root cause of missing spaces is `overflow-hidden` on the parent `<span>` clipping the `{" "}` whitespace. Adding a right margin to the wrapper span is the cleanest fix without breaking the reveal animation.

