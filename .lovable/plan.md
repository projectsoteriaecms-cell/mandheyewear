

## Landing Page UX Overhaul — Hypnotic Editorial Experience

The current page is static and flat. Every section loads immediately with no motion, no reveals, no theatrics. This plan transforms it into an immersive, scroll-driven editorial experience that's hard to look away from.

### Design Philosophy
Merge a fashion lookbook's drama with clinical precision's trust. Every scroll should feel like turning a page of a luxury magazine — elements reveal themselves with choreographed timing, images breathe and shift, and the eye is guided through a visual story.

---

### Changes

**1. New hook: `useScrollReveal.ts`** — Intersection Observer-based scroll animation trigger
- Watches elements as they enter the viewport
- Applies staggered CSS class transitions (fade, slide, scale)
- Configurable threshold and delay per element
- Used by every section for choreographed reveals

**2. Rewrite: `HeroSection.tsx`** — Full-viewport cinematic hero
- **Full viewport height** (`min-h-screen`) with a layered parallax feel
- **Animated text reveal**: Each word of "where vision lives — now" clips in sequentially with `text-reveal` animation on load (not on scroll — this is the opening hook)
- **Floating product images**: The inline images get a continuous `float-slow` animation so they gently drift, creating life
- **Parallax-layered background**: Subtle radial gradient that shifts with a CSS animation (slow `breathe` pulse on a gold glow behind the headline)
- **Promo banner**: Stays but gets a shimmer sweep animation across it on load
- **Stats counter**: Numbers animate up from 0 using a `useCountUp` hook when they scroll into view
- **CTAs**: Magnetic hover effect — buttons subtly shift toward cursor direction on hover
- **Scroll indicator**: A small animated chevron/line at the bottom pulsing to invite scrolling

**3. Rewrite: `MarqueeTicker.tsx`** — Dual-direction ticker with glow
- **Two rows** scrolling in opposite directions (like the VELOUR reference)
- Top row: brand keywords scrolling left
- Bottom row: different keywords scrolling right (slower speed)
- Gold glow line separating the two
- Text size increase — bolder presence
- Slight vertical padding increase for drama

**4. Rewrite: `EditorialGrid.tsx`** — Scroll-revealed numbered cards
- Each card uses `useScrollReveal` to fade + slide up with staggered delays
- On hover: image does a slow Ken Burns zoom + the gradient overlay darkens
- Number labels get a subtle `scale-spring` pop when they enter viewport
- The section header "See differently." gets a `text-reveal` clip animation on scroll

**5. Rewrite: `CategoryCards.tsx`** — Cinematic reveal + hover depth
- Large card: Ken Burns slow zoom animation continuously playing
- All cards: `hover-tilt` 3D perspective shift on hover
- Scroll-triggered `cascade` reveal animation with stagger
- Badge counts get a subtle `pulse-soft` animation

**6. Rewrite: `TestimonialSection.tsx`** — Auto-rotating spotlight
- Auto-cycle through testimonials every 5 seconds with a crossfade transition
- Show one large featured quote at a time (not 3-column grid)
- Large opening quotation mark with `float-gentle` animation
- Star rating sparkles with `glow-pulse`
- Manual dot navigation below

**7. Rewrite: `DualCtaSection.tsx`** — Split-screen reveal
- Each panel slides in from its respective side (left panel from left, right from right) on scroll
- Hover: image scale + gold glow bloom from the bottom corner
- A thin animated gold line divides the two panels

**8. Rewrite: `TrustBadges.tsx`** — Ticker-style trust bar
- Convert to a secondary marquee that scrolls horizontally on mobile
- On desktop: staggered `pop-in` animation when scrolling into view

**9. New: `ScrollProgress.tsx`** — Gold progress bar
- Thin gold line at the very top of the viewport (fixed) showing scroll progress
- Adds a sense of intentional journey through the page

**10. Update: `Index.tsx`**
- Add `ScrollProgress` component
- All sections wrapped with scroll reveal triggers

**11. New hook: `useCountUp.ts`**
- Animates numbers from 0 to target value
- Triggered by intersection observer
- Used in hero stats (50K+, 5+, 2,800+)

**12. CSS additions in `index.css`**
- `.marquee-reverse` for opposite-direction ticker
- `.scroll-progress-bar` fixed positioning
- Smooth scroll behavior on html element

### What Does NOT Change
- Navigation, Footer, routing, data fetching, cart, auth
- FeaturedFrames (database-driven, separate concern)
- Color palette, typography (Syne + DM Sans), design tokens
- Mobile bottom nav

### Technical Notes
- All animations use existing Tailwind keyframes + CSS classes (no new JS animation libraries)
- `useScrollReveal` uses native `IntersectionObserver` — zero dependencies
- `useCountUp` uses `requestAnimationFrame` — lightweight
- Testimonial auto-rotation uses `setInterval` with cleanup
- `prefers-reduced-motion` media query respected — all animations disabled for accessibility
- No layout shift — elements have explicit dimensions before animation triggers

