

# M&H Eyewear / Soteria Eye Clinic -- Platform Delivery Report

## Executive Summary

A full-stack e-commerce and clinical operations platform has been built for M&H Eyewear and Soteria Eye Clinic. The platform serves two audiences: **customers** (shopping, booking, virtual try-on) and **staff/administrators** (inventory, orders, branch management). It is a Progressive Web App (PWA) installable on any device, with offline capability, AI-powered features, and social commerce integrations.

---

## Platform at a Glance

| Metric | Value |
|--------|-------|
| Total products in catalog | 1,272 active |
| Product types | Frames (795), Lenses (401), Contact Lenses (10), Accessories (20), Medications (11), Solutions (4), Other (31) |
| Physical branches | 5 locations across 3 states |
| Frame attribute records | 773 (dimensions, materials, colors) |
| Categories | 10 active |
| Registered users | 4 (with roles) |
| Edge functions (backend APIs) | 8 deployed |
| Database tables | 31 |
| Database triggers | 20 (automated workflows) |
| Public pages | 22 routes |
| Admin pages | 16 routes |

---

## 1. Customer-Facing Storefront

### 1.1 Homepage
- Hero section with dual branding (Eye Care + Eyewear)
- Quick discovery cards for product categories
- Featured frames carousel (pulls live from database)
- Virtual try-on promotional banner
- Style quiz CTA
- Trust badges section
- Chat assistant launcher

### 1.2 Eyewear Shop (`/eyewear`)
- Full product catalog with grid and list view toggle
- Filters: Gender, Frame Style, Price Sort
- Price tier filtering (Budget / Standard / Premium / Luxury)
- Pagination (12 products per page)
- Quick-view modal on double-click
- Personalized "Recommended For You" section (for logged-in users with style preferences)
- Match score badges and fit indicators based on face measurements
- Breadcrumb navigation

### 1.3 Product Detail Pages (`/product/:id`)
- Multi-image gallery with additional images support
- Product specifications section
- Add to cart with quantity
- Wishlist button
- "Virtual Try-On" deep link
- Related products ("You May Also Like")
- Mobile sticky action bar (add to cart)
- Meta Pixel ViewContent tracking on every product view
- Schema.org Product structured data (JSON-LD)

### 1.4 Virtual Try-On (`/try-on`)
- **Photo Mode (AI)**: Upload a selfie, select any frame from the catalog, AI generates a photorealistic composite
- **AR Mode**: Live augmented reality via Snap Camera Kit SDK (foundation ready, pending lens creation)
- Frame picker carousel with all 795+ frames
- Try-on history with save/compare
- Deep-link from product pages (`/try-on?product=...`)
- Guided tour for first-time users
- Add to cart / Add to wishlist directly from results
- Email lead capture modal for VTO downloads

### 1.5 Appointment Booking (`/booking`)
- 4-step wizard: Branch > Service > Date/Time > Review
- 6 clinical services: Comprehensive Eye Exam, Contact Lens Fitting, Pediatric Eye Exam, Diabetic Eye Screening, Glaucoma Testing, Specialty Consultation
- Calendar with disabled past dates and Sundays
- Time slot selection (9 AM - 4 PM)
- Automated confirmation email via Resend (edge function)
- Meta Pixel "Schedule" event tracking
- Role-based access (only verified customers can book)

### 1.6 E-Commerce Checkout (`/checkout`)
- Cart drawer with quantity management
- Delivery address form with all 37 Nigerian states
- Order summary with shipping calculation (free above NGN 50,000)
- Profile pre-fill for logged-in users
- Paystack payment integration placeholder (ready for integration)
- Meta Pixel InitiateCheckout tracking
- Role-based access (unverified users blocked)

### 1.7 Style Quiz (`/style-quiz`)
- 5-step interactive quiz: Face Shape > Frame Style > Colors > Usage > Budget
- Custom SVG illustrations for face shapes and frame styles
- Multi-select support
- Saves preferences to user profile
- Powers personalized recommendations on the eyewear page

### 1.8 Onboarding Wizard (`/onboarding`)
- Welcome > Face Scan (AI) > Style Quiz > Lifestyle Poll > Complete
- AI-powered face measurement analysis via Gemini
- Skip functionality at every step
- Progress bar with step tracking

### 1.9 Customer Dashboard (`/dashboard`)
- 7 tabs: Profile, Orders, Appointments, Addresses, Favorites (Wishlist), Frame Profile, Settings
- Quick stats (orders, appointments, favorites)
- Unverified user view with limited access
- Staff auto-redirect to admin panel
- Dark mode toggle in settings

### 1.10 Branch Locations (`/branches`)
- Cards for all 5 branches with address, hours, features
- Head office badge
- M&H vs Soteria branding distinction
- Branch expansion CTA

### 1.11 Additional Pages
- **Eye Care** (`/eye-care`): Services overview
- **About** (`/about`): Company story
- **Contact** (`/contact`): Contact information
- **FAQ** (`/faq`): With schema.org FAQPage structured data
- **Privacy Policy** (`/privacy`)
- **Terms of Service** (`/terms`)
- **Returns Policy** (`/returns`)
- **Login / Signup** (`/login`, `/signup`): Full auth flows
- **Order Confirmation** (`/order/:orderId`)
- **Order Tracking** (`/track-order`)
- **PWA Install Guide** (`/install`)

---

## 2. Admin Dashboard (`/admin`)

### 2.1 Dashboard Home
- Real-time stat cards: Total Stock, Low Stock Alerts, Products, Suppliers
- Pending purchase order approvals
- Pending stock transfers
- Low stock alert list
- Quick action buttons
- Welcome dialog for newly assigned staff
- "No Branch Assignment" state for unassigned staff

### 2.2 Inventory Management
- **Stock Overview** (`/admin/inventory`): Multi-branch inventory grid with quantities, thresholds, bin locations
- **Purchase Orders** (`/admin/inventory/purchase-orders`): Full PO lifecycle (Draft > Submitted > Approved > Received), auto-generated PO numbers, item-level tracking
- **Stock Transfers** (`/admin/inventory/transfers`): Branch-to-branch transfers (Pending > In Transit > Received/Cancelled), auto stock deduction/addition via triggers
- **Stock Adjustments** (`/admin/inventory/adjustments`): Damage, theft, correction, write-off adjustments with manager approval workflow
- **Transaction Log** (`/admin/inventory/transactions`): Complete audit trail of all stock movements
- **Bulk Stock Import**: Excel upload with validation

### 2.3 Product Management
- Full CRUD for 1,272 products
- **ECMS Import**: Multi-step wizard to import from clinical management system Excel files with column mapping, validation, duplicate handling, and import history
- **Bulk Image Upload**: Multi-file drag-and-drop with image compression
- **Product Images Gallery**: Grid view of all product images with quick upload modal
- Frame attributes management (lens width, bridge size, temple length, materials, colors)
- Lens attributes management (SPH, CYL, axis, coatings)
- Product list view with search, filtering

### 2.4 Category Management
- Drag-and-drop sortable categories
- Parent/child hierarchy
- Brand line assignment (M&H Fashion / Soteria Medical)
- Create/edit/activate/deactivate

### 2.5 Supplier Management
- Full CRUD for suppliers
- Contact details, payment terms, tax IDs
- City/state/country tracking

### 2.6 Services Management
- Clinical service catalog (create/edit/toggle active)
- Duration, pricing, appointment requirement flag

### 2.7 Appointment Management
- View all appointments across branches
- Status management

### 2.8 Branch Management (Super Admin)
- Branch CRUD with all details
- Head office designation
- M&H vs Soteria branding
- Operating hours configuration

### 2.9 User Management
- User invitation system via email (edge function with Resend)
- Role assignment: User > Customer > Branch Staff > Branch Manager > Super Admin
- Branch assignment dialog
- Pending invitation tracking with expiry
- Role change permissions matrix

### 2.10 Reports
- Reports dashboard (framework ready)

### 2.11 Settings (Super Admin)
- System configuration

---

## 3. Role-Based Access Control (RBAC)

5-tier permission hierarchy:

| Role | Access Level |
|------|-------------|
| **User** (Unverified) | Browse only. Cannot purchase, book, or wishlist |
| **Customer** (Verified) | Full storefront: purchase, book appointments, wishlist, frame profile |
| **Branch Staff** | Admin dashboard: view inventory, create POs/transfers/adjustments, view appointments |
| **Branch Manager** | All staff permissions + approve POs/transfers, manage products/categories/suppliers/services, view reports |
| **Super Admin** | Full system access: manage branches, users, settings, all operations |

All enforced at both **frontend** (UI gating) and **backend** (PostgreSQL Row-Level Security policies on every table).

---

## 4. Backend Infrastructure

### 4.1 Database (31 Tables)
- `products`, `categories`, `frame_attributes`, `lens_attributes` -- Catalog
- `inventory`, `inventory_transactions` -- Stock tracking
- `purchase_orders`, `purchase_order_items` -- Procurement
- `stock_transfers`, `stock_transfer_items` -- Inter-branch logistics
- `stock_adjustments` -- Corrections
- `suppliers` -- Vendor management
- `branches`, `branch_assignments` -- Location management
- `orders`, `order_items` -- E-commerce
- `cart_items`, `wishlist` -- Shopping
- `appointments`, `services` -- Clinical
- `prescriptions` -- Patient records
- `profiles`, `user_roles`, `user_invitations` -- Users
- `notifications` -- Real-time alerts
- `user_measurements`, `personalization_analytics` -- AI/personalization
- `style_polls`, `poll_responses` -- Style preferences
- `import_history` -- Data import tracking
- `vto_email_leads` -- Lead capture

### 4.2 Database Triggers (20 Active)
- Auto-calculate price tiers on product insert/update
- Validate lens axis values (0-180 degrees)
- Auto-generate order numbers (`ORD-YYYYMMDD-XXXX`)
- Auto-generate PO numbers (`PO-YYYYMMDD-XXXX`)
- Auto-generate transfer numbers (`TRF-YYYYMMDD-XXXX`)
- Deduct inventory on order item creation
- Return inventory on order cancellation
- Handle PO received (add stock + log transactions)
- Handle stock transfer lifecycle (deduct/add/return on status changes)
- Auto-create profile and role on new user signup
- Process invitations on signup
- Auto-update `updated_at` timestamps (10 tables)

### 4.3 Edge Functions (8 Deployed)
| Function | Purpose |
|----------|---------|
| `analyze-face` | AI face measurement via Gemini (face shape, dimensions) |
| `virtual-try-on` | AI frame overlay generation with Gemini + Lovable AI fallback |
| `meta-product-feed` | XML product catalog for Facebook/Instagram Shopping |
| `sitemap` | Dynamic XML sitemap for SEO (static + 1,272 product URLs) |
| `send-appointment-confirmation` | Email confirmation via Resend |
| `send-tryon-result` | Email VTO results to users |
| `send-user-invitation` | Staff invitation emails via Resend |
| `sync-offline-changes` | PWA offline data synchronization |

### 4.4 Storage
- `product-images` bucket (public) for product photography

---

## 5. Branch Network

| Branch | City | State | Type |
|--------|------|-------|------|
| Soteria Eye Clinic -- Warri (Head Office) | Warri | Delta | Physical Store |
| Soteria Eye Clinic -- Lagos (Lekki) | Lekki, Lagos | Lagos | Physical Store |
| Soteria Eye Clinic -- Effurun (Delta Mall) | Effurun | Delta | Physical Store |
| Soteria Eye Clinic -- Uyo (Tropicana Mall) | Uyo | Akwa Ibom | Physical Store |
| M&H Eyewear -- Lagos (Lekki Flagship) | Eti-Osa, Lekki | Lagos | Physical Store |

---

## 6. SEO and Marketing

### 6.1 On-Page SEO
- Dynamic meta titles and descriptions on every page (22 routes)
- Canonical URLs per page
- Open Graph and Twitter Card tags
- Schema.org JSON-LD: Organization, Product, FAQPage
- Proper heading hierarchy (h1/h2/h3)
- robots.txt with sitemap directive

### 6.2 Dynamic XML Sitemap
- Edge function generating sitemap with all static pages + 1,272 product URLs
- Proper lastmod, changefreq, priority values

### 6.3 Meta Pixel (Facebook/Instagram)
- Pixel ID: `1429642005500083`
- Events tracked: PageView (SPA-aware), ViewContent, AddToCart, InitiateCheckout, CompleteRegistration, Schedule, Search, Lead, AddToWishlist
- noscript fallback for non-JS browsers

### 6.4 Meta Product Feed
- Live XML feed for Facebook/Instagram Shopping
- Auto-generated descriptions for products without descriptions
- All 1,272 active products included

### 6.5 VTO Email Lead Capture
- Email collection modal on virtual try-on download
- Marketing consent checkbox
- 3 leads captured to date

---

## 7. Progressive Web App (PWA)

- Installable on iOS, Android, and desktop
- Offline indicator with connectivity status
- Service worker with intelligent caching:
  - Google Fonts: Cache-first (1 year)
  - Images: Cache-first (30 days)
  - API calls: Network-first with 5-minute cache fallback
- Background sync queue for offline mutations (24-hour retry)
- Install prompt with dedicated install guide page (`/install`)
- App manifest with icons, theme colors, categories

---

## 8. Mobile Optimization

- Responsive design across all pages
- Mobile-specific navigation: top bar + bottom nav
- Mobile sticky action bars on product pages
- Touch-optimized targets
- Pull-to-refresh capability (hook ready)
- Swipe gesture support (hook ready)
- Lazy-loaded routes for faster initial load

---

## 9. Technical Architecture

### Frontend Stack
- React 18 + TypeScript
- Vite (build tool) with SWC compiler
- TailwindCSS + Radix UI component library
- React Router v6 (SPA routing)
- TanStack React Query (server state management)
- Phosphor Icons + Lucide Icons
- Recharts (data visualization)

### Backend Stack
- Lovable Cloud (Supabase)
- PostgreSQL database with RLS
- Deno edge functions
- Resend for transactional emails
- Gemini AI (face analysis + virtual try-on)

### Code Organization
- Modular architecture: `src/modules/` (products, inventory, categories, branches, services, suppliers, users)
- Shared components: `src/shared/`
- Custom hooks pattern for all data operations
- Barrel exports for clean imports

---

## 10. Pending / Future Work

| Item | Status | Dependency |
|------|--------|------------|
| Paystack payment integration | Checkout UI ready, integration pending | Paystack API keys |
| Google Analytics 4 | Not configured | GA4 Measurement ID |
| Google Search Console | Not verified | Verification code |
| TikTok Pixel | Not started | TikTok Business account |
| Snap Camera Kit lenses | SDK integrated, lenses not created | Snap developer account + Lens Studio 3D models |
| Custom domain | Using lovable.app subdomain | Domain purchase + DNS config |
| Seed suppliers data | Table empty (0 records) | Client to provide supplier list |
| Seed services data | Table empty (0 records) | Client to confirm service catalog and pricing |
| Product images | ~20% coverage | Product photography |
| Inventory stock levels | ~92% at zero | Initial stock count from branches |

---

## 11. Security

- Row-Level Security (RLS) on all 31 tables
- Role-based policies enforcing the 5-tier permission hierarchy
- SECURITY DEFINER functions for cross-role operations (notifications, triggers)
- Email-based authentication (no anonymous signups)
- Invitation-based staff onboarding with token expiry (7 days)
- Edge functions with JWT verification where required

