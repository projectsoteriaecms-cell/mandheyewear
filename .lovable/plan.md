

## Phase 2: Homepage & Navigation — Editorial Ink/Cream/Gold/Flame Update

This phase updates the homepage sections and navigation to create an alternating Ink ↔ Cream editorial rhythm (like Vogue magazine layouts) and fully leverage the new Gold + Flame accent system.

### Design Pattern: Alternating Section Blocks

```text
┌─────────────────────────────────────┐
│  Navigation: Ink TopBar + Cream Nav │  (already working)
├─────────────────────────────────────┤
│  Hero: INK background               │  Full-width Ink with Gold/Cream text
├─────────────────────────────────────┤
│  Quick Discovery: CREAM background   │  Warm cream, Gold accents
├─────────────────────────────────────┤
│  Category Cards: INK background      │  Already dark (feature-navy) ✓
├─────────────────────────────────────┤
│  Style Quiz: CREAM background        │  Cream base, Flame CTA accent
├─────────────────────────────────────┤
│  Featured Frames: INK background     │  Dark editorial product grid
├─────────────────────────────────────┤
│  Virtual Try-On: CREAM background    │  Light, airy tech showcase
├─────────────────────────────────────┤
│  Trust Badges: INK background        │  Dark with Gold icon accents
├─────────────────────────────────────┤
│  Footer: INK (already) ✓            │
└─────────────────────────────────────┘
```

### Changes by File

**1. `HeroSection.tsx`** — Convert to full Ink background editorial hero
- Background: `bg-ink` (dark charcoal) instead of `bg-gradient-to-br from-background`
- All text: Cream/white tones (`text-cream`, `text-cream/70`)
- Accent badge underlines and CTAs stay Gold
- Floating cards: glass-dark with cream text
- Background orbs: Gold/Flame glows instead of primary/accent

**2. `TopBar.tsx`** — Already Ink (bg-primary mapped to gold now, needs fix)
- Background: explicit `bg-ink` instead of `bg-primary` (since primary is now Gold)
- Text: `text-cream` and `text-cream/70`
- "Book Eye Exam" button: Flame accent (`bg-flame text-white`)

**3. `MainNav.tsx`** — Cream background nav bar
- Stays `bg-background` (cream in light, ink in dark) ✓
- Active link indicators: Gold underline
- Highlighted links (Style Quiz, Try-On): Flame color instead of accent

**4. `MobileTopBar.tsx`** — Match desktop nav cream/ink scheme
- Sheet header: `bg-ink` instead of `bg-primary`
- Highlighted menu items: Flame tint

**5. `MobileBottomNav.tsx`** — Subtle update
- Active icon: Gold instead of primary

**6. `QuickDiscovery.tsx`** — Cream section
- Section bg: `bg-background` (cream)
- Promotional banner: Keep Ink internal gradient (already dark) ✓
- Filter pills: Gold border accents
- "Trending Frames" label: Gold

**7. `CategoryCards.tsx`** — Already Ink ✓ (minor tweaks)
- Section label "Explore Our Collection": Gold text
- Arrow buttons: Gold accent (already using accent) ✓

**8. `QuizPromo.tsx`** — Cream section with Flame CTA
- Keep `bg-background` (cream) ✓
- Primary CTA button: Add Flame variant (`bg-flame`) for urgency
- Badge: Gold accent stays
- "60 seconds" highlight: Flame color instead of primary

**9. `FeaturedFrames.tsx`** — Convert to Ink background
- Section bg: `feature-navy` (ink dark)
- Text: Cream/white
- Product cards: glass-dark styling with warm borders
- "View All" link: Gold

**10. `VirtualTryOn.tsx`** — Cream section
- Section bg: `bg-background` instead of `bg-muted/30`
- Badge and feature pills: Gold accents
- CTA: Gold button

**11. `TrustBadges.tsx`** — Convert to Ink background
- Section bg: `feature-navy`
- Text: Cream/white
- Icon backgrounds: Gold tint
- Highlight badges: Flame accent for urgency tags ("Save ₦15,000")
- Section title: Update from "Soteria & M&H" to just "The M&H Difference"

**12. `Index.tsx`** — Update floating chat button
- Change from `bg-accent` to `bg-flame` for the Sparkle FAB

**13. `src/index.css`** — Add `.section-ink` and `.section-cream` utility classes
- `.section-ink`: Ink bg with cream text defaults
- `.section-cream`: Cream bg with ink text defaults

### What Does NOT Change
- Footer (already Ink-based, working)
- Component internal logic, data fetching, carousels
- Typography (Cormorant Garamond + Inter stays)
- Mobile bottom nav layout

