

## Remove 22 Dummy Products

I found exactly **22 dummy products** that were seeded before your ECMS import. They have no `external_id` and no `zoho_item_id`, all created on Jan 26, and none have images. Examples: "Aurora Gold" (MH-RND-001), "ClearView Standard" (SEC-PRX-001), etc.

### Dependencies check
Before deleting, I checked for references in other tables:
- **Order items**: 0 (safe)
- **Cart items**: 1 reference
- **Wishlist**: 1 reference
- **Inventory**: 110 records
- **Frame attributes**: 0

### Plan

1. **Delete related records first** (cart_items, wishlist, inventory) that reference these 22 dummy product IDs
2. **Delete the 22 dummy products** from the `products` table

All deletions will be done via SQL using the data insert tool, targeting only products where `zoho_item_id IS NULL AND external_id IS NULL` (the exact 22 dummy records).

Your 1,250 ECMS-imported products and 2,194 Zoho-synced products will remain completely untouched.

