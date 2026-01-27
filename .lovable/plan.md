

# Modular Monolith Architecture Refactoring Plan

## Executive Summary

This plan restructures the ECMS platform into a clean **modular monolith architecture** where each business domain (Products, Inventory, Users, Branches) is self-contained with its own components, hooks, types, and utilities. This improves maintainability, reduces cognitive load, and makes it easier to navigate and extend features.

---

## Current State Analysis

### Problems Identified

1. **Scattered Domain Logic**: Product import logic spans 4+ files across different folders
2. **Flat Hook Structure**: 16 hooks in `src/hooks/admin/` without domain grouping
3. **Large Monolithic Components**: `ECMSImportDialog.tsx` is 631 lines with mixed concerns
4. **Centralized Routing**: All 30+ routes defined in a single `App.tsx`
5. **No Type Co-location**: Domain types scattered or defined inline
6. **Utility Sprawl**: `ecms-parser.ts` (654 lines) could be split by concern

### Current Structure

```text
src/
  components/
    admin/           (flat, mixed domains)
    cart/
    checkout/
  hooks/
    admin/           (flat, 16 files)
    useProducts.ts   (customer-facing)
  lib/
    ecms-parser.ts   (massive, single file)
  pages/
    admin/           (14 files, no grouping)
```

---

## Target Architecture

### New Module-Based Structure

```text
src/
  modules/
    products/
      components/
        ProductsPage.tsx
        ProductTable.tsx
        ProductDialogs.tsx
        import/
          ECMSImportDialog.tsx
          ImportHistoryPanel.tsx
          ImportProgress.tsx
      hooks/
        useProducts.ts
        useECMSImport.ts
        useImportHistory.ts
        useFrameAttributes.ts
        useLensAttributes.ts
        useProductImageUpload.ts
      lib/
        ecms-parser.ts
        price-utils.ts
      types/
        index.ts
      index.ts (public exports)

    inventory/
      components/
        InventoryPage.tsx
        StockOverview.tsx
        PurchaseOrdersPage.tsx
        StockTransfersPage.tsx
        AdjustmentsPage.tsx
        TransactionsPage.tsx
      hooks/
        useInventoryOverview.ts
        usePurchaseOrders.ts
        useStockTransfers.ts
        useStockAdjustments.ts
        useInventoryTransactions.ts
      types/
        index.ts
      index.ts

    suppliers/
      components/
        SuppliersPage.tsx
        SupplierForm.tsx
      hooks/
        useSuppliers.ts
      types/
        index.ts
      index.ts

    users/
      components/
        UsersPage.tsx
        InviteUserDialog.tsx
        PendingInvitations.tsx
        BranchAssignment.tsx
      hooks/
        useUserInvitations.ts
        useUserRole.ts
      types/
        index.ts
      index.ts

    branches/
      components/
        AdminBranchesPage.tsx
        BranchCard.tsx
      hooks/
        useBranches.ts
        useBranchContext.ts
      types/
        index.ts
      index.ts

    categories/
      components/
        CategoriesPage.tsx
        CategoryDialogs.tsx
        SortableCategoryRow.tsx
      hooks/
        useCategories.ts
      types/
        index.ts
      index.ts

    services/
      components/
        ServicesPage.tsx
        ServiceDialogs.tsx
      hooks/
        useServices.ts
      types/
        index.ts
      index.ts

  shared/
    components/
      admin/
        AdminLayout.tsx
        AdminSidebar.tsx
        AdminHeader.tsx
        RoleGuard.tsx
      ui/              (keep existing)
    hooks/
      useAuth.ts
      use-mobile.tsx
      use-toast.ts
    lib/
      utils.ts
      permissions.ts
    types/
      database.ts      (re-exports from Supabase types)

  routes/
    index.tsx          (main router)
    admin.routes.tsx   (admin route definitions)
    public.routes.tsx  (customer-facing routes)
```

---

## Implementation Phases

### Phase 1: Core Architecture Setup

**Goal**: Establish the folder structure, shared utilities, and routing patterns.

**Tasks**:
1. Create `src/modules/` directory structure
2. Create `src/shared/` directory with extracted shared components
3. Create `src/routes/` with modular route definitions
4. Set up barrel exports (index.ts) pattern for each module
5. Update path aliases in `vite.config.ts` for cleaner imports:
   - `@/modules/*`
   - `@/shared/*`
   - `@/routes/*`

**Files to Create**:
- `src/routes/index.tsx` - Main router component
- `src/routes/admin.routes.tsx` - Admin route configuration
- `src/routes/public.routes.tsx` - Public route configuration
- `src/shared/types/database.ts` - Type re-exports

### Phase 2: Products Module Migration

**Goal**: Consolidate all product-related code into a self-contained module.

**Tasks**:
1. Move and split `ECMSImportDialog.tsx` (631 lines) into:
   - `ImportWizard.tsx` (orchestration)
   - `ImportSteps/UploadStep.tsx`
   - `ImportSteps/MappingStep.tsx`
   - `ImportSteps/PreviewStep.tsx`
   - `ImportSteps/OptionsStep.tsx`
   - `ImportSteps/ProgressStep.tsx`
   - `ImportSteps/SummaryStep.tsx`

2. Move product hooks:
   - `useAdminProducts.ts` -> `modules/products/hooks/`
   - `useECMSImport.ts` -> `modules/products/hooks/`
   - `useImportHistory.ts` -> `modules/products/hooks/`
   - `useFrameAttributes.ts` -> `modules/products/hooks/`
   - `useLensAttributes.ts` -> `modules/products/hooks/`
   - `useProductImageUpload.ts` -> `modules/products/hooks/`

3. Split `src/lib/ecms-parser.ts` (654 lines) into:
   - `modules/products/lib/column-mappings.ts`
   - `modules/products/lib/parsers.ts`
   - `modules/products/lib/validators.ts`
   - `modules/products/lib/transformers.ts`

4. Create `modules/products/types/index.ts` with domain types

5. Create `modules/products/index.ts` barrel export

### Phase 3: Inventory Module Migration

**Goal**: Group all inventory operations into a cohesive module.

**Tasks**:
1. Create `modules/inventory/` structure
2. Move inventory hooks:
   - `useInventoryOverview.ts`
   - `usePurchaseOrders.ts`
   - `useStockTransfers.ts`
   - `useStockAdjustments.ts`
   - `useInventoryTransactions.ts`

3. Move inventory pages and components:
   - `pages/admin/Inventory.tsx` -> `modules/inventory/components/`
   - `pages/admin/PurchaseOrders.tsx` -> `modules/inventory/components/`
   - `pages/admin/StockTransfers.tsx` -> `modules/inventory/components/`
   - `pages/admin/StockAdjustments.tsx` -> `modules/inventory/components/`
   - `pages/admin/InventoryTransactions.tsx` -> `modules/inventory/components/`
   - `components/admin/purchase-orders/*`
   - `components/admin/transfers/*`
   - `components/admin/adjustments/*`

4. Create inventory-specific types file

### Phase 4: Remaining Admin Modules

**Goal**: Migrate Users, Branches, Categories, Services, and Suppliers modules.

**Tasks** (per module pattern):
1. Create module folder structure
2. Move relevant hooks
3. Move relevant components and pages
4. Create types file
5. Create barrel export

### Phase 5: Shared Components Extraction

**Goal**: Move truly shared admin components to `src/shared/`.

**Tasks**:
1. Move to `src/shared/components/admin/`:
   - `AdminLayout.tsx`
   - `AdminSidebar.tsx`
   - `AdminHeader.tsx`
   - `RoleGuard.tsx`

2. Keep `src/components/ui/` unchanged (already generic)

3. Move shared hooks to `src/shared/hooks/`:
   - `useAuth.ts`
   - `use-mobile.tsx`
   - `use-toast.ts`

### Phase 6: Update Imports and Clean Up

**Goal**: Update all import paths and remove old files.

**Tasks**:
1. Update App.tsx to use new route structure
2. Update AdminSidebar navigation
3. Remove old empty directories
4. Verify no circular dependencies
5. Run TypeScript check for import errors

---

## Technical Details

### Barrel Export Pattern

Each module will have an `index.ts` that explicitly exports its public API:

```typescript
// modules/products/index.ts
export { ProductsPage } from './components/ProductsPage';
export { useProducts, useAdminProducts } from './hooks/useProducts';
export { useECMSImport } from './hooks/useECMSImport';
export type { Product, ParsedProduct } from './types';
```

### Route Configuration Pattern

```typescript
// routes/admin.routes.tsx
import { lazy } from 'react';

const ProductsPage = lazy(() => import('@/modules/products/components/ProductsPage'));
const InventoryPage = lazy(() => import('@/modules/inventory/components/InventoryPage'));

export const adminRoutes = [
  { path: '/admin/products', element: <ProductsPage /> },
  { path: '/admin/inventory', element: <InventoryPage /> },
  // ...
];
```

### Import Alias Updates

```typescript
// vite.config.ts additions
resolve: {
  alias: {
    '@/modules': path.resolve(__dirname, './src/modules'),
    '@/shared': path.resolve(__dirname, './src/shared'),
    '@/routes': path.resolve(__dirname, './src/routes'),
  },
},
```

---

## Migration Strategy

### Approach: Incremental Migration

We will use a **strangler fig** pattern:
1. Create new module structure alongside existing code
2. Move files one module at a time
3. Update imports to point to new locations
4. Delete old files only after verification
5. Each phase results in a working application

### Risk Mitigation

- **No Big Bang**: Each phase is independently deployable
- **Type Safety**: TypeScript will catch broken imports
- **Testing**: Manual testing after each module migration
- **Rollback**: Git makes reverting straightforward if issues arise

---

## Expected Benefits

1. **Discoverability**: All product code in one place (`modules/products/`)
2. **Smaller Files**: ECMSImportDialog split from 631 lines to ~100 lines each
3. **Clear Boundaries**: Each module has explicit public API via barrel exports
4. **Easier Onboarding**: New developers can focus on one module
5. **Reduced Conflicts**: Teams can work on different modules independently
6. **Lazy Loading**: Route-based code splitting for better performance

---

## Files Summary

### New Files to Create (~40 files)

- 6 route files
- 8 module index/barrel files
- 15 split component files (from ECMSImportDialog)
- 4 split parser files (from ecms-parser.ts)
- 7 types files

### Files to Move (~35 files)

- 16 hooks from `hooks/admin/`
- 14 pages from `pages/admin/`
- 5 component directories from `components/admin/`

### Files to Delete (after migration)

- Old empty directories
- Original large files (after split)

---

## Next Steps

After approval, I will implement this in the following order:
1. Phase 1: Core architecture and routing setup
2. Phase 2: Products module (most complex, highest impact)
3. Phase 3: Inventory module
4. Phase 4-6: Remaining modules and cleanup

Each phase will be a separate implementation session to ensure stability.

