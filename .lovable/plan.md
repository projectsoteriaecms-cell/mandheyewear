

# M&H Eyewear — Reusable UI/UX Framework Blueprint

This is a documentation extraction, not an implementation task. Here is the complete framework you can replicate for another project.

---

## 1. Architecture Pattern

```text
src/
├── modules/          # Feature-based modules (auth, products, orders, storefront...)
│   └── [module]/
│       ├── components/
│       ├── hooks/
│       ├── types/
│       └── index.ts   # Public API barrel export
├── shared/           # Cross-cutting concerns
│   ├── hooks/        # useScrollReveal, useSEO, usePWA, usePerformance...
│   ├── layouts/      # AdminLayout, RoleGuard wrappers
│   ├── lib/          # utils (cn), permissions
│   └── components/
├── components/       # Global UI (Navigation, Footer, Cart, Search)
│   └── ui/           # shadcn/ui primitives (Button, Dialog, Dropdown...)
├── routes/           # Route definitions split by concern (public, admin)
├── pages/            # Page-level components
└── services/         # API/service layer
```

**Key principle**: Every module has a public `index.ts` barrel. Internal files are never imported directly from outside the module.

---

## 2. Design System (Color Palette + Tokens)

All colors are **HSL CSS variables** with light/dark mode variants:

| Token | Light Mode | Purpose |
|-------|-----------|---------|
| `--ink` | `240 30% 11%` | Deep charcoal — hero sections, dark blocks |
| `--cream` | `36 33% 96%` | Warm off-white — body background |
| `--mh-gold` | `45 100% 45%` | Primary luxury accent — CTAs, rings, focus |
| `--flame` | `14 100% 61%` | Urgency accent — sales, alerts, highlights |
| `--primary` | Maps to gold | Semantic primary |
| `--muted` | `36 15% 92%` | Subtle backgrounds |

**Dark mode** flips `--background` to ink and `--foreground` to cream. Gold gets brighter (`55%` lightness). All done via `.dark` class on `<html>`.

**Typography**: `font-display: Syne` (headings), `font-body: DM Sans` (body). Applied globally in `@layer base`.

**Gradients**: Pre-defined as CSS variables (`--gradient-hero`, `--gradient-gold`, `--gradient-flame`, `--gradient-subtle`).

**Shadows**: Layered system from `--shadow-sm` to `--shadow-float`, plus glow variants (`--shadow-gold`, `--shadow-glow-accent`).

**Easing**: Custom curves — `--ease-spring`, `--ease-smooth`, `--ease-bounce`, `--ease-expo-out`.

---

## 3. Editorial Section Rhythm

The homepage alternates between "Ink" (dark) and "Cream" (light) sections using utility classes:

- `.section-ink` — dark background, cream text
- `.section-cream` — cream background, ink text
- `.section-cream-grain` — cream + SVG noise texture overlay (premium tactile feel)

**Section sequence**: Hero (ink) → Marquee Ticker → Editorial Grid → Category Cards → Testimonials → Featured Products → Dual CTA → Trust Badges

---

## 4. Animation System

### Scroll Reveal (`useScrollReveal`)
- Intersection Observer with configurable `threshold` (0.15 default) and `rootMargin`
- Returns `{ ref, inView, hasRevealed }` — attach `ref` to element, conditionally apply animation classes based on `inView`
- `useStaggerReveal` variant for staggered child animations with computed delay
- **Respects `prefers-reduced-motion`** — reveals immediately if enabled

### CSS Animation Utilities
- `.stagger-delay-1` through `.stagger-delay-6` — pre-built animation delays
- `.hover-lift` — translate-Y + shadow on hover with spring easing
- `.hover-tilt` — 3D perspective card tilt
- `.hover-glow` / `.hover-glow-accent` — glow box-shadow on hover
- `.shimmer-bg` — animated gradient shimmer for CTAs
- `.glass` / `.glass-dark` — glassmorphism with backdrop blur

### Hero Beats (rotating headline)
- State-driven `useState` + `setInterval` cycling through narrative "beats" every 2.5s
- Three lines: Line 1 and Line 3 swap text; Line 2 (`OUTL👓K`) stays fixed as visual anchor
- Word-by-word crossfade using `clipPath` reveals

---

## 5. Navigation Pattern

### Desktop
- Fixed header: `TopBar` (utility strip) + `MainNav` (logo, category links, icon actions)
- Icon actions: Search (dialog), Wishlist, Cart (drawer), Account (dropdown)
- Highlighted feature links styled differently (flame color, icon prefix)

### Mobile
- Fixed `MobileTopBar` at top
- Fixed `MobileBottomNav` at bottom (native app feel)
- `pb-20` to `pb-24` safe-area padding on content to clear bottom nav
- `env(safe-area-inset-bottom)` for notched devices

---

## 6. Component Library

Built on **shadcn/ui** (Radix + Tailwind):
- All primitives in `src/components/ui/` (Button, Dialog, Dropdown, Tooltip, etc.)
- `cn()` utility from `clsx` + `tailwind-merge` for conditional class merging
- Icons from `@phosphor-icons/react` with `weight="light"` or `weight="duotone"`

---

## 7. Performance Hooks

| Hook | Purpose |
|------|---------|
| `useDebounce` | Debounce values for search inputs |
| `useThrottle` | Throttle scroll/resize handlers |
| `useIntersectionObserver` | Generic IO hook |
| `usePreload` / `usePrefetch` / `useDnsPrefetch` | Resource hint injection |
| `useCountUp` | requestAnimationFrame number animation |

---

## 8. Mobile-First Responsive Rules

- Hero: `min-h-0` (content-sized, not viewport-forced), responsive `clamp()` font sizing
- CTAs: `whitespace-nowrap` with reduced padding for single-line display
- Grids: Single column on mobile → 2-col on `md` → multi-col on `lg`
- Marquee third row hidden on mobile
- Trust badges: 2x2 grid on small screens

---

## 9. Backend Integration Pattern (Lovable Cloud / Supabase)

- Single client import: `import { supabase } from "@/integrations/supabase/client"`
- Auto-generated types: `src/integrations/supabase/types.ts` (never edit)
- Auth via `useAuth()` hook from `src/modules/auth/hooks/`
- Role-based access: separate `user_roles` table with `has_role()` security definer function
- Edge functions for AI features (virtual try-on, etc.)
- RLS policies on all tables

---

## 10. Key Reusable Patterns

- **SEO**: `useSEO()` hook sets document title/meta; `<JsonLd>` component for structured data
- **PWA**: `usePWA()` hook + `InstallPrompt` + `OfflineIndicator` components
- **Search**: `SearchDialog` modal with keyboard shortcut
- **Cart**: Drawer-based cart (`CartDrawer`) accessible from nav
- **Admin**: `AdminLayout` with sidebar + header, wrapped in `RoleGuard`
- **Scroll Progress**: Fixed gold progress bar at viewport top

---

## Quick-Start Checklist for a New Project

1. Set up Tailwind + shadcn/ui + Phosphor Icons
2. Define HSL color tokens in `index.css` (light + dark) — use the ink/cream/accent pattern
3. Add `font-display` and `font-body` to Tailwind config
4. Copy the utility classes (`.section-ink`, `.section-cream-grain`, `.hover-lift`, `.glass`, etc.)
5. Copy `useScrollReveal` and `useStaggerReveal` hooks
6. Build Navigation with fixed header + mobile bottom nav pattern
7. Structure modules as `src/modules/[feature]/` with barrel exports
8. Use the editorial alternating-section rhythm for landing pages

