

## Speed Up Scrolling Animations

### Changes

**File: `src/index.css`** — adjust animation durations:

| Element | Current Speed | New Speed |
|---------|--------------|-----------|
| `.ticker-track` (banner pun text) | 45s | 25s |
| `.product-ticker` (banner product carousel) | 60s | 35s |
| `.marquee-track` (Marquee Row 1) | 25s | 15s |
| `.marquee-reverse` (Marquee Row 2) | 35s | 22s |
| `.marquee-ghost` (Marquee Row 3) | 18s | 12s |

All five CSS rules get their `animation-duration` values reduced. No other files need changes.

