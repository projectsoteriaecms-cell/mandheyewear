

## Landing Page Elevation — Cultural Copy Framework + Background Overhaul + Animation Theatrics

### What's Changing

Three intertwined upgrades across 8 files:

---

### 1. Copy Overhaul — The Three-Pillar Cultural Framework

Integrating the "Visionary / Shakara / Soft Life" pillars into specific sections:

**Hero (`HeroSection.tsx`)**
- Headline stays: **"A clearer outlook on life."** (proven triple pun)
- Subtext becomes layered with the Visionary pillar: *"For those who see the future before it arrives. Clarity without compromise — your world, in high definition."*
- Supporting line gets the Shakara nuance: *"A new frame of mind. Because your outlook should be as loud as your ambition, but as silent as true luxury."*

**Marquee (`MarqueeTicker.tsx`)**
- Top row adds: `STAY SHARP IN EVERY SENSE` · `A NEW FRAME OF MIND` · `SOFT LIFE CERTIFIED`
- Bottom row adds: `YOUR OUTLOOK YOUR POWER` · `LOOKING MONEY` · `SHAKARA NO BE SIN`
- Replaces some of the weaker current items

**Editorial Grid (`EditorialGrid.tsx`)**
- Section label: "The Visionary Standard"
- Headline: **"Stay sharp. In every sense."**
- Card descriptions refined with the three pillars woven in:
  - 01 Sharp Eyes: "For those who see the future before it arrives. Certified optometrists. Advanced diagnostics."
  - 02 Sharper Style: "A new frame of mind. Designer frames as loud as your ambition."
  - 06 The M&H Experience: "Where soft life meets sharp vision — na style wey dey see road."

**Dual CTA (`DualCtaSection.tsx`)**
- Header: "Your Outlook. Your Power."
- Left panel subtitle: "A new frame of mind. Frames as loud as your ambition, as silent as true luxury."
- Right panel subtitle: "For those who see the future before it arrives. Stay sharp, in every sense."

**Testimonials (`TestimonialSection.tsx`)**
- Section label: "Soft Life, Sharp Vision"

---

### 2. Background Overhaul — Deep Ink Hero with Cream Body

The cream background feels flat and un-luxurious. As a UX expert recommendation:

**Hero section: Switch to deep ink/dark background** with warm gold light leaks — this is the cinematic "curtain raiser" moment. Dark backgrounds create drama, focus the eye on the headline, and feel premium (Apple, luxury fashion all use this). Text becomes cream/white. The promo banner blends naturally since it's already ink.

**Rest of page: Stays cream-grain** — the editorial rhythm (dark hero → light body → dark sections) creates visual breathing room.

**Specific changes:**
- `HeroSection.tsx`: Change from `section-cream-grain` to `section-ink` with gold breathing glows
- All text colors in hero flip: `text-ink` → `text-cream`, `text-ink/60` → `text-cream/70`, etc.
- Stats text: `text-cream` with `text-cream/50` labels
- CTAs: Gold button stays, flame button stays — both pop harder on dark
- Scroll indicator: `text-cream/30`
- Floating images get a subtle gold border glow
- Background glows become more visible on dark (gold/5 → gold/8, flame/3 → flame/5)

---

### 3. Animation Theatrics — Precision Finesse

**Hero entrance sequence (staggered cinematic reveal):**
- **Phase 1** (0ms): Background glows fade in with scale
- **Phase 2** (200ms): `/EYEWEAR` and `/EYE CARE` tags slide in from left
- **Phase 3** (400-900ms): Each word of headline clips in with a mask-reveal effect (not just opacity — actual `clipPath` wipe from left to right per word)
- **Phase 4** (1000ms): Inline images blur-in from defocused to sharp (`blur-sharp` animation)
- **Phase 5** (1200ms): Promo banner slides up with a scale-spring bounce
- **Phase 6** (1500ms): Subtext and stats do a `tilt-in` 3D entrance (subtle perspective rotation)
- **Phase 7** (1800ms): CTAs elastic-in one after the other
- **Phase 8** (2200ms): Scroll indicator fades in with float

**Marquee enhancements:**
- Speed differential: top row 25s, bottom row 35s (creates depth)
- Add a third row (very faint, fastest) for subliminal depth
- Hover pauses animation smoothly

**Editorial Grid theatrics:**
- Cards enter with `tilt-in` (3D perspective) instead of simple translate
- On hover: image does Ken Burns + a gold scan-line sweeps across the card top
- Number labels do an `elastic-in` pop

**Category Cards:**
- Large card: continuous slow Ken Burns + a subtle gold shimmer overlay that sweeps periodically
- Stacked cards: `flip-in` entrance (3D Y-rotation)

**Testimonial:**
- Quote text does a `blur-in` transition between testimonials (blur out → blur in, not just fade)
- Star ratings do sequential `elastic-in` pops on section entry

**Dual CTA:**
- Panels enter with `flip-in` 3D rotation from their respective sides
- On hover: a gold `scan-line` sweeps vertically across the card

**Trust Badges:**
- Icons do `orbit-slow` rotation continuously (very subtle, like they're alive)
- Each badge does `pop-in` entrance with stagger

---

### Files Modified

1. **`HeroSection.tsx`** — Dark background, new copy, cinematic entrance choreography
2. **`MarqueeTicker.tsx`** — New cultural items, third row, speed tuning
3. **`EditorialGrid.tsx`** — New copy, tilt-in entrances, scan-line hover
4. **`CategoryCards.tsx`** — Flip-in entrances, shimmer overlay
5. **`TestimonialSection.tsx`** — New label, blur transitions, elastic stars
6. **`DualCtaSection.tsx`** — New copy, flip-in panels, scan-line hover
7. **`TrustBadges.tsx`** — Orbit icons, pop-in entrances
8. **`index.css`** — Third marquee row class, scan-line-on-hover utility

### What Does NOT Change
- Layout structure, routing, data fetching, cart, auth
- Navigation, Footer, FeaturedFrames
- Color palette tokens, typography system
- All existing keyframes/animations (we use what's already defined)

