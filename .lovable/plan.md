

## Restructure Hero Headline — 3 Lines Max, Single Glasses Frame for "OO"

### Layout Goal
The headline should always render as exactly 3 lines:
- **Line 1**: "A Clearer"
- **Line 2**: "OUTLOOK" (stretched wide, with the double-O replaced by a single glasses frame spanning both O positions)
- **Line 3**: "on life."

### GlassesOO Redesign — Single Frame, Two Lens Holes
Instead of two separate circles, the component becomes **one continuous glasses frame** with:
- A single rounded-rectangle/pill outer border representing the frame
- Two circular cutouts (lens holes) inside, each showing the hero image
- A thin bridge in the center
- No temples

This mimics a real pair of glasses viewed from the front — one frame, two lenses.

```text
┌──────────────────────────┐
│  ┌─────┐       ┌─────┐  │
│  │ img │ bridge│ img │  │
│  └─────┘       └─────┘  │
└──────────────────────────┘
```

### Changes — `HeroSection.tsx`

1. **Redesign `GlassesOO` component** (lines 9-22):
   - Outer wrapper: a single `rounded-full` or `rounded-[999px]` pill-shaped border (gold accent) containing two circular lens holes side by side with a bridge
   - Each lens is `rounded-full overflow-hidden` showing the hero image
   - The outer frame has padding around the lenses, giving the appearance of a real frame rim
   - Uses `em` units so it scales with headline text

2. **Restructure headline lines** (lines 211-252):
   - Line 1: `"A Clearer"` — both words on same line, no `<br />`
   - Line 2: `"OUTLOOK"` alone — force `<br />` before and after. Apply `tracking-[0.15em]` or `tracking-widest` to stretch it across the width. The "OO" is replaced by the single-frame `GlassesOO`
   - Line 3: `"on life."` — together on one line
   - Remove the current two-array mapping approach; use a simpler structure with explicit `<br />` tags between the three lines

3. **Stretch "OUTLOOK"**: Add `tracking-[0.2em] sm:tracking-[0.25em]` and potentially `inline-block w-full text-center lg:text-left` to make it visually wider and more impactful

### Technical detail
The key visual trick for the single-frame `GlassesOO`: wrap both lenses in a parent `<span>` with `border-2 border-mh-gold/50 rounded-full px-[0.06em] py-[0.04em]` — this creates the outer frame rim. Inside, two circular lens `<span>`s with the hero image, separated by a bridge bar.

