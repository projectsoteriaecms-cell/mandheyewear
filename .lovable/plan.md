

## Merge ECMS Inventory into M&H Catalog + Full Storefront + Smart Stock Sourcing

### Context from Analysis

**Your uploaded report**: ~625 items, 299,412 total units. The frames (~280 SKUs) are the key e-commerce products. The lenses (~300 SKUs, 285K+ units) and accessories/drugs round out the full catalog.

**Current database**: 348 M&H frames (all with images) + 11,055 Soteria products. The storefront already filters to `brand_line = 'm_and_h_fashion'` with images.

**Challenge**: Merge the report's products into the M&H catalog without duplicating the 348 frames that already have images, then expand the storefront to show lenses/accessories/contact lenses, and add stock sourcing logic.

---

### Phase 1: Merge ECMS Report into M&H Catalog (Data Task)

**Goal**: Import frames from the report that are NOT already in M&H, and reclassify any matching Soteria products as M&H.

**Steps**:
1. Parse the uploaded ECMS report and extract all frame entries (~280 SKUs)
2. Cross-reference against existing `products` table by normalized name/SKU matching
3. For matches already tagged `m_and_h_fashion` — skip (no duplication)
4. For matches tagged `soteria_medical` — reclassify to `m_and_h_fashion` via UPDATE
5. For new items not in the database — INSERT as `m_and_h_fashion`
6. Also reclassify select lenses, accessories, and contact lenses from the report as `m_and_h_fashion` so they appear on the storefront

**Output**: A reconciliation report showing what was merged, reclassified, and skipped.

### Phase 2: Expand Storefront to Full Catalog

**Current**: Only frames with images show on `/eyewear`. Need to add lenses, accessories, contact lenses.

**Changes**:
- **`src/modules/products/hooks/useProducts.ts`** — Remove the `item_type = 'frames'` filter; show all M&H products
- **`src/modules/storefront/components/eyewear/ShopCategoryBar.tsx`** — Add category pills for Lenses, Accessories, Contact Lenses alongside existing Eyeglasses/Sunglasses
- **`src/modules/storefront/components/eyewear/ProductFilters.tsx`** — Add item_type filter support
- **`get_product_category_counts()` DB function** — Update to include lens/accessory/contact_lens counts for the category bar

### Phase 3: Smart Stock Sourcing

**Flow**: When a customer views/orders a product:
1. Check M&H allocated stock (the e-commerce inventory)
2. If out of stock, check central Soteria inventory (other branches) — show "Available via sourcing" badge
3. If completely unavailable everywhere, show "Out of Stock" with a "Request This Item" button
4. Request creates a purchase order draft for staff to process

**Changes**:
- **Database migration**: Add `sourcing_status` view or RPC that checks inventory across branches for a given product
- **`src/modules/storefront/components/eyewear/ProductCard.tsx`** — Show stock status badge (In Stock / Available via Sourcing / Out of Stock)
- **New component: `RequestItemDialog.tsx`** — Customer can request an out-of-stock item, which creates a notification for staff
- **Database migration**: Add `product_requests` table (product_id, user_id, status, created_at) with RLS

### Phase 4: Storefront UX for Stock Visibility

- Products with M&H branch stock: green "In Stock" badge, normal add-to-cart
- Products with only central/other-branch stock: amber "Available — 3-5 days" badge, add-to-cart still works but order gets flagged for sourcing
- Products with zero stock everywhere: "Out of Stock" + "Notify Me" or "Request" button

---

### Files Modified
1. Data script (exec) — Parse ECMS report, merge/reclassify products
2. `src/modules/products/hooks/useProducts.ts` — Remove frames-only filter
3. `src/modules/storefront/components/eyewear/ShopCategoryBar.tsx` — Add lens/accessory categories
4. `src/modules/storefront/components/eyewear/ProductCard.tsx` — Stock status badges
5. `src/modules/storefront/components/eyewear/ProductFilters.tsx` — Item type filter
6. Database migration — `product_requests` table, stock-check RPC
7. `get_product_category_counts()` — Update for full catalog counts
8. New component: `RequestItemDialog.tsx` — Customer item request flow

