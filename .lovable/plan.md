

# M&H Eyewear Rebranding Plan

## Overview
This plan removes all Soteria Eye Clinic branding from the frontend, making M&H Eyewear the sole brand. The backend, database, and inventory will remain shared for the future Soteria frontend.

## Scope Clarification
- **M&H becomes a full-service company** - offering both eyewear AND eye care services (not just the "luxury arm")
- **No dual-brand references** - remove all "Soteria | M&H" combined branding
- **Backend unchanged** - database tables, edge functions, and inventory remain intact

---

## Files to Modify

### Navigation & Headers

| File | Changes |
|------|---------|
| `src/components/navigation/MainNav.tsx` | Remove Soteria logo imports, display only M&H logo, remove separator |
| `src/components/navigation/MobileTopBar.tsx` | Same as above - M&H only in header and drawer |
| `src/components/navigation/MobileNav.tsx` | Same as above - M&H only in header and drawer |
| `src/components/navigation/TopBar.tsx` | Update any brand references (currently minimal Soteria refs) |
| `src/components/Footer.tsx` | Remove Soteria logo, update copyright to "M&H Eyewear" |

### Hero & Home

| File | Changes |
|------|---------|
| `src/components/home/HeroSection.tsx` | Remove "Soteria Eye Clinic" slide, convert to single M&H slide (keeping eye care messaging), update badge text |

### Pages

| File | Changes |
|------|---------|
| `src/pages/About.tsx` | Rewrite as M&H-only story (remove dual-brand narrative, Soteria section) |
| `src/pages/EyeCare.tsx` | Rename "Soteria Eye Care Services" to "M&H Eye Care Services" |
| `src/pages/Branches.tsx` | Update descriptions to reference M&H locations only |
| `src/pages/Privacy.tsx` | Replace "Soteria Eye Clinic & M&H Eyewear" with "M&H Eyewear" |
| `src/pages/Terms.tsx` | Same replacement throughout |
| `src/pages/Install.tsx` | Update app name to "M&H Eyewear" |
| `src/pages/ProductDetail.tsx` | Update brand badge (Soteria Medical -> M&H Medical) |

### PWA & Configuration

| File | Changes |
|------|---------|
| `index.html` | Update title, meta tags, Open Graph tags - all to "M&H Eyewear" |
| `public/manifest.json` | Update name and short_name |
| `vite.config.ts` | Update PWA manifest settings |

### Admin (Display Labels Only)

| File | Changes |
|------|---------|
| `src/pages/admin/Settings.tsx` | Update default store name display |
| `src/components/admin/products/CreateProductDialog.tsx` | Update brand line label: "Soteria Medical" -> "M&H Medical" |
| `src/components/admin/products/EditProductDialog.tsx` | Same label update |
| `src/components/admin/products/ProductListView.tsx` | Same label update |
| `src/components/admin/categories/EditCategoryDialog.tsx` | Same label update |
| `src/components/storefront/ProductQuickView.tsx` | Update badge display |

### PWA Components

| File | Changes |
|------|---------|
| `src/components/pwa/InstallPrompt.tsx` | Update app name display |

### CSS & Theme (Optional Cleanup)

| File | Changes |
|------|---------|
| `src/index.css` | Rename CSS variable comments from "Soteria Blue" to "M&H Blue" (optional, cosmetic) |
| `tailwind.config.ts` | Rename `soteria` color namespace to `mh-primary` (optional, affects codebase-wide references) |

---

## Key Changes Detail

### 1. Logo Implementation
**Before:** Dual logo with separator (Soteria | M&H)
**After:** Single M&H logo only

```text
BEFORE: [Soteria Logo] | [M&H Logo]
AFTER:  [M&H Logo]
```

The M&H logo assets (`mh-logo.png`, `mh-logo-gold.png`) are already in the project.

### 2. Hero Section Transformation
**Before:** Two-slide carousel alternating between Soteria (clinical) and M&H (fashion)
**After:** Single cohesive M&H hero OR simplified two-slide showing M&H's dual offerings (eyewear + eye care)

The hero will emphasize that M&H offers:
- Premium eyewear
- Comprehensive eye care services

### 3. About Page Rewrite
**Before:** Dual narrative explaining both brands separately
**After:** Single M&H story covering:
- Company history and mission
- Full-service offering (eye care + eyewear)
- Values and team

### 4. Brand Line Labels in Admin
The database uses `soteria_medical` and `m_and_h_fashion` enum values - these will **NOT** change (backend stability).
Only the UI labels will change:
- "Soteria Medical" -> "M&H Medical" (for clinical/medical products)
- "M&H Fashion" -> "M&H Lifestyle" or keep as-is

---

## Files NOT Modified (Backend Stability)

These files use `soteria_medical` enum values and will remain unchanged to ensure database compatibility:

- `src/modules/products/lib/transformers.ts` - Parser logic using enum values
- `src/integrations/supabase/types.ts` - Auto-generated from database
- Database migrations - Enum values remain for backend compatibility
- Edge functions - No Soteria branding exposed to users

---

## Implementation Phases

### Phase 1: Navigation & Footer (Core Branding)
1. Update MainNav - M&H logo only
2. Update MobileTopBar - M&H logo only  
3. Update MobileNav - M&H logo only
4. Update Footer - M&H branding, copyright

### Phase 2: Home & Hero
1. Simplify HeroSection to M&H focus
2. Keep eye care messaging but as M&H service

### Phase 3: Content Pages
1. Rewrite About page
2. Update EyeCare page headings
3. Update Branches page copy
4. Update Privacy and Terms pages
5. Update Install page

### Phase 4: PWA & Meta
1. Update index.html meta tags
2. Update manifest.json
3. Update vite.config.ts PWA settings

### Phase 5: Admin Labels
1. Update product brand line labels
2. Update category brand line labels
3. Update settings defaults

---

## Post-Implementation Notes

### For Future Soteria Frontend
When building the separate Soteria frontend:
- Both apps will share the same backend database
- Products with `brand_line: "soteria_medical"` can be filtered for Soteria
- Products with `brand_line: "m_and_h_fashion"` can be filtered for M&H
- User accounts, orders, and inventory sync across both frontends

### Email References
The footer currently has `info@soteriaeyeclinic.com` - this should be updated to a new M&H email address (you'll need to provide the new email).

