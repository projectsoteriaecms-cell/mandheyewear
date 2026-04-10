

## Fix Hero Headline — Keep "A Clearer" Together & Responsive Wrapping

### Problems Identified
1. **Desktop (1026px)**: "A" sits alone on line 1, "Clearer" drops to line 2 — making 4 lines instead of 3
2. The `inline-block overflow-hidden` wrappers on individual words prevent natural text flow and wrapping
3. Explicit `<br />` tags create rigid breaks that don't adapt to all viewport sizes

### Solution — `HeroSection.tsx` (lines 211-251)

**Wrap "A Clearer" in a single `whitespace-nowrap` span** so they always stay together, and use natural wrapping for the rest:

1. **Line 213-224**: Merge the two separate "A" and "Clearer" spans into one single `inline-block overflow-hidden whitespace-nowrap` span containing both words. This guarantees they never separate.

2. **Keep the `<br />` after "A Clearer"** (line 225) so "OUTLOOK" always starts a new line.

3. **Keep "OUTLOOK" `whitespace-nowrap`** (already done) so the glasses icon stays with the text.

4. **Keep `<br />` before "on life."** so it stays on line 3.

The result: exactly 3 lines at every viewport — "A Clearer", "OUTLOOK", "on life." — with natural responsive scaling via the existing `clamp()` font size.

### What stays the same
- The `GlassesOO` component design (single frame, two lenses)
- The reveal animations (just combined into fewer spans)
- The `clamp()` font sizing
- Mobile layout (already correct)
- All other sections below the headline

