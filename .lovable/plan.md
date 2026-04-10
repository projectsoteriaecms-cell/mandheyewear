

## Admin-Managed "Hot Picks" Slideshow with Discount Support

### What We're Building

The "Hot Picks" slideshow currently auto-fetches the 6 newest frames. We're making it fully admin-controlled — admins pick exactly which products appear, set per-product discount info, and the slideshow displays all product details (price, discount, brand, style) dynamically. This mirrors the promo banner admin pattern already in place.

---

### Database

**New table: `slideshow_items`**

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| product_id | uuid | — | References products table |
| display_order | integer | 0 | Controls rotation order |
| discount_percent | integer | null | e.g. 20 for 20% off |
| discount_label | text | null | e.g. "CLEARANCE", "FLASH SALE" |
| is_active | boolean | true | Toggle individual items |
| created_at | timestamptz | now() | |

RLS: Public SELECT where `is_active = true`. Admin/super_admin full CRUD.

This approach uses a join table instead of an array column — it's more flexible for per-product discount metadata and ordering.

---

### Frontend Changes

**1. `PromoSlideshow.tsx` — Fetch from `slideshow_items` instead of raw products**
- Query `slideshow_items` joined with `products` (name, brand, price, image_url, style, price_tier)
- Display the discount badge (e.g. "20% OFF" pill, strikethrough original price, show discounted price) when `discount_percent` is set
- Show `discount_label` as a tag (e.g. "CLEARANCE" or "FLASH SALE") with the Flame accent
- If no `slideshow_items` exist, fall back to current behavior (latest 6 frames) so nothing breaks

**2. New admin page: `src/pages/admin/SlideshowManager.tsx`**
- Product search/picker (same pattern as PromoBanner admin)
- Per-item fields: discount percentage, discount label (optional)
- Drag-to-reorder or up/down arrows for display order
- Toggle active/inactive per item
- Up to 8 items allowed
- Live preview showing the slideshow card

**3. Route + sidebar**
- Add `/admin/slideshow` route in `admin.routes.tsx`
- Add "Hot Picks Slideshow" nav link in admin sidebar

---

### Discount Display Logic

On the slideshow card, when a product has a discount:
- Original price shown with strikethrough: ~~₦45,000~~
- Discounted price shown bold in Flame color: ₦36,000
- Discount badge (e.g. "20% OFF") appears as a pill above the price tag
- `discount_label` (e.g. "CLEARANCE") shown as a small tag near the product name

When no discount is set, the current price displays normally as-is.

---

### Technical Details

- The `slideshow_items` table is queried with a join: `slideshow_items` → `products` to get full product data
- Discounted price is calculated client-side: `price * (1 - discount_percent / 100)`
- Fallback: if `slideshow_items` table is empty, the component queries products directly (current behavior)
- Admin page reuses the same search/select pattern from `PromoBanner.tsx`

### Files Created/Modified
1. **Migration** — create `slideshow_items` table with RLS
2. **`PromoSlideshow.tsx`** — fetch from new table, render discount info
3. **`src/pages/admin/SlideshowManager.tsx`** — new admin editor
4. **`admin.routes.tsx`** — new route
5. **Admin sidebar nav config** — new link

