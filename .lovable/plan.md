## Goal
Wipe the entire `soteria_medical` catalog (10,659 products across frames, lenses, accessories, medications, etc.) to a clean slate, mirroring the same nuke strategy used for M&H.

## Scope of deletion (brand_line = 'soteria_medical')
- 10,505 frames
- 126 lenses
- 14 other
- 6 medications
- 4 accessories
- 1 each: packaging, contact_lenses, solutions, cleanser

**Total: 10,659 product rows**

## Cascade — dependent rows tied to these products
To avoid orphans / FK-like integrity issues, delete in this order:
1. `cart_items` where product_id ∈ soteria products
2. `order_items` where product_id ∈ soteria products
3. `inventory_transactions` where product_id ∈ soteria products
4. `inventory` where product_id ∈ soteria products
5. `frame_attributes` where product_id ∈ soteria products
6. `lens_attributes` where product_id ∈ soteria products
7. `product_reviews` where product_id ∈ soteria products
8. `product_requests` where product_id ∈ soteria products
9. `slideshow_items` where product_id ∈ soteria products
10. `browse_nudge_log` where product_id ∈ soteria products
11. `purchase_order_items` where product_id ∈ soteria products
12. `products` where brand_line = 'soteria_medical'

## What is preserved
- Schema, RLS, triggers, functions — unchanged
- Categories, branches, suppliers, services, users — untouched
- All `m_and_h_fashion` products (162 frames) — untouched
- Orders themselves remain (only their line items referencing soteria products are removed)

## Execution
Single `supabase--insert` call running the cascade as one transaction.

## Confirm before I run
- OK to also delete from `orders` line items referencing soteria products? (Default: yes — same "nuke everything including orders" strategy as M&H.)
- Or should I keep historical `order_items` and only clear catalog + inventory + cart?
