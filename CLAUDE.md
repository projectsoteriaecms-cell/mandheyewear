# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run build:dev    # Build in development mode
npm run lint         # ESLint
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build locally
```

There is no global test runner for a single file — Vitest picks up all `*.test.ts` / `*.spec.ts` files automatically. To narrow: `npm run test -- path/to/file`.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_PAYSTACK_PUBLIC_KEY` | Paystack test key (no real charges) |
| `VITE_PAYSTACK_LIVE_KEY` | Paystack live key (leave blank in dev) |
| `VITE_SNAP_CAMERA_KIT_TOKEN` | Snap Camera Kit JWT for AR try-on |
| `VITE_SNAP_LENS_GROUP_ID` | Snap lens group for the try-on lens |

## Architecture

### Tech Stack

React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix primitives), TanStack Query v5, React Router v6, Supabase (Postgres + Auth + Storage + Edge Functions), Paystack payments, Snap Camera Kit + MediaPipe for AR virtual try-on, PWA via `vite-plugin-pwa`.

Deployed on **Vercel** (frontend, SPA rewrites) and **Supabase** (backend + edge functions). The canonical dev platform is [Lovable](https://lovable.dev/projects/31c03b66-b620-46f7-835e-73b45daacdf8) — commits pushed there auto-sync here.

### Directory Layout

```
src/
  modules/      # Feature modules (see below)
  pages/        # Thin page-level wrappers mounted by routes
  routes/       # public.routes.tsx + admin.routes.tsx — all lazy-loaded
  components/   # Legacy UI components (being migrated into modules)
  shared/       # Cross-cutting: hooks, layouts, lib, types
  integrations/ # Supabase client + auto-generated DB types
  lib/          # Small utilities (not shared across modules)
supabase/
  functions/    # Deno edge functions (~45 functions)
  migrations/   # SQL migration files
```

### Module System

`src/modules/` organises all business features. Each module exposes only its `index.ts` barrel — **never import from a module's internal subfolder** from outside it.

```
modules/
  auth/          products/      orders/        personalization/
  appointments/  branches/      categories/    crm/
  integrations/  inventory/     lens/          notifications/
  prescriptions/ services/      storefront/    suppliers/  users/
```

**Cross-module communication uses the event bus** (`src/shared/lib/events.ts`), not direct hook imports. Use the typed helpers:

```ts
import { emit, on } from '@/shared/lib/events';
emit('auth.login_completed', { userId, email });           // in auth module
const unsub = on('auth.login_completed', ({ userId }) => { ... }); // in any module
```

All platform events are declared in `PlatformEvents` in `events.ts`; add new ones there to get compile-time type safety. The dependency order is a DAG: Auth has no dependencies; Orders/Products/Personalization depend on Auth; nothing may depend on Orders or Personalization.

See `src/modules/MODULE_CONTRACTS.md` for the full contract specification and migration checklist.

### Routing

`src/routes/public.routes.tsx` and `admin.routes.tsx` export lazy-loaded route arrays. Both use a `lazyRetry` wrapper that automatically reloads on stale-chunk errors after deployments. All pages in `src/pages/` are lazy-loaded via this pattern.

Admin routes live under `/admin/*` and are wrapped in `AdminLayout` from `src/shared/layouts/admin/`.

### Supabase Integration

The Supabase client is a singleton at `src/integrations/supabase/client.ts`. Import it as:

```ts
import { supabase } from '@/integrations/supabase/client';
```

`src/integrations/supabase/types.ts` is auto-generated — do not edit it manually. Regenerate with the Supabase CLI (`supabase gen types typescript`).

Edge functions live in `supabase/functions/`. Functions with `verify_jwt = false` in `supabase/config.toml` are publicly callable (e.g. `analyze-face`, `virtual-try-on`, `sitemap`).

### Product Image Rendering

All product thumbnails must use the `.product-surface` CSS class defined in `src/index.css`. This class sets the white radial-gradient background, contact shadow, `object-contain`, and the global 1.45× frame scale rule.

```html
<div data-surface="card" class="product-surface ...">
  <img src={imageUrl} alt={name} />
</div>
```

Use `data-surface="card"` for grid/list cards (applies 1.45× scale), `data-surface="list"` for compact list rows, and no `data-surface` for PDP (natural size). Never set `bg-muted` or `object-cover` on a product image tile — it will break the visual consistency.

### Telemetry

`src/shared/lib/telemetry.ts` writes fire-and-forget events to the `platform_events` table. It never throws and never blocks. It captures anonymous visitors (via `sessionStorage` session ID) through to signed-in users for full journey tracking. Do not add `await` to telemetry calls.

### PWA

The app is a PWA. `public/manifest.json` and `vite-plugin-pwa` handle service worker registration. The `vercel.json` sets `no-cache` headers on `sw.js`, `registerSW.js`, and `manifest.webmanifest` to prevent stale worker issues.

### Path Alias

`@/` maps to `src/`. Always use `@/` for imports within the project.
