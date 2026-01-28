
# Stock Update from ECMS Inventory Report

## Overview

The uploaded `InventoryReport_11.xlsx` contains the actual stock quantities for all products in the ECMS system. This data needs to be used to update the inventory records that were previously initialized to zero.

---

## Current State Analysis

| Metric | Value |
|--------|-------|
| Total products in database | 1,272 |
| Products with `external_id` (from import) | 1,250 |
| Current inventory records | 1,360 |
| Current total stock units | 1,144 (pre-existing demo data) |
| Excel total stock units | **291,659** (actual from report) |

### Excel File Structure

| Column | Field | Example |
|--------|-------|---------|
| 1 (ProductId) | `external_id` match key | `2`, `403`, `346` |
| 4 (Item Description) | Product name | `Frame : OAKLEY...` |
| 7 (Sales Price) | Price | `N221,000.00` |
| 8 (Qty) | **Stock quantity** | `0`, `8`, `2`, `199` |
| 9 (Unit) | Unit type | `Frame`, `Bottle`, `Item` |

---

## Implementation Plan

### Phase 1: Create Bulk Stock Import Feature

**New File: `src/modules/inventory/hooks/useBulkStockUpdate.ts`**

A new hook to handle parsing and updating stock from Excel files:

```text
Features:
- Parse XLSX file and extract ProductId → Qty mapping
- Match ProductId to products.external_id
- Update inventory.quantity_on_hand for each match
- Track progress with success/failure counts
- Handle negative quantities (set to 0 with warning)
- Create inventory_transaction records for audit trail
```

### Phase 2: UI Integration

**New File: `src/components/admin/inventory/BulkStockImportDialog.tsx`**

A dialog component for the bulk stock update:

```text
Features:
- File upload for Excel/CSV
- Preview of detected stock quantities
- Branch selector (which branch to update)
- Confirmation step showing affected records
- Progress indicator during update
- Summary of results
```

**Modify: `src/pages/admin/Inventory.tsx`**

Add "Import Stock Levels" button in the header actions.

### Phase 3: Backend Processing Logic

The update logic will:

1. **Parse Excel**: Extract `ProductId` and `Qty` columns
2. **Match products**: Join on `products.external_id = Excel.ProductId`
3. **Batch update**: Update inventory in chunks of 50 to avoid timeouts
4. **Audit trail**: Record each change as an `inventory_transaction` with type `count` (stock count adjustment)
5. **Handle edge cases**:
   - Negative quantities (4 found in Excel) → Set to 0, log warning
   - Missing products → Skip with error log
   - Missing inventory record → Create new record

---

## Data Mapping Details

From the Excel analysis:

```text
Products with stock > 0: ~300+ items
Products with stock = 0: ~900+ items  
Products with negative stock: 4 items (lens types with -1 to -3)
```

Sample matches verified:
| Excel ProductId | Database external_id | Match | Excel Qty |
|-----------------|----------------------|-------|-----------|
| 2 | ✓ Found | OAKLEY OPTICAL... | 0 |
| 403 | ✓ Found | DEW DROPS... | 8 |
| 346 | ✓ Found | MACRUONA TM5030A... | 2 |
| 1785 | ✓ Found | MATROPIN DROPS | 199 |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/modules/inventory/hooks/useBulkStockUpdate.ts` | Create | Core update logic with progress tracking |
| `src/modules/inventory/hooks/index.ts` | Modify | Export new hook |
| `src/modules/inventory/index.ts` | Modify | Export new hook |
| `src/components/admin/inventory/BulkStockImportDialog.tsx` | Create | Upload and preview UI |
| `src/components/admin/inventory/index.ts` | Create | Component exports |
| `src/pages/admin/Inventory.tsx` | Modify | Add import button |

---

## Technical Implementation

### Stock Update Flow

```text
┌─────────────────────┐
│   Upload Excel      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Parse ProductId    │
│  and Qty columns    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Match to products  │
│  via external_id    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Preview changes    │
│  (show mismatches)  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Batch update       │
│  inventory records  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Create audit       │
│  transactions       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Show summary       │
│  (updated/failed)   │
└─────────────────────┘
```

### Update Query Pattern

For each matched product:
```text
1. Get current inventory: SELECT quantity_on_hand FROM inventory 
   WHERE product_id = ? AND branch_id = ?

2. Update stock: UPDATE inventory 
   SET quantity_on_hand = [excel_qty], 
       last_stock_count_date = CURRENT_DATE
   WHERE product_id = ? AND branch_id = ?

3. Log transaction: INSERT INTO inventory_transactions
   (branch_id, product_id, transaction_type, quantity_before, 
    quantity_after, quantity_change, performed_by, notes)
   VALUES (?, ?, 'count', old_qty, new_qty, delta, user_id, 'Bulk stock import from ECMS')
```

---

## Expected Outcome

After running the import:

| Metric | Before | After |
|--------|--------|-------|
| Total stock units | 1,144 | ~291,659 |
| Products with stock > 0 | ~22 | ~300+ |
| Stock accuracy | 1.7% matched | 100% matched |

---

## Validation & Safety

- **Preview before commit**: Show all changes before applying
- **Audit trail**: Every change logged with before/after values
- **Rollback capability**: Transaction logs enable manual reversal if needed
- **Negative handling**: Clamp to 0 with warning notification
- **Duplicate protection**: Only update, never create duplicate inventory records
