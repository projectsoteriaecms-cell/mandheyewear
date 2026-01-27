

# Plan: ECMS Product Import Parser with Frame Attributes Support

## Overview

This plan creates a dedicated ECMS import dialog that handles the complete 1,250 product dataset from SOTERIA's Excel/CSV exports. The importer will map ECMS columns to the new database schema, automatically create `frame_attributes` records for frame products, and handle dimension parsing from formats like "52-18-145".

---

## ECMS Data Mapping

Based on the product type distribution provided:

| ECMS Column | Database Column | Notes |
|-------------|-----------------|-------|
| ProductId | `external_id` | Original Excel ID for sync |
| ItemDescription | `name` | Product name |
| SKU / ItemNo | `sku` | Unique identifier |
| Brand | `brand` | VOGUE, OAKLEY, etc. |
| BrandLine | `brand_line` | soteria_medical or m_and_h_fashion |
| UnitPrice | `price` | In kobo (auto-calculates `price_tier`) |
| CostPrice | `cost_price` | Purchase cost |
| Unit | `unit` | Item, Frame, Bottle, Pair |
| ProductType | `item_type` | frame, accessory, contact_lens, cleanser, solution, packaging |
| Description | `description` | Full description text |
| Color | `color` | Product color |
| Material | `material` | Frame/lens material |
| Style | `style` | Aviator, Cat Eye, Round, etc. |
| Gender | `gender` | male, female, unisex |
| Dimensions | Frame measurements | Parsed into lens_width, bridge_size, temple_length |
| ModelCode | `frame_attributes.model_code` | Manufacturer code |
| FrameShape | `frame_attributes.frame_shape` | Cat Eye, Rectangle, etc. |

---

## Dimension Parsing Logic

ECMS often provides frame dimensions in formats like:
- `52-18-145` → lens_width: 52, bridge_size: 18, temple_length: 145
- `52mm x 18mm x 145mm` → Same parsing
- `140mm` (single value) → frame_width: 140mm

The parser will:
1. Detect the format pattern using regex
2. Extract numeric values
3. Map to appropriate `frame_attributes` fields

---

## Import Process Flow

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Upload CSV  │ --> │  2. Parse &     │ --> │  3. Preview &   │
│  or Excel file  │     │  Validate Data  │     │  Review Errors  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. Complete    │ <-- │  5. Create      │ <-- │  4. Batch       │
│  Summary        │     │  frame_attrs    │     │  Insert Products│
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Key Features

### 1. Smart Column Detection
- Auto-detect ECMS column names (case-insensitive)
- Map common variations (e.g., "Item Description" / "ItemDescription" / "Product Name")
- Allow manual column mapping for unrecognized headers

### 2. Batch Processing
- Process products in batches of 50 to avoid timeout
- Show progress indicator during import
- Continue on error with detailed error log

### 3. Duplicate Detection
- Check `external_id` and `sku` for existing products
- Option to skip, update, or fail on duplicates

### 4. Frame Attributes Auto-Creation
- For products where `item_type = 'frame'`:
  - Parse dimension strings
  - Create linked `frame_attributes` record
  - Map frame-specific fields (shape, material, model_code)

### 5. Validation Rules
- Required: name, sku, brand_line, price
- Price must be positive number
- `brand_line` must be `soteria_medical` or `m_and_h_fashion`
- `item_type` must match enum values

---

## Technical Implementation

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/admin/products/ECMSImportDialog.tsx` | Main import dialog with full workflow |
| `src/lib/ecms-parser.ts` | ECMS-specific parsing utilities |
| `src/hooks/admin/useECMSImport.ts` | Bulk import with frame_attributes creation |

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/Products.tsx` | Add "ECMS Import" button |
| `src/hooks/admin/useAdminProducts.ts` | Add bulk upsert mutation for handling duplicates |

---

## ECMSImportDialog Component Structure

### Step 1: File Upload
- Accepts both .csv and .xlsx files
- Uses SheetJS (xlsx) library for Excel parsing
- Shows file info and row count

### Step 2: Column Mapping
- Auto-maps recognized columns
- Allows manual override via dropdowns
- Required columns highlighted

### Step 3: Data Preview
- Shows first 10 rows in table format
- Validation errors displayed inline
- Toggle to show only errors

### Step 4: Import Options
- Duplicate handling: Skip / Update / Fail
- Batch size slider (25-100)
- Create frame_attributes checkbox

### Step 5: Import Progress
- Progress bar with percentage
- Current batch indicator
- Live error counter
- Cancel button

### Step 6: Summary
- Total imported count
- Skipped/failed counts
- Download error log as CSV
- "View Products" link

---

## ECMS Parser Utilities (`src/lib/ecms-parser.ts`)

```typescript
// Column name mappings
const ECMS_COLUMN_MAPPINGS = {
  productid: 'external_id',
  itemdescription: 'name',
  productname: 'name',
  itemno: 'sku',
  brandline: 'brand_line',
  unitprice: 'price',
  // ... etc
};

// Dimension parser
function parseDimensions(dimString: string): {
  lens_width?: number;
  bridge_size?: number;
  temple_length?: number;
} { /* regex parsing */ }

// Brand line normalizer
function normalizeBrandLine(value: string): 'soteria_medical' | 'm_and_h_fashion' | null;

// Item type normalizer  
function normalizeItemType(value: string): ItemType | null;
```

---

## Enhanced CSV Template

The ECMS template will include all mappable fields:

```csv
ProductId,ItemDescription,SKU,Brand,BrandLine,UnitPrice,CostPrice,Unit,ProductType,Description,Color,Material,Style,Gender,Dimensions,ModelCode,FrameShape,ReorderLevel,ReorderQty,LeadTimeDays
1001,"VOGUE Cat Eye",VG-CE-001,VOGUE,soteria_medical,85000,45000,Item,frame,"Elegant cat eye frames",Black,Acetate,Cat Eye,female,52-18-145,VO5423,Cat Eye,10,20,7
```

---

## Dependencies

Add the `xlsx` library for Excel file parsing:
```json
{
  "xlsx": "^0.18.5"
}
```

---

## Error Handling Strategy

| Error Type | Handling |
|------------|----------|
| Missing required field | Log row number, skip row |
| Invalid price format | Attempt to clean (remove commas, currency), fail if unparseable |
| Unknown brand_line | Default to "soteria_medical" with warning |
| Duplicate SKU/external_id | Based on user selection (skip/update/fail) |
| Database insert failure | Log error, continue batch, retry failed rows |
| Frame attributes failure | Log warning, product still created |

---

## Implementation Order

| Step | Task | Priority |
|------|------|----------|
| 1 | Install xlsx dependency | High |
| 2 | Create `src/lib/ecms-parser.ts` | High |
| 3 | Create `useECMSImport.ts` hook with batch insert | High |
| 4 | Create `ECMSImportDialog.tsx` with full workflow | High |
| 5 | Add bulk upsert mutation to `useAdminProducts.ts` | High |
| 6 | Update Products.tsx with ECMS Import button | Medium |
| 7 | Add downloadable ECMS template | Medium |
| 8 | Add import history/audit log (optional) | Low |

---

## User Interface Design

### Import Button Location
Products page header, next to existing "Bulk Upload" button:
- **Bulk Upload**: Simple CSV import (current)
- **ECMS Import**: Full ECMS data import with column mapping

### Dialog Size
Full-screen dialog (`max-w-4xl`) to accommodate:
- Wide column mapping table
- Data preview with horizontal scroll
- Progress and summary panels

### Visual Feedback
- Step indicators at top
- Color-coded validation (green = valid, red = error, yellow = warning)
- Progress bar with ETA estimate
- Confetti animation on successful import (optional)

---

## Files Summary

### Create

| File | Description |
|------|-------------|
| `src/lib/ecms-parser.ts` | Column mapping, dimension parsing, data normalization |
| `src/hooks/admin/useECMSImport.ts` | Batch import logic with frame_attributes creation |
| `src/components/admin/products/ECMSImportDialog.tsx` | Multi-step import wizard UI |

### Modify

| File | Changes |
|------|---------|
| `src/pages/admin/Products.tsx` | Add ECMS Import button and dialog |
| `src/hooks/admin/useAdminProducts.ts` | Add `bulkUpsertProducts` mutation |
| `package.json` | Add `xlsx` dependency |

