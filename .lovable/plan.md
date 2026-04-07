

## Frontend E-Commerce Audit: Pending & Unfinished Items

### Overview
The storefront has solid foundations — homepage, catalog, product detail, checkout, order tracking, user dashboard, style quiz, virtual try-on, booking, branches, and informational pages are all built. Here's what needs tidying up, organized by priority.

---

### Priority 1 — Broken or Non-Functional Features

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 1 | **Contact form doesn't actually send** | `Contact.tsx` line 122 | "Send Message" button has no handler — the form submits to nothing |
| 2 | **Newsletter signup is fake** | `Footer.tsx` lines 37-50 | Just shows a toast after a 1-second delay, doesn't store the email anywhere |
| 3 | **Search icon does nothing** | `MainNav.tsx` — MagnifyingGlass icon | There's no search dialog or search page; clicking the icon has no action |
| 4 | **Emergency Contact button is dead** | `Contact.tsx` line 194 | `<Button>` with no onClick or href |
| 5 | **EyeCare prices in USD** | `EyeCare.tsx` lines 21-56 | All 6 services show "$150", "$120" etc. — should be Naira (₦) pricing |
| 6 | **Services table is empty** | Database: 0 rows | Booking page hardcodes services; the `services` table is unused |

### Priority 2 — Missing E-Commerce Features

| # | Feature | Status | What's Needed |
|---|---------|--------|---------------|
| 7 | **Product search** | Missing entirely | No search bar, no search results page — customers can't find products by name/brand |
| 8 | **WhatsApp contact button** | Missing | No floating WhatsApp chat button (standard for Nigerian e-commerce) |
| 9 | **Stock/availability indicator** | Missing on storefront | Products show no stock status — 92% have zero stock but customers can still add to cart |
| 10 | **"Out of Stock" handling** | Missing | No visual indicator or disabled cart button for zero-stock items |
| 11 | **Shipping cost calculation** | Missing | Checkout shows no shipping fee — total = just product subtotal |
| 12 | **Order email confirmation** | Not functional | Requires RESEND_API_KEY which isn't configured |

### Priority 3 — UX Polish & Content Gaps

| # | Issue | Details |
|---|-------|---------|
| 13 | **489 products have no images** | 58% of catalog shows placeholder frames — these should either be hidden or clearly marked |
| 14 | **Contact page hours say "(Hours to be confirmed)"** | Line 150 — needs real hours |
| 15 | **"Partners" page** | `Partners.tsx` exists but not sure what's on it — may be stub content |
| 16 | **Product detail has no reviews section** | No review/rating system — the star icon in ProductDetail is decorative |
| 17 | **No "Recently Viewed" section** | Common e-commerce feature, not implemented |
| 18 | **No breadcrumb on Product Detail page** | Eyewear page has breadcrumbs but product detail doesn't |
| 19 | **Related Products uses brand_line filter** | `ProductDetail.tsx` line 32 — this shows ALL m_and_h_fashion products, not truly related ones |

### Priority 4 — Data Integrity

| # | Issue | Count |
|---|-------|-------|
| 20 | **Only 3 products mapped to Zoho** | 834 products have no `zoho_item_id` — orders with unmapped products won't sync |
| 21 | **Suppliers table empty** | 0 rows — procurement features won't work |
| 22 | **Services table empty** | 0 rows — booking system uses hardcoded services list |

---

### Recommended Fix Order

**Quick wins (can fix in one session):**
1. Contact form → wire to edge function or mailto fallback
2. Newsletter → store emails in a table
3. EyeCare prices → convert to Naira
4. Remove "(Hours to be confirmed)" text
5. Emergency Contact button → add tel: link
6. Disable "Add to Cart" for zero-stock items

**Medium effort (1-2 sessions each):**
7. Product search dialog (Cmd+K style overlay searching products table)
8. WhatsApp floating button
9. Stock availability badges on product cards
10. Shipping cost display at checkout

**Larger features (separate sessions):**
11. Order confirmation emails (needs RESEND_API_KEY)
12. Hide or flag no-image products in catalog
13. Bulk Zoho product mapping (fuzzy matching already built, needs to be run at scale)

### Files That Need Changes
- `src/pages/Contact.tsx` — form handler + emergency button
- `src/pages/EyeCare.tsx` — USD → NGN prices
- `src/components/Footer.tsx` — real newsletter storage
- `src/components/navigation/MainNav.tsx` — search functionality
- `src/components/product/AddToCartSection.tsx` — stock check
- `src/modules/storefront/components/eyewear/ProductCard.tsx` — stock badge
- New: Search dialog component
- New: WhatsApp floating button component

