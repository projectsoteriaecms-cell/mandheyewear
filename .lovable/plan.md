

# Transform into a Unified E-Commerce Experience

## What We're Doing
Consolidating the split `/eyewear` and `/eye-care` pages into a single, unified shop experience at `/shop` with an always-visible search bar in the navigation — making the platform feel like a proper e-commerce store (think Amazon/Jumia) rather than a clinical website.

## Key Changes

### 1. Prominent Search Bar in Navigation
Replace the small search icon with an **inline search bar** visible in the desktop nav (like Amazon's search bar). It will support:
- **Text search** — product name, brand, color
- **Category dropdown** — filter by Eyeglasses, Sunglasses, Lenses, Accessories, Eye Care Services
- **Alphabetical sorting** option in results
- On mobile, the bottom nav "Search" tab opens the existing full-screen search dialog (enhanced)

### 2. Rename `/eyewear` → `/shop` (Unified Store)
- Rename the route from `/eyewear` to `/shop`
- Merge eye care services as a browsable category within the shop (services show as cards alongside products)
- Keep `/eye-care` as a redirect to `/shop?category=services` for SEO
- Update all internal links (nav, mobile menu, bottom nav, homepage CTAs)

### 3. Enhanced Search Dialog
Upgrade the existing `SearchDialog` to support:
- **Category filter chips** at the top (All, Eyeglasses, Sunglasses, Accessories, Services)
- **Alphabetical sort toggle** (A-Z / Z-A)
- **Recent searches** stored in localStorage
- **Popular/trending** suggestions when the search bar is empty

### 4. Navigation Updates
- **Desktop MainNav**: Replace search icon with an inline search input + category dropdown
- **Mobile BottomNav**: "Shop" link points to `/shop`, "Search" opens enhanced search dialog
- **Mobile TopBar menu**: Update all category links to use `/shop?category=...`
- **Category links**: Eyeglasses, Sunglasses, Accessories, Services (replaces "Eye Exams")

### 5. Homepage Updates
- Update `CategoryCards` and `DualCtaSection` links to point to `/shop`
- Hero CTA buttons link to `/shop`

## Files to Modify
- `src/components/navigation/MainNav.tsx` — inline search bar
- `src/components/navigation/MobileBottomNav.tsx` — update paths
- `src/components/navigation/MobileTopBar.tsx` — update menu items
- `src/components/search/SearchDialog.tsx` — add category filter, alphabetical sort, recent searches
- `src/pages/Eyewear.tsx` — rename component, update route to `/shop`
- `src/routes/public.routes.tsx` — rename route, add redirect
- Multiple homepage components — update internal links

## What Stays the Same
- Product detail pages (`/product/:id`)
- Booking page (`/booking`)
- Admin panel
- Cart, checkout, and all auth flows
- The existing filter sidebar on the shop page

