
# Soteria Eye Clinic — Remix & Transform Plan

## Status: Ready for User Action

### Next Step
1. **Remix this project**: Click project name (top-left) → Settings → "Remix this project"
2. Name the new project **"Soteria Eye Clinic"**
3. Paste the transformation prompt (saved below) into the new project's chat

### Transformation Prompt (for the new project)

```text
Transform this project from M&H Eyewear into Soteria Eye Clinic — a clinical eye care brand. This project was duplicated from M&H Eyewear and shares the same Lovable Cloud backend (same database). Both sites are strategic partners. Apply ALL of the following changes:

## 1. Branding & Colors
- Replace ALL references to "M&H Eyewear" with "Soteria Eye Clinic"
- Primary color: clinical teal/green (160 65% 35%) instead of blue (210 85% 40%)
- Accent color: keep the M&H gold as a secondary accent for partnership elements
- Update CSS variables in index.css accordingly
- Use the existing `soteria-logo.png` and `soteria-logo-gold.png` from src/assets/ as the main logos (replace all mh-logo imports)
- Update favicon to use Soteria branding
- Font: keep Cormorant Garamond for display but consider a more clinical feel

## 2. Homepage Rewrite
- Hero: Focus on clinical eye care — "Your Vision, Our Mission" or similar
- Primary CTAs: "Book an Eye Exam" and "Our Services"
- Replace eyewear-focused sections with: Services overview, "Why Choose Soteria" trust section, Branch locations preview, Partnership mention with M&H Eyewear

## 3. Navigation Updates
- Main nav: Home, Services, Eye Care, Booking, Branches, About, Partners, Contact
- Remove/deprioritize: Eyewear, Style Quiz, Virtual Try-On
- MobileBottomNav: Home, Services, Book, Branches, Account

## 4. Pages to Update
- About: Soteria's story + M&H Eyewear as premium eyewear partner
- Partners: HMO partners + M&H Eyewear as strategic partner
- Services/Eye Care: Primary service page
- Branches: Show all locations from shared database
- Eyewear: Link to mheyewear.com or show catalog with Soteria branding

## 5. SEO & Meta
- Update all useSEO, JsonLd, manifest.json, index.html for Soteria Eye Clinic

## 6. Footer
- Soteria branding + "Premium eyewear by our partner M&H Eyewear"

## 7. Do NOT Change
- Admin panel, Supabase integrations, auth system, cart/checkout, hooks, modules
```

### Already Completed in This Project (M&H Eyewear)
- ✅ Partners page (`/partners`) with Soteria Eye Clinic + HMO partners
- ✅ About page updated with Soteria partnership section
- ✅ Route registered in public.routes.tsx
