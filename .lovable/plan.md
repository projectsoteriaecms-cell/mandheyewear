

## Phase 6: Cleanup Re-export Shims and Update All Imports

### Summary

Remove ~80 re-export shim files created during Phases 1-4 by updating all consumer files to import directly from canonical module paths. This eliminates the indirection layer and completes the structured monolith transition.

### Scope

**Three categories of shims to remove:**

1. **`src/hooks/` shims** (27 files) — redirect to `@/modules/*/hooks/` or `@/shared/hooks/`
2. **`src/components/admin/` shims** (~35 files) — redirect to `@/modules/*/components/`
3. **`src/components/eyewear/`, `src/components/home/`, `src/components/storefront/` shims** (~19 files) — redirect to `@/modules/storefront/components/`
4. **`src/shared/components/admin/` shims** (~13 files) — redirect to `@/shared/layouts/admin/`
5. **`src/shared/hooks/useAuth.ts` and `useUserRole.ts` shims** (2 files) — redirect to `@/modules/auth/hooks/`
6. **`src/pages/Login.tsx` and `Signup.tsx` shims** (2 files) — redirect to `@/modules/auth/pages/`

### Consumer files to update (~70 files)

**Group A: `@/hooks/*` → `@/modules/*/hooks/*` or `@/shared/hooks/*`** (69 consumer files)

| Old import | New import | Consumers |
|---|---|---|
| `@/hooks/use-toast` | `@/shared/hooks/use-toast` | 22 files |
| `@/hooks/useProducts` | `@/modules/products/hooks/useProducts` | 13 files |
| `@/hooks/useCart` | `@/modules/orders/hooks/useCart` | 6 files |
| `@/hooks/useMetaPixel` | `@/shared/hooks/useMetaPixel` | 5 files |
| `@/hooks/useProfile` | `@/modules/personalization/hooks/useProfile` | 8 files |
| `@/hooks/useVirtualTryOn` | `@/modules/personalization/hooks/useVirtualTryOn` | 6 files |
| `@/hooks/useAppointments` | `@/modules/appointments/hooks/useAppointments` | 3 files |
| `@/hooks/useWishlist` | `@/modules/orders/hooks/useWishlist` | 3 files |
| `@/hooks/useBranches` | `@/modules/branches/hooks/useBranches` | 3 files |
| `@/hooks/useOnboardingStatus` | `@/modules/personalization/hooks/useOnboardingStatus` | 2 files |
| `@/hooks/usePersonalizedProducts` | `@/modules/personalization/hooks/usePersonalizedProducts` | 2 files |
| `@/hooks/useFaceMeasurement` | `@/modules/personalization/hooks/useFaceMeasurement` | 1 file |
| `@/hooks/useStylePolls` | `@/modules/personalization/hooks/useStylePolls` | 1 file |
| `@/hooks/useVTOEmailCapture` | `@/modules/personalization/hooks/useVTOEmailCapture` | 1 file |
| `@/hooks/useTryOnTour` | `@/modules/personalization/hooks/useTryOnTour` | 1 file |
| `@/hooks/useCameraKit` | `@/shared/hooks/useCameraKit` | 2 files |
| `@/hooks/usePWA` | `@/shared/hooks/usePWA` | 2 files |
| `@/hooks/useSEO` | `@/shared/hooks/useSEO` | 5 files |
| `@/hooks/use-mobile` | `@/shared/hooks/use-mobile` | 1 file |
| `@/hooks/useOfflineSync` | `@/shared/hooks/useOfflineSync` | 1 file |
| `@/hooks/usePullToRefresh` | `@/shared/hooks/usePullToRefresh` | 1 file |

**Group B: `@/components/admin/*` → `@/modules/*/components/*`** (12 page files)

| Page file | Imports to update |
|---|---|
| `pages/admin/Products.tsx` | 9 component imports → `@/modules/products/components` |
| `pages/admin/ProductImages.tsx` | 4 component imports → `@/modules/products/components` |
| `pages/admin/Categories.tsx` | 3 component imports → `@/modules/categories/components` |
| `pages/admin/Services.tsx` | 2 component imports → `@/modules/services/components` |
| `pages/admin/AdminUsers.tsx` | 2 component imports → `@/modules/users/components` |
| `pages/admin/Dashboard.tsx` | 1 import → `@/modules/branches/components` |
| `pages/admin/Inventory.tsx` | 1 import → `@/modules/inventory/components` |
| `pages/admin/StockAdjustments.tsx` | 1 import → `@/modules/inventory/components` |
| `pages/admin/StockTransfers.tsx` | 1 import → `@/modules/inventory/components` |
| `pages/admin/PurchaseOrders.tsx` | 1 import → `@/modules/inventory/components` |
| `pages/admin/Settings.tsx` | 1 import → `@/modules/integrations/components` |
| `pages/admin/products/ProductsTable.tsx` | 1 import → `@/modules/products/components` |

**Group C: `@/components/eyewear/*` → `@/modules/storefront/components/eyewear/*`** (2 files)

- `pages/Eyewear.tsx` (6 imports)
- `pages/ProductDetail.tsx` (1 import)

**Group D: `@/shared/components/admin` → `@/shared/layouts/admin` or `@/modules/auth`** (17 page files)

| Old import | New import | Consumers |
|---|---|---|
| `@/shared/components/admin` (AdminLayout, RoleGuard) | `@/shared/layouts/admin` + `@/modules/auth/components` | All 17 admin pages |
| `@/shared/components/admin/dashboard/*` | `@/shared/layouts/admin/dashboard/*` | Dashboard, Inventory |
| `@/shared/hooks/useAuth` | `@/modules/auth/hooks/useAuth` | 41 files |
| `@/shared/hooks/useUserRole` | `@/modules/auth/hooks/useUserRole` | 21 files |

**Group E: Page shims** (2 files)
- `pages/Login.tsx` and `pages/Signup.tsx` — these are used by the router, so they stay as shims (router expects default exports from `pages/`)

### Files to delete after updates (~78)

- All 27 files in `src/hooks/` (the entire directory)
- ~19 shim files in `src/components/eyewear/`, `src/components/home/`, `src/components/storefront/`
- ~35 shim files in `src/components/admin/` (all subdirectories)
- ~13 shim files in `src/shared/components/admin/` (layout shims)
- 2 shim files in `src/shared/hooks/` (useAuth, useUserRole)

**Note:** `src/pages/Login.tsx` and `src/pages/Signup.tsx` remain as shims since the router imports from `@/pages/`.

### Execution order

1. Update all ~70 consumer files to use canonical import paths
2. Update barrel exports (`src/shared/hooks/index.ts`, `src/shared/components/admin/index.ts`, `src/shared/index.ts`) to point to canonical sources
3. Delete shim files and empty directories
4. Verify `src/components/ui/use-toast.ts` and `src/components/ui/toaster.tsx` (these import from `@/hooks/use-toast` and need updating too)

### No database or logic changes

Purely import path updates and file deletions.

