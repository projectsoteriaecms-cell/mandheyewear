
# Phosphor Icons Migration - Phase 2
## Continue Migration for Admin, Dashboard, and Remaining Components

---

## Overview

This phase completes the migration from Lucide React to Phosphor Icons across all remaining admin pages, dialogs, dashboard components, and public pages. The search revealed **90 files** still importing from `lucide-react`. This plan systematically migrates each category of components.

---

## Migration Summary

| Category | Files to Update | Est. Icon Changes |
|----------|-----------------|-------------------|
| Admin Pages | 15 files | ~120 icons |
| Admin Dialogs & Components | 20+ files | ~80 icons |
| Dashboard Components | 8 files | ~40 icons |
| Public Pages | 10 files | ~50 icons |
| UI Primitives | 5 files | ~15 icons |
| **Total** | ~58 files | ~305 icons |

---

## Phase 1: Admin Pages

### Files to Update

| File | Icons to Replace |
|------|------------------|
| `src/pages/admin/Dashboard.tsx` | Package, AlertTriangle, TrendingUp, Users |
| `src/pages/admin/Products.tsx` | Plus, Upload, Search, MoreHorizontal, Edit, Trash2, ShoppingBag, ImagePlus, FileSpreadsheet |
| `src/pages/admin/Services.tsx` | Plus, Search, MoreHorizontal, Pencil, Trash2, Clock, Calendar |
| `src/pages/admin/Inventory.tsx` | Search, Download, AlertTriangle, Package |
| `src/pages/admin/PurchaseOrders.tsx` | Plus, MoreHorizontal, Eye, CheckCircle, XCircle, Package, Truck |
| `src/pages/admin/StockTransfers.tsx` | Plus, MoreHorizontal, Eye, Truck, CheckCircle, XCircle, ArrowLeftRight, ArrowRight |
| `src/pages/admin/StockAdjustments.tsx` | Plus, AlertTriangle, PackageMinus, RotateCcw, Trash2, HelpCircle |
| `src/pages/admin/Categories.tsx` | Loader2 |
| `src/pages/admin/Suppliers.tsx` | Plus, Edit, Trash2, Truck, Mail, Phone, MapPin |
| `src/pages/admin/AdminBranches.tsx` | Building2, MapPin, Phone, Mail, Plus, Search, Edit, MoreHorizontal |
| `src/pages/admin/AdminUsers.tsx` | Users, Search, UserPlus, Shield, Mail, MoreHorizontal, Edit, Building2 |
| `src/pages/admin/Reports.tsx` | BarChart3, TrendingUp, Package, ShoppingCart, Users, DollarSign, ArrowUpRight, ArrowDownRight |
| `src/pages/admin/InventoryTransactions.tsx` | ArrowDownLeft, ArrowUpRight, RefreshCw, History |

### Icon Mappings for Admin

```text
Lucide                  → Phosphor
Package                 → Package
AlertTriangle           → Warning
TrendingUp              → TrendingUp (or ChartLineUp)
Users                   → Users
Plus                    → Plus
Upload                  → Upload
Search                  → MagnifyingGlass
MoreHorizontal          → DotsThree
Edit                    → PencilSimple
Trash2                  → Trash
ShoppingBag             → ShoppingBag
ImagePlus               → ImageSquare (with Plus overlay)
FileSpreadsheet         → FileXls
Pencil                  → PencilSimple
Clock                   → Clock
Calendar                → Calendar
Download                → Download
Eye                     → Eye
CheckCircle             → CheckCircle
XCircle                 → XCircle
Truck                   → Truck
ArrowLeftRight          → ArrowsLeftRight
ArrowRight              → ArrowRight
ArrowDownLeft           → ArrowDownLeft
ArrowUpRight            → ArrowUpRight
RefreshCw               → ArrowsClockwise
History                 → ClockCounterClockwise
PackageMinus            → Package (with minus)
RotateCcw               → ArrowCounterClockwise
HelpCircle              → Question
Loader2                 → CircleNotch
Mail                    → Envelope
Phone                   → Phone
MapPin                  → MapPin
Building2               → Buildings
UserPlus                → UserPlus
Shield                  → Shield
BarChart3               → ChartBar
ShoppingCart            → ShoppingCart
DollarSign              → CurrencyDollar
```

---

## Phase 2: Admin Dashboard Components

### Files to Update

| File | Icons to Replace |
|------|------------------|
| `src/shared/components/admin/AdminHeader.tsx` | Bell, LogOut, User |
| `src/shared/components/admin/dashboard/QuickActionsCard.tsx` | Truck, ArrowLeftRight, Package |
| `src/shared/components/admin/dashboard/PendingApprovalsCard.tsx` | Truck |
| `src/shared/components/admin/dashboard/PendingTransfersCard.tsx` | ArrowLeftRight |
| `src/shared/components/admin/dashboard/LowStockAlertsCard.tsx` | AlertTriangle |

---

## Phase 3: Admin Dialog Components

### Files to Update

| File | Icons to Replace |
|------|------------------|
| `src/components/admin/products/ECMSImportDialog.tsx` | FileSpreadsheet, ArrowLeft, ArrowRight |
| `src/components/admin/products/FrameAttributesForm.tsx` | Loader2 |
| `src/components/admin/products/ImportHistoryPanel.tsx` | Clock, CheckCircle2, XCircle, FileSpreadsheet, ChevronDown |
| `src/components/admin/products/BulkUploadDialog.tsx` | Upload, FileSpreadsheet |
| `src/components/admin/products/BulkImageUploadDialog.tsx` | Upload, Image |
| `src/components/admin/products/CreateProductDialog.tsx` | Plus, Loader2 |
| `src/components/admin/products/EditProductDialog.tsx` | Loader2 |
| `src/components/admin/products/ecms-import/UploadStep.tsx` | Upload, Download |
| `src/components/admin/products/ecms-import/MappingStep.tsx` | AlertTriangle |
| `src/components/admin/products/ecms-import/ProgressStep.tsx` | Loader2, X |
| `src/components/admin/categories/SortableCategoryRow.tsx` | GripVertical, Pencil, Trash2, ChevronRight |
| `src/components/admin/categories/CreateCategoryDialog.tsx` | Plus |
| `src/components/admin/categories/EditCategoryDialog.tsx` | Loader2 |
| `src/components/admin/services/CreateServiceDialog.tsx` | Plus, Loader2 |
| `src/components/admin/services/EditServiceDialog.tsx` | Loader2 |
| `src/components/admin/users/InviteUserDialog.tsx` | Mail, Loader2 |
| `src/components/admin/users/PendingInvitationsList.tsx` | Mail, Trash2, Loader2 |
| `src/components/admin/users/BranchAssignmentDialog.tsx` | Building2, Star, Loader2 |
| `src/components/admin/adjustments/CreateAdjustmentDialog.tsx` | Plus, Loader2 |
| `src/components/admin/transfers/CreateStockTransferDialog.tsx` | ArrowRight, Loader2 |
| `src/components/admin/purchase-orders/CreatePurchaseOrderDialog.tsx` | Plus, Trash2, Loader2 |

---

## Phase 4: Customer Dashboard & Pages

### Files to Update

| File | Icons to Replace |
|------|------------------|
| `src/pages/Dashboard.tsx` | Loader2, LogOut, User, ShoppingBag, Calendar, Heart, MapPin, Sparkles, Settings |
| `src/pages/Login.tsx` | Eye, EyeOff, Loader2 |
| `src/pages/Signup.tsx` | Eye, EyeOff, Loader2 |
| `src/pages/OrderConfirmation.tsx` | CheckCircle, Package, Truck, MapPin, ArrowRight, ShoppingBag, Calendar, Copy, Check |
| `src/components/dashboard/AppointmentsSection.tsx` | Calendar, Clock, MapPin, Loader2, X |
| `src/components/dashboard/OrderHistorySection.tsx` | ShoppingBag, Loader2 |
| `src/components/dashboard/AddressesSection.tsx` | MapPin, Plus, Loader2, Edit, Trash2 |
| `src/components/dashboard/ProfileSection.tsx` | User, Loader2 |
| `src/components/dashboard/SettingsSection.tsx` | Settings, Loader2 |
| `src/components/eyewear/VirtualTryOnBanner.tsx` | Camera |

---

## Phase 5: UI Primitives

### Files to Update

| File | Icons to Replace |
|------|------------------|
| `src/components/ui/menubar.tsx` | Check, ChevronRight, Circle |
| `src/components/ui/context-menu.tsx` | Check, ChevronRight, Circle |
| `src/components/ui/radio-group.tsx` | Circle |

---

## Phase 6: Update Icon Exports

### Add Missing Icons to `src/lib/icons.ts`

New icons needed for this migration phase:

```typescript
export {
  // Additional icons for admin
  Bell,
  ClockCounterClockwise,
  ArrowsClockwise,
  ArrowDownLeft,
  ImageSquare,
  CurrencyDollar,
  ShoppingCart,
  ChartLineUp,
  UserPlus,
  Star,
  
  // For UI primitives
  Dot,
  
  // Already added in phase 1...
} from "@phosphor-icons/react";
```

---

## Implementation Order

1. **Update `src/lib/icons.ts`** - Add all new icons needed
2. **Admin Pages** - Migrate all 13 admin page files
3. **Admin Dashboard Components** - Migrate 5 shared dashboard component files
4. **Admin Dialogs** - Migrate ~21 dialog and form component files
5. **Customer Dashboard** - Migrate 10 customer-facing files
6. **UI Primitives** - Migrate 3 UI component files
7. **Verify & Test** - Build verification, no Lucide imports remain

---

## Technical Details

### Import Pattern Change

**Before:**
```tsx
import { Package, AlertTriangle, Users } from "lucide-react";
```

**After:**
```tsx
import { Package, Warning, Users } from "@phosphor-icons/react";
```

### Weight Application

For consistency with Phase 1:
- **Default state**: `weight="light"` (minimal, professional)
- **Active/selected**: `weight="bold"` or `weight="regular"`
- **Featured items**: `weight="duotone"` (technical depth)

### Example Transformation

```tsx
// Before (Lucide)
<Loader2 className="h-4 w-4 animate-spin" />

// After (Phosphor)
<CircleNotch className="h-4 w-4 animate-spin" weight="light" />
```

---

## Files Summary

### Total Files to Modify: ~58

| Category | Count |
|----------|-------|
| Admin Pages | 13 |
| Admin Dashboard Components | 5 |
| Admin Dialogs/Components | 21 |
| Customer Dashboard/Pages | 10 |
| UI Primitives | 3 |
| Icon Exports (`icons.ts`) | 1 |
| **Remaining Misc Files** | ~5 |

---

## Post-Migration Cleanup

After all files are migrated:

1. **Remove lucide-react from package.json**
   ```bash
   npm uninstall lucide-react
   ```

2. **Build verification** - Ensure no compilation errors

3. **Visual QA** - Check all icon states render correctly

4. **Bundle size check** - Verify tree-shaking is effective

---

## Estimated Impact

- **Visual consistency**: Unified weight-based icon system
- **Brand alignment**: Professional, medical-tech aesthetic
- **Bundle size**: Similar to Lucide (~60kb tree-shaken)
- **Maintenance**: Single source of truth for all icons in `src/lib/icons.ts`
