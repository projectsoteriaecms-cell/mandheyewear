

## Dynamic Admin-Editable Promo Banner with Catalogue Frames

### What We're Building

The hardcoded "New Season Collection / April 2026 Drop / 20% OFF" promo banner becomes fully admin-manageable. Admins can update the title, subtitle, date label, discount text, description, and select which product frames to feature. The banner also gets a visible frame gallery on mobile (currently hidden).

---

### Database

**New table: `promo_banners`**

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| title_line1 | text | 'New Season' | e.g. "New Season" |
| title_line2 | text | 'Collection' | Gold-colored word |
| date_label | text | 'April 2026 Drop' | The dashed-border tag |
| description | text | 'Every frame you love' | Subtext |
| discount_prefix | text | 'Up to' | Before the number |
| discount_value | text | '20% OFF' | The big number |
| disclaimer | text | 'T&Cs apply' | Small print |
| featured_product_ids | uuid[] | '{}' | Up to 4 product IDs for the frame images |
| is_active | boolean | true | Only one active at a time |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

RLS: Anyone can SELECT active banners. Admins/super_admins get full CRUD.

**Seed** with current hardcoded values so nothing changes visually until admin edits it.

---

### Frontend Changes

**1. `HeroSection.tsx` — Fetch and render dynamic banner**
- Add `useQuery` to fetch the active promo banner from `promo_banners` where `is_active = true`, limit 1
- Also fetch the featured products' `image_url` using the `featured_product_ids` array (join or separate query)
- Replace all hardcoded text with data from the query (with current values as fallbacks)
- Frame images section: show 3-4 product images from `featured_product_ids` in strategically positioned, non-rotating pill/card containers
- Make the frame gallery visible on mobile too (remove `hidden lg:flex`, use a horizontal row or 2x2 grid on small screens)

**2. New admin page: `src/pages/admin/PromoBanner.tsx`**
- Form with fields for all editable columns (title lines, date label, discount, description, disclaimer)
- Product picker: search/select up to 4 products to feature — shows product name + thumbnail
- Preview of how the banner will look
- Save button updates the `promo_banners` table

**3. `admin.routes.tsx` — Add route**
- Add `/admin/promo-banner` route

**4. Admin sidebar — Add nav link**
- Add "Promo Banner" link under the appropriate admin nav section

---

### Frame Image Layout (Non-Rotating)

Desktop (lg+): 3 images in the right column, artistically staggered with slight rotations (similar to current but using real product images from the database)

Mobile/Tablet: 3-4 small circular/rounded thumbnails in a horizontal row beneath the discount pill, or a compact 2x2 grid — always visible, not hidden

---

### Technical Details

- Fallback: if no active banner exists or query fails, the current hardcoded values render (zero visual regression)
- The `featured_product_ids` array is joined against the `products` table to get `image_url` for each
- Static fallback images (`frame2`, `frame3`, `frame4`) used when featured products have no images
- Admin page uses existing `supabase` client patterns and React Query mutations

### Files Modified/Created
1. **Migration** — create `promo_banners` table + seed row
2. **`HeroSection.tsx`** — dynamic data + responsive frame gallery
3. **`src/pages/admin/PromoBanner.tsx`** — new admin editor page
4. **`admin.routes.tsx`** — new route
5. **Admin sidebar component** — new nav link

