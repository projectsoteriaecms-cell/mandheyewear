

## Phase 1: Design Identity Overhaul — Color Palette & Base System

This phase focuses exclusively on the **foundation**: swapping the color palette, updating CSS variables, gradients, and shadows to match the new direction. No component layouts change yet — just the design tokens that everything else depends on.

### Design Decisions (Based on Your Answers)

- **Palette**: Ink (#1A1A2E deep charcoal) + Cream (#FAF7F2 warm off-white) as base, replacing blue/white
- **Accents**: M&H Gold stays as primary accent (CTAs, active states), Flame (#FF5A36 warm coral) added as secondary accent (sale tags, alerts, urgency)
- **Navy**: Retained for Soteria clinical sections
- **Typography**: Keep Cormorant Garamond + Inter (no change)
- **Light mode**: Cream-dominant backgrounds with Ink used for hero/feature sections
- **Dark mode**: Full Ink backgrounds with Cream text and warm accent glows

### What Changes

**File: `src/index.css`** — Complete CSS variable overhaul:

| Variable | Current | New (Light) | New (Dark) |
|----------|---------|-------------|------------|
| `--background` | `0 0% 100%` (white) | `36 33% 96%` (cream) | `240 30% 11%` (ink) |
| `--foreground` | `210 25% 12%` (dark blue) | `240 20% 13%` (ink) | `36 25% 93%` (cream) |
| `--primary` | `210 85% 40%` (blue) | `45 100% 45%` (gold) | `45 100% 55%` (gold) |
| `--accent` | `45 100% 45%` (gold) | `45 100% 45%` (gold stays) | `45 100% 55%` |
| New: `--flame` | — | `14 100% 61%` | `14 100% 65%` |
| `--card` | white | cream | ink-lighter |
| `--border` | blue-tint | warm neutral | warm dark |
| All gradients | Blue-based | Ink/Cream/Gold based | Ink/Gold glows |
| All shadows | Blue-tinted | Warm neutral | Warm dark glows |

**File: `tailwind.config.ts`**:
- Add `flame` color tokens (`flame`, `flame-light`, `flame-dark`)
- Add `ink` and `cream` color tokens for direct use
- Update `soteria-blue` to `navy` semantic naming

**File: `index.html`**:
- Update `theme-color` meta tags from blue to ink/cream

### What Does NOT Change (Yet)
- Component layouts, homepage structure, navigation — all untouched
- Typography stays Cormorant Garamond + Inter
- No new components or pages

### Why This Order
Every component references CSS variables. Changing the tokens first means every existing component automatically picks up the new palette on the next render. The follow-up phases (Homepage & Hero, Interactivity, Style Quiz, Dark/Light polish) build on this foundation.

