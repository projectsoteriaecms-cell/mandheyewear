

## Phase 2: Move Admin Components into Domain Modules

### Summary

Move all 30+ component files from `src/components/admin/` into their respective domain modules under `src/modules/[domain]/components/`. Leave re-export shims in the original locations for backward compatibility (same pattern as Phase 1).

### Component Mapping

| Source (`src/components/admin/`) | Destination (`src/modules/`) |
|---|---|
| `inventory/BulkStockImportDialog.tsx` | `modules/inventory/components/` |
| `adjustments/CreateAdjustmentDialog.tsx` | `modules/inventory/components/` |
| `transfers/CreateStockTransferDialog.tsx` | `modules/inventory/components/` |
| `purchase-orders/CreatePurchaseOrderDialog.tsx` | `modules/inventory/components/` |
| `products/*.tsx` (19 files + `ecms-import/` subfolder with 7 files) | `modules/products/components/` |
| `categories/*.tsx` (3 files) | `modules/categories/components/` |
| `services/*.tsx` (2 files) | `modules/services/components/` |
| `users/*.tsx` (3 files) | `modules/users/components/` |
| `settings/WarehouseMappingCard.tsx` | `modules/integrations/components/` |
| `onboarding/WelcomeBranchDialog.tsx` | `modules/branches/components/` |

### Files to create (~35 new component files + barrel exports)

**For each domain module**, create:
1. `components/` directory with the actual component files (copied from source)
2. `components/index.ts` barrel export
3. Update the module's root `index.ts` to re-export components

**Inventory module** (`src/modules/inventory/components/`):
- `BulkStockImportDialog.tsx`
- `CreateAdjustmentDialog.tsx`
- `CreateStockTransferDialog.tsx`
- `CreatePurchaseOrderDialog.tsx`
- `index.ts`

**Products module** (`src/modules/products/components/`):
- All 19 `.tsx` files from `src/components/admin/products/`
- `ecms-import/` subfolder (7 files)
- `index.ts`

**Categories module** (`src/modules/categories/components/`):
- `SortableCategoryRow.tsx`, `CreateCategoryDialog.tsx`, `EditCategoryDialog.tsx`
- `index.ts`

**Services module** (`src/modules/services/components/`):
- `CreateServiceDialog.tsx`, `EditServiceDialog.tsx`
- `index.ts`

**Users module** (`src/modules/users/components/`):
- `InviteUserDialog.tsx`, `PendingInvitationsList.tsx`, `BranchAssignmentDialog.tsx`
- `index.ts`

**Integrations module** (`src/modules/integrations/components/`):
- `WarehouseMappingCard.tsx`
- `index.ts`

**Branches module** (`src/modules/branches/components/`):
- `WelcomeBranchDialog.tsx`
- `index.ts`

### Files to modify (re-export shims)

Convert each original file in `src/components/admin/` to a re-export shim pointing to the new location. This ensures the 12 page files that import from `@/components/admin/` continue working without immediate changes:

- `src/components/admin/inventory/BulkStockImportDialog.tsx` → re-export from `@/modules/inventory/components`
- `src/components/admin/inventory/index.ts` → re-export from `@/modules/inventory/components`
- `src/components/admin/adjustments/CreateAdjustmentDialog.tsx` → re-export
- `src/components/admin/transfers/CreateStockTransferDialog.tsx` → re-export
- `src/components/admin/purchase-orders/CreatePurchaseOrderDialog.tsx` → re-export
- All 19 files in `src/components/admin/products/` → re-export
- `src/components/admin/products/ecms-import/*.ts(x)` → re-export
- 3 files in `categories/`, 2 in `services/`, 3 in `users/` → re-export
- `src/components/admin/settings/WarehouseMappingCard.tsx` → re-export
- `src/components/admin/onboarding/WelcomeBranchDialog.tsx` → re-export

### Internal cross-references to handle

Some product components import from siblings (e.g., `DraggableImageItem` imports from `./ProductImageUpload`, `QuickImageUploadModal` imports from `./DraggableImageItem`). These relative imports will continue to work since all files move together into the same `modules/products/components/` directory. The `ecms-import/` subfolder's relative imports to `./types` also remain intact.

### No database or edge function changes needed

This is purely a file reorganization with zero logic changes.

