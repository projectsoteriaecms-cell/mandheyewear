

# Plan: Enhanced Database Schema for SOTERIA ECMS

## Overview

This plan adds the missing schema elements identified in the ECMS documentation to support the 1,250 product import while preserving all existing functionality. The changes are additive - no existing columns or tables are removed, ensuring backward compatibility with current code.

---

## Current State vs. ECMS Requirements

| Element | Current State | ECMS Requirement | Action |
|---------|--------------|------------------|--------|
| `external_id` | Missing | Store original Excel ProductId | Add column |
| `brand` | Missing (only `brand_line`) | Separate brand name (VOGUE, OAKLEY) | Add column |
| `price_tier` | Missing | luxury/premium/standard/budget | Add column + computed trigger |
| `unit` | Missing | Item/Frame/Bottle/Pair | Add column |
| `description_raw` | Missing | Original unmodified description | Add column |
| `product_type` | `item_type` enum exists | Same concept, expand values | Expand enum |
| `record_type` | Missing | inventory_item vs service | Add column |
| `frame_attributes` table | Partial (columns on products) | Dedicated table for frame specs | Create table |
| `lens_attributes` table | Missing | Dedicated table for optical data | Create table |
| `services` table | Missing | Non-inventory service items | Create table |
| `display_order` on categories | Missing | Sort order for display | Add column |

---

## Phase 1: Expand the Products Table

### 1.1 Add New Columns to Products Table

Add these columns to the existing `products` table:

```text
Column             | Type                 | Default          | Purpose
-------------------|----------------------|------------------|----------------------------------
external_id        | TEXT                 | NULL             | Original Excel ProductId for sync
brand              | TEXT                 | NULL             | Brand name (VOGUE, OAKLEY, etc.)
price_tier         | price_tier enum      | NULL             | Computed: luxury/premium/standard/budget
unit               | TEXT                 | 'Item'           | Unit of measure
description_raw    | TEXT                 | NULL             | Original unmodified description
record_type        | record_type enum     | 'inventory_item' | inventory_item or service
```

### 1.2 Create New Enums

```text
Enum: price_tier
Values: 'budget', 'standard', 'premium', 'luxury'

Enum: record_type  
Values: 'inventory_item', 'service'

Enum: product_type (expand existing item_type)
Add values: 'cleanser', 'packaging'
```

### 1.3 Add Trigger for Price Tier Calculation

Create a trigger that automatically calculates `price_tier` based on the `price` column:
- price >= 200,000 → 'luxury'
- price >= 150,000 → 'premium'  
- price >= 100,000 → 'standard'
- price < 100,000 → 'budget'

---

## Phase 2: Create Frame Attributes Table

A dedicated table for frame-specific measurements and properties, linked 1:1 with products.

### 2.1 Table Structure

```text
Table: frame_attributes
Column            | Type          | Constraints
------------------|---------------|---------------------------
id                | UUID          | PRIMARY KEY
product_id        | UUID          | FOREIGN KEY → products.id, UNIQUE
model_code        | TEXT          | Model/manufacturer code
frame_shape       | TEXT          | Cat Eye, Rectangle, Aviator, etc.
lens_width        | INTEGER       | In millimeters (from XX-XX-XXX)
bridge_size       | INTEGER       | In millimeters (parsed from dimensions)
temple_length     | INTEGER       | In millimeters
frame_material    | TEXT          | Titanium, Acetate, Metal, etc.
front_color       | TEXT          | Front frame color
temple_color      | TEXT          | Temple/arm color if different
has_clip_on       | BOOLEAN       | Has clip-on sunglasses attachment
created_at        | TIMESTAMPTZ   | Default now()
```

### 2.2 RLS Policies

- Anyone can view frame attributes (public read for storefront)
- Managers and super admins can manage (insert, update, delete)

---

## Phase 3: Create Lens Attributes Table

A dedicated table for prescription lens data, linked 1:1 with products.

### 3.1 Table Structure

```text
Table: lens_attributes
Column            | Type          | Constraints
------------------|---------------|---------------------------
id                | UUID          | PRIMARY KEY
product_id        | UUID          | FOREIGN KEY → products.id, UNIQUE
sph               | DECIMAL(4,2)  | Sphere value
cyl               | DECIMAL(4,2)  | Cylinder value
axis              | INTEGER       | Axis (0-180 degrees)
lens_type         | TEXT          | Single Vision, Bifocal, Progressive
lens_material     | TEXT          | CR-39, Polycarbonate, Trivex, etc.
coating           | TEXT          | Anti-reflective, Blue light, etc.
created_at        | TIMESTAMPTZ   | Default now()
```

### 3.2 Validation Trigger

Create a trigger to validate axis is between 0 and 180 (using trigger instead of CHECK constraint for flexibility).

### 3.3 RLS Policies

- Anyone can view lens attributes
- Managers and super admins can manage

---

## Phase 4: Create Services Table

A dedicated table for non-inventory service offerings.

### 4.1 Table Structure

```text
Table: services
Column               | Type          | Constraints
---------------------|---------------|---------------------------
id                   | UUID          | PRIMARY KEY
name                 | TEXT          | NOT NULL - Service name
service_type         | TEXT          | courier_local, courier_interstate, eye_exam, fitting
price                | DECIMAL       | Service price
description          | TEXT          | Service description
duration_minutes     | INTEGER       | Estimated duration
requires_appointment | BOOLEAN       | Default false
is_active            | BOOLEAN       | Default true
created_at           | TIMESTAMPTZ   | Default now()
updated_at           | TIMESTAMPTZ   | Default now()
```

### 4.2 RLS Policies

- Anyone can view active services
- Managers and super admins can manage

---

## Phase 5: Enhance Categories Table

### 5.1 Add New Columns

```text
Column         | Type     | Default | Purpose
---------------|----------|---------|---------------------------
display_order  | INTEGER  | 0       | Sort order for UI display
description_raw| TEXT     | NULL    | Extended category description
```

---

## Phase 6: Code Updates

### 6.1 Update TypeScript Types

The Supabase types will auto-regenerate after migrations. No manual edits needed.

### 6.2 Update Product Forms

Modify these components to include new fields:

**CreateProductDialog.tsx**
- Add: `external_id`, `brand`, `unit`, `description_raw`
- Add: Price tier display (read-only, auto-calculated)

**EditProductDialog.tsx**  
- Add same fields as CreateProductDialog
- Add frame attributes tab if item_type is 'frames'
- Add lens attributes tab if item_type is 'lenses'

### 6.3 Update Product Hooks

**useAdminProducts.ts**
- Update queries to include frame_attributes and lens_attributes joins
- Add mutations for creating/updating attribute records

### 6.4 Create New Hooks

**useFrameAttributes.ts**
- CRUD operations for frame_attributes table

**useLensAttributes.ts**
- CRUD operations for lens_attributes table

**useServices.ts**
- CRUD operations for services table

### 6.5 Update Bulk Upload

**BulkUploadDialog.tsx**
- Expand CSV template to include: `external_id`, `brand`, `unit`, `frame_shape`, `model_code`
- Add price tier calculation in parser
- Add frame attributes creation for frame products

---

## Implementation Order

| Step | Description | Priority | Dependencies |
|------|-------------|----------|--------------|
| 1 | Create new enums (price_tier, record_type) | High | None |
| 2 | Add new columns to products table | High | Step 1 |
| 3 | Create price_tier trigger | High | Step 2 |
| 4 | Create frame_attributes table + RLS | High | None |
| 5 | Create lens_attributes table + RLS | High | None |
| 6 | Create services table + RLS | Medium | None |
| 7 | Add display_order to categories | Low | None |
| 8 | Update CreateProductDialog | High | Steps 2-5 |
| 9 | Update EditProductDialog | High | Steps 2-5 |
| 10 | Create useFrameAttributes hook | High | Step 4 |
| 11 | Create useLensAttributes hook | High | Step 5 |
| 12 | Create useServices hook | Medium | Step 6 |
| 13 | Update BulkUploadDialog | High | All above |
| 14 | Create Services admin page | Medium | Step 12 |

---

## Migration Strategy

All changes are **additive** - no breaking changes to existing data:

1. New columns have sensible defaults (NULL or specific values)
2. Existing products continue to work without frame/lens attributes
3. Price tier is auto-calculated, existing products get tier on next update
4. Services table is completely separate from products

---

## Database Migration SQL Preview

```sql
-- Phase 1: New enums
CREATE TYPE price_tier AS ENUM ('budget', 'standard', 'premium', 'luxury');
CREATE TYPE record_type AS ENUM ('inventory_item', 'service');

-- Expand item_type enum
ALTER TYPE item_type ADD VALUE 'cleanser';
ALTER TYPE item_type ADD VALUE 'packaging';

-- Phase 1: Add columns to products
ALTER TABLE products 
  ADD COLUMN external_id TEXT UNIQUE,
  ADD COLUMN brand TEXT,
  ADD COLUMN price_tier price_tier,
  ADD COLUMN unit TEXT DEFAULT 'Item',
  ADD COLUMN description_raw TEXT,
  ADD COLUMN record_type record_type DEFAULT 'inventory_item';

-- Phase 2: frame_attributes table
CREATE TABLE frame_attributes (...);

-- Phase 3: lens_attributes table  
CREATE TABLE lens_attributes (...);

-- Phase 4: services table
CREATE TABLE services (...);

-- Phase 5: categories enhancement
ALTER TABLE categories ADD COLUMN display_order INTEGER DEFAULT 0;

-- Price tier trigger
CREATE FUNCTION calculate_price_tier() ...
CREATE TRIGGER set_price_tier BEFORE INSERT OR UPDATE ON products ...
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/admin/useFrameAttributes.ts` | CRUD for frame attributes |
| `src/hooks/admin/useLensAttributes.ts` | CRUD for lens attributes |
| `src/hooks/admin/useServices.ts` | CRUD for services |
| `src/pages/admin/Services.tsx` | Admin page for service management |
| `src/components/admin/products/FrameAttributesForm.tsx` | Form for frame specs |
| `src/components/admin/products/LensAttributesForm.tsx` | Form for lens specs |
| `src/components/admin/services/CreateServiceDialog.tsx` | Create service dialog |
| `src/components/admin/services/EditServiceDialog.tsx` | Edit service dialog |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/admin/products/CreateProductDialog.tsx` | Add new fields |
| `src/components/admin/products/EditProductDialog.tsx` | Add attribute tabs |
| `src/components/admin/products/BulkUploadDialog.tsx` | Expand template |
| `src/hooks/admin/useAdminProducts.ts` | Include attributes in queries |
| `src/pages/admin/Products.tsx` | Add price tier and brand columns |
| `src/components/admin/AdminSidebar.tsx` | Add Services nav item |
| `src/App.tsx` | Add Services route |

---

## Data Import Workflow

After schema changes, the import workflow becomes:

1. **Prepare CSV** with enhanced template (includes `external_id`, `brand`, `unit`, frame measurements)
2. **Upload CSV** → Creates products with auto-calculated `price_tier`
3. **Auto-parse frame dimensions** → Creates `frame_attributes` records for frames
4. **Bulk image upload** → Matches by SKU or `external_id`
5. **Verify** → Admin reviews imported data in enhanced product table

