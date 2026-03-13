

## Platform Refactoring Plan — Structured Monolith Architecture

### Current State Assessment

The codebase has grown organically with code split across multiple overlapping locations:

```text
src/
├── components/        ← UI components (admin, storefront, etc.)
├── hooks/             ← 27 loose hooks (mixed concerns: cart, PWA, SEO, etc.)
├── modules/           ← Partially migrated domain modules (9 modules)
├── pages/             ← Page components (some bloated, e.g. Dashboard 364 lines)
├── shared/            ← Auth, roles, types, admin layout
├── services/          ← Offline sync (2 files)
├── lib/               ← Utilities (3 files)
├── config/            ← Snap lens config (1 file)
├── types/             ← Type declarations (3 files)
├── integrations/      ← Supabase client + types
└── routes/            ← Route definitions
```

**Key problems:**
1. **Scattered hooks** — 27 hooks in `src/hooks/` not organized by domain; some duplicated in `src/modules/`
2. **Components outside modules** — `src/components/admin/*` should live alongside their module
3. **Inconsistent imports** — 77 files import from `@/hooks/`, mixing with `@/shared/hooks` and `@/modules/`
4. **No clear layering** — services, lib, config scattered at root level
5. **Large page files** — Dashboard.tsx (364 lines), Checkout.tsx likely similar

### Target Architecture

Reorganize into a clean **feature-based monolith** with clear layers:

```text
src/
├── app/                    ← App shell (App.tsx, main.tsx, routes)
├── modules/                ← Feature modules (each self-contained)
│   ├── auth/               ← useAuth, Login, Signup, RoleGuard
│   ├── inventory/          ← hooks, components, pages, types
│   ├── products/           ← hooks, components, pages, types
│   ├── orders/             ← hooks, components (cart, checkout, tracking)
│   ├── appointments/       ← hooks, components, pages
│   ├── branches/           ← hooks, components, pages
│   ├── categories/         ← hooks, types
│   ├── suppliers/          ← hooks, types
│   ├── services/           ← hooks, components, pages
│   ├── users/              ← hooks, components, pages
│   ├── integrations/       ← Zoho sync hooks
│   ├── notifications/      ← hooks
│   ├── storefront/         ← Home, Eyewear, ProductDetail pages
│   ├── personalization/    ← onboarding, style quiz, face scan, VTO
│   └── dashboard/          ← Customer dashboard page + sections
├── shared/                 ← Cross-cutting concerns
│   ├── components/         ← ui/, Navigation, Footer, AdminLayout
│   ├── hooks/              ← use-mobile, use-toast, useSEO, usePWA
│   ├── lib/                ← utils, permissions
│   ├── types/              ← database types
│   └── services/           ← offline sync
├── integrations/           ← Supabase client (auto-generated)
└── assets/                 ← Images, logos
```

### Phased Implementation (6 phases, each self-contained)

**Phase 1: Consolidate hooks into modules** (highest impact, lowest risk)
- Move `useCart`, `useWishlist`, `useOrders` → `modules/orders/hooks/`
- Move `useAppointments` → `modules/appointments/hooks/`
- Move `useProducts`, `usePersonalizedProducts` → `modules/products/hooks/`
- Move `useBranches` (from `src/hooks/`) → delete (already in `modules/branches/`)
- Move `useProfile`, `useOnboardingStatus`, `useFaceMeasurement`, `useVirtualTryOn`, `useVTOEmailCapture`, `useTryOnTour`, `useStylePolls` → `modules/personalization/hooks/`
- Move `useMetaPixel`, `useSEO`, `usePerformance`, `useResourceHints` → `shared/hooks/`
- Move `usePWA`, `usePullToRefresh`, `useSwipeGesture`, `useScrollReveal`, `useCameraKit` → `shared/hooks/`
- Move `useOfflineMutation`, `useOfflineSync` → `shared/services/`
- Update all 77+ importing files to use new canonical paths

**Phase 2: Consolidate admin components into modules**
- Move `components/admin/inventory/` → `modules/inventory/components/`
- Move `components/admin/products/` → `modules/products/components/`
- Move `components/admin/categories/` → `modules/categories/components/`
- Move `components/admin/services/` → `modules/services/components/`
- Move `components/admin/users/` → `modules/users/components/`
- Move `components/admin/transfers/` → `modules/inventory/components/`
- Move `components/admin/purchase-orders/` → `modules/inventory/components/`
- Move `components/admin/adjustments/` → `modules/inventory/components/`
- Move `components/admin/settings/` → `modules/integrations/components/`
- Move `components/admin/onboarding/` → `modules/branches/components/`

**Phase 3: Consolidate storefront components**
- Create `modules/storefront/` with `components/` and `pages/`
- Move `components/home/`, `components/eyewear/`, `components/storefront/`, `components/product/` → `modules/storefront/components/`
- Move pages: Index, Eyewear, ProductDetail, About, Contact, FAQ, Partners, etc. → `modules/storefront/pages/`

**Phase 4: Create auth module and move admin layout**
- Create `modules/auth/` — move `useAuth`, `useUserRole`, Login, Signup pages, RoleGuard
- Move `shared/components/admin/` (AdminLayout, AdminSidebar, AdminHeader) → `shared/layouts/admin/`

**Phase 5: Decompose large page components**
- Break `Dashboard.tsx` (364 lines) into focused sub-components with a custom `useDashboard` hook
- Review and decompose any other pages exceeding ~200 lines (Checkout, Eyewear, etc.)

**Phase 6: Clean up barrel exports and verify**
- Update all barrel `index.ts` files per module
- Remove empty/orphaned files
- Verify all imports resolve correctly
- Run build to confirm zero errors

### Implementation approach

Each phase will be done as a separate message to keep changes reviewable. Phase 1 (hooks consolidation) delivers the most structural improvement and should be done first. All phases are purely file moves and import updates — no logic changes, no database changes.

