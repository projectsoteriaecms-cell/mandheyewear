

# Duplicating This Project for Soteria Eye Clinic

Great idea — you can **remix** (duplicate) this project and then paste a transformation prompt into the new project. Here's the plan:

## How to Remix

1. Click the **project name** (top-left) → **Settings** → **Remix this project**
2. Name the new project **"Soteria Eye Clinic"**
3. Once created, paste the prompt below into the new project's chat

## The Prompt to Paste

Here is the exact prompt you would paste into the new Soteria Eye Clinic project. It instructs the AI to rebrand and restructure everything:

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
- Primary CTAs: "Book an Eye Exam" and "Our Services" (not "Shop Collection" or "Find Your Frame")
- Replace eyewear-focused sections (FeaturedFrames, QuickDiscovery, VirtualTryOn, QuizPromo) with:
  - Services overview (eye exams, consultations, pediatric eye care, glaucoma screening)
  - "Why Choose Soteria" trust section (board-certified doctors, 15+ years experience, advanced diagnostics)
  - Branch locations preview
  - Partnership mention with M&H Eyewear for premium frames
- Keep TrustBadges but update content for clinical credibility

## 3. Navigation Updates
- Main nav items: Home, Services, Eye Care, Booking, Branches, About, Partners, Contact
- Remove or deprioritize: Eyewear (link to mheyewear.com instead), Style Quiz, Virtual Try-On
- Update MobileBottomNav for clinical focus: Home, Services, Book, Branches, Account

## 4. Pages to Update
- **About page**: Soteria's story — founded to provide accessible clinical eye care in Nigeria. Include a Partnership section showing M&H Eyewear as the premium eyewear partner
- **Partners page**: Keep HMO partners grid. Update the strategic partner section to feature M&H Eyewear (reverse the current relationship — show M&H as Soteria's eyewear partner)
- **Services page (Eye Care)**: Make this the primary service page — comprehensive eye exams, glaucoma screening, pediatric eye care, contact lens fitting, prescription services
- **Booking page**: Keep as-is but ensure Soteria branding
- **Branches page**: Show all branches (both Soteria and M&H locations from the shared database)
- **Eyewear page**: Simplify to show "Visit our partner M&H Eyewear for premium frames" with a link to mheyewear.com, or show the product catalog with Soteria branding

## 5. SEO & Meta
- Update all useSEO calls with Soteria Eye Clinic branding
- Update JsonLd organization data to Soteria Eye Clinic
- Update manifest.json name and short_name
- Update index.html title and meta tags

## 6. Footer
- Replace M&H branding with Soteria Eye Clinic
- Update social links if different
- Add "Premium eyewear by our partner M&H Eyewear" link in footer

## 7. Do NOT Change
- Keep the admin panel as-is (shared backend)
- Keep all Supabase/database integrations unchanged
- Keep auth system unchanged (shared users)
- Keep the cart/checkout flow (for when users buy from Soteria)
- Keep all hooks, modules, and backend connections

The goal is a professional, clinical-focused eye care website that clearly positions Soteria as a medical eye care provider, with M&H Eyewear referenced as the premium eyewear partner.
```

## What This Achieves

- **Soteria Eye Clinic** gets its own frontend with clinical branding
- **Shared backend** — same branches, appointments, products, users
- **Cross-referencing** — each site mentions the other as a strategic partner
- You can then connect `soteriaeyeclinic.com` as a custom domain on the new project

