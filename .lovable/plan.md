

## Rotating Narrative Tagline in Hero Section

### What
Replace the static tagline "For those who see the future before it arrives." with a rotating text animation that cycles through multiple narrative lines, telling a cohesive brand story.

### Narrative Lines (aligned with the 3 brand pillars)
1. **"For those who see the future before it arrives."** — The Visionary
2. **"Frames as loud as your ambition, as silent as true luxury."** — Shakara
3. **"Sharp eyes. Sharper style. Sharpest vision."** — Clinical + Style
4. **"Na style wey dey see road."** — Cultural punch

### How — `HeroSection.tsx`

1. **Add state**: `useState` for `taglineIndex` starting at 0, cycling through the array
2. **Add interval**: `useEffect` with `setInterval` every ~4 seconds to increment the index
3. **Add fade transition**: Wrap the `<p>` text in a keyed container with a CSS fade-in/fade-out animation (using the existing `animate-fade-in` keyframes + a custom `animate-fade-out` approach, or a simple opacity transition with a brief exit before entering the next line)
4. **Keep the gold left-border container** — only the text inside rotates
5. The pill badge below ("Clarity without compromise") stays static as the anchor

### Animation approach
- Use a `key={taglineIndex}` on the `<p>` to trigger re-mount with `animate-fade-in`
- Brief opacity transition: text fades out over 300ms, swaps, fades in over 300ms

