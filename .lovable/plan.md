

# Soteria Eye Clinic — Separate Lovable Project Plan

## Architecture Decision

Create a **second Lovable project** for Soteria Eye Clinic that connects to the **same Lovable Cloud backend** as M&H Eyewear. Both sites share the same database (branches, appointments, products, users, inventory) but have completely different branding, navigation, and content.

## What the Soteria Project Needs

### Brand Identity
- **Color palette**: Clinical greens/blues (vs M&H's gold/warm tones)
- **Logo**: `soteria-logo.png` / `soteria-logo-gold.png` (already exist in this project's assets)
- **Typography**: Professional/medical feel
- **Domain**: `soteriaeyeclinic.com`

### Pages to Build

| Page | Content Focus |
|---|---|
| **Home** | Eye care services hero, appointment CTA, branch locations, trust badges (clinical focus) |
| **About** | Soteria's story + **Partnership section** with M&H Eyewear |
| **Services** | Eye exams, consultations, clinical services (shared `services` table) |
| **Booking** | Appointment booking — shows ALL branches (both Soteria and M&H) |
| **Branches** | All locations with brand indicators |
| **Eye Care** | Clinical services detail page |
| **Eyewear** | Links to or embeds M&H product catalog |
| **Partners** | HMO partners, M&H Eyewear partnership, affiliations |
| **Contact / FAQ / Privacy / Terms** | Soteria-branded versions |
| **Login / Signup / Dashboard** | Same auth system, same user accounts |

### Shared Backend (Same Database)
- `branches` table — both brands' locations (use `is_mh_location` flag to distinguish)
- `appointments` table — bookings for any branch
- `products` table — same catalog
- `services` table — same services
- `profiles`, `user_roles`, `orders` — same users across both sites
- All edge functions (payment, email, face analysis) — shared

### Partners Section (Both Sites)
A new **Partners page** on both sites showing:
- M&H Eyewear ↔ Soteria Eye Clinic partnership
- HMO partners (logos, names, plan types accepted)
- Could be backed by a new `partners` table or hardcoded initially

## How to Set It Up

### Step 1: Create New Lovable Project
1. Create a new Lovable project called "Soteria Eye Clinic"
2. Connect it to the **same Lovable Cloud backend** (same database)
3. This means both projects read/write to the same tables

### Step 2: Build the Soteria Frontend
- New Navigation, Footer, HeroSection with Soteria branding
- Reuse the same UI component library (shadcn/ui)
- Same booking flow but with Soteria's visual identity
- About page highlights the partnership with M&H

### Step 3: Connect Domain
- Add `soteriaeyeclinic.com` as custom domain on the Soteria project
- DNS: A records for `@` and `www` pointing to `185.158.133.1`
- Add TXT record for verification

### Step 4: Add Partners Section to Both Sites
- Add a `/partners` page to M&H (this project) showing Soteria + HMOs
- Add a `/partners` page to Soteria showing M&H + HMOs

## What I Can Do Now (In This Project)

1. **Add a Partners page** to M&H Eyewear with Soteria Eye Clinic and HMO partners
2. **Prepare shared assets** (partner logos, HMO data)
3. **Update the About page** to mention the Soteria partnership

The Soteria project itself would need to be created as a **separate Lovable project**. I can help you plan the exact pages and components once that project is created — you'd share the same backend connection.

## Next Step

You would need to **create a new Lovable project** for Soteria Eye Clinic. Once created, I can help build it out by referencing this project's patterns and connecting to the same backend.

