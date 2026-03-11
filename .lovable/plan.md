

## Platform-Wide Refactoring Plan

### Why This Is Needed

The codebase has grown organically across dozens of features. The result:

1. **Three-layer import indirection** — 15+ shim files in `src/hooks/` and `src/components/admin/` that just re-export from `src/shared/` or `src/modules/`. Every consumer takes a different path to the same code.
2. **33 files** import `useAuth` from the old `@/hooks/useAuth` shim; 9 files import `useUserRole` from `@/hooks/useUserRole`. These should all point to `@/shared/hooks` directly.
3. **Bloated page components** — `Products.tsx` (506 lines), `ProductImages.tsx` (525 lines), `AdminUsers.tsx`, `PurchaseOrders.tsx`, `StockTransfers.tsx` all contain inline logic that should be extracted into hooks or sub-components.
4. **Inconsistent module boundaries** — some admin pages import from `@/modules/*`, some from `@/hooks/admin/*`, some from `@/shared/*`, and some mix all three in the same file.
5. **Orphaned legacy hooks** — `src/hooks/admin/useZohoSync.ts`, `src/hooks/admin/useNotifications.ts` etc. haven't been migrated to `src/modules/` yet, breaking the pattern.

### Refactoring Scope (Phased)

Given the size, this should be done in **3 focused phases** to avoid breaking changes.

---

#### Phase 1: Eliminate Re-Export Shims & Normalize Imports

**Goal**: One canonical import path per utility. Delete all 15 shim files.

- Update all 33 files importing `from "@/hooks/useAuth"` → `from "@/shared/hooks/useAuth"`
- Update all 9 files importing `from "@/hooks/useUserRole"` → `from "@/shared/hooks/useUserRole"`
- Update files importing `from "@/lib/utils"` → `from "@/shared/lib/utils"`
- Update files importing `from "@/lib/permissions"` → `from "@/shared/lib/permissions"`
- Update files importing `from "@/components/admin/AdminLayout"` (and Header, Sidebar, RoleGuard) → `from "@/shared/components/admin"`
- Update files importing `from "@/hooks/admin/useAdminProducts"` (and useFrameAttributes, useLensAttributes, useImportHistory, useECMSImport, useProductImageUpload) → `from "@/modules/products"`
- Update `from "@/lib/ecms-parser"` → `from "@/modules/products/lib"`
- **Delete** all 15 shim files once imports are updated

**Files changed**: ~50 consumer files + 15 shim deletions

---

#### Phase 2: Migrate Remaining Legacy Hooks to Modules

**Goal**: Complete the `src/modules/` migration so `src/hooks/admin/` can be fully removed.

Hooks not yet in modules:
- `useZohoSync` → new `src/modules/integrations/` module
- `useNotifications` → new `src/modules/notifications/` module
- `useBranchContext` → already in `src/modules/branches/` but old shim still exists
- `useCategories` → already in `src/modules/categories/` but old shim still exists
- `useInventoryOverview`, `useInventoryTransactions`, `usePurchaseOrders`, `useStockAdjustments`, `useStockTransfers` → already in `src/modules/inventory/` but old shims still exist
- `useServices` → already in `src/modules/services/` but old shim still exist
- `useSuppliers` → already in `src/modules/suppliers/` but old shim still exists
- `useUserInvitations` → already in `src/modules/users/` but old shim still exists

**Result**: Delete `src/hooks/admin/` directory entirely.

---

#### Phase 3: Extract Large Page Components

**Goal**: Break down 500+ line page files into focused sub-components and custom hooks.

- **`Products.tsx`** (506 lines) → Extract filter bar, product table, toolbar into sub-components; extract product CRUD orchestration into a page-level hook
- **`ProductImages.tsx`** (525 lines) → Extract stats cards, filter bar, gallery grid into sub-components
- **`AdminUsers.tsx`** → Extract user table, role management into sub-components
- **`PurchaseOrders.tsx`**, **`StockTransfers.tsx`** → Similar extraction pattern

Each page should ideally be under 150 lines — composing sub-components and a page-level hook.

---

### What Will NOT Change
- No database schema changes
- No new features or UI changes
- No changes to `src/integrations/supabase/*` (auto-generated)
- No changes to edge functions
- Component logic and behavior stays identical

### Execution Order
Phase 1 first (highest impact, lowest risk — just import path changes). Phase 2 next (move + delete). Phase 3 last (component extraction — most surgical).

