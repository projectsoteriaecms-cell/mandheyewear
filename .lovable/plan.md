

# Premium Footer Redesign Plan

## Overview
Transform the current accordion-style footer into a sophisticated, premium design that matches M&H Eyewear's luxury brand positioning. The new footer will feature a clean multi-column layout, integrated newsletter signup, professional payment logos, and improved visual hierarchy.

## Current Issues to Address
- Accordion sections feel utilitarian on mobile rather than premium
- Theme toggle in footer is awkward placement for a luxury brand
- Payment badges are plain text boxes instead of professional logos
- Brand section is cluttered with logo + description + social + theme toggle
- No newsletter integration in footer (it's a separate section above)
- Visual hierarchy lacks the depth expected from a premium brand

---

## Design Approach

### Structure (4-Column Layout)

```text
+------------------------------------------------------------------+
|                        NEWSLETTER SECTION                         |
|  [Icon] Stay Updated — Exclusive offers, new arrivals & tips      |
|  [Email Input                              ] [Subscribe Button]   |
+------------------------------------------------------------------+
|                                                                    |
|  [M&H Logo]           SHOP           SUPPORT         COMPANY      |
|                       Eyeglasses     Contact Us      About Us     |
|  Premium eye care     Sunglasses     FAQs            Our Stores   |
|  and designer         Accessories    Order Tracking  Eye Care     |
|  eyewear.             Eye Exams      Shipping        Careers      |
|                       New Arrivals   Returns                      |
|  [Social Icons]                                                   |
|                                                                    |
+------------------------------------------------------------------+
|  [Security] 100% Secure     [Visa] [Mastercard] [Paystack]        |
|                                                                    |
|              © 2026 M&H Eyewear. All rights reserved.             |
|              Privacy Policy  •  Terms of Service                   |
+------------------------------------------------------------------+
```

### Mobile Layout (Stacked, Non-Accordion)
On mobile, all columns become stacked single columns with visible links (no accordion). This feels more premium than collapsible sections.

---

## Files to Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/Footer.tsx` | **Rewrite** | New premium layout with newsletter |
| `src/components/home/Newsletter.tsx` | **Delete/Repurpose** | Move newsletter into footer |
| `src/pages/Index.tsx` | **Update** | Remove standalone Newsletter section |
| `src/components/dashboard/SettingsSection.tsx` | **Update** | Add theme toggle preference |
| `src/components/navigation/TopBar.tsx` | **Keep** | Theme toggle already exists here |

---

## Technical Implementation

### 1. Footer Structure Redesign

**New Footer Sections:**
- **Newsletter Banner** (top of footer) — Dark navy background with gold accent
- **Main Content Grid** — 4 columns: Brand | Shop | Support | Company
- **Bottom Bar** — Security badge, payment logos, copyright, legal links

**Code Architecture:**
```text
Footer.tsx
├── NewsletterBanner (integrated component)
│   ├── Headline + description
│   ├── Email input
│   └── Subscribe button with animation
├── FooterContent (main grid)
│   ├── BrandColumn (logo, tagline, social)
│   ├── ShopColumn (product categories)
│   ├── SupportColumn (help links)
│   └── CompanyColumn (about links)
└── FooterBottom
    ├── SecurityBadge
    ├── PaymentLogos (actual SVG icons)
    ├── Copyright
    └── LegalLinks
```

### 2. Newsletter Integration

**Before:** Standalone section with animated background orbs
**After:** Integrated into footer top with subtle styling

The newsletter will move from a full-width section to a compact footer banner, maintaining the same functionality but with a more refined appearance.

### 3. Payment Provider Logos

Replace text boxes with professional SVG logos:
- **Visa** — Clean card logo
- **Mastercard** — Standard logo
- **Paystack** — Official logo

These will be inline SVGs for crisp rendering at any size, styled in monochrome/muted colors for sophistication.

### 4. Theme Toggle Relocation

**Current locations:** Footer + TopBar
**New locations:** TopBar only (desktop) + User Settings (for persistence)

The TopBar already has a theme toggle. We'll:
1. Remove the footer theme toggle
2. Add a "Display Preferences" card to SettingsSection with theme selection

### 5. Social Links Enhancement

Larger, more prominent social icons with hover effects:
- Facebook, Instagram, X (Twitter) — using Phosphor Icons
- Subtle hover glow animation for premium feel

---

## Link Structure Updates

### Shop Column
| Link | Path |
|------|------|
| Eyeglasses | `/eyewear?category=eyeglasses` |
| Sunglasses | `/eyewear?category=sunglasses` |
| Accessories | `/eyewear?category=accessories` |
| Eye Exams | `/booking` |
| New Arrivals | `/eyewear?sort=newest` |

### Support Column
| Link | Path |
|------|------|
| Contact Us | `/contact` |
| FAQs | `/faq` |
| Order Tracking | `/track-order` |
| Shipping & Delivery | `/faq` |
| Returns & Exchanges | `/returns` |

### Company Column
| Link | Path |
|------|------|
| About M&H | `/about` |
| Our Locations | `/branches` |
| Eye Care Services | `/eye-care` |
| Careers | `/contact` (temp, until careers page exists) |

---

## Visual Design Details

### Color Palette (from existing design system)
- Newsletter banner: `feature-navy` (#1a1e2e)
- Footer background: `bg-card` (white/dark navy)
- Accent: `accent` (gold) for buttons and highlights
- Text: `foreground` / `muted-foreground`

### Typography
- Column headers: `font-medium text-foreground`
- Links: `text-sm text-muted-foreground hover:text-foreground`
- Newsletter headline: `text-xl font-display font-semibold`

### Spacing
- Newsletter section: `py-10` (compact)
- Footer content: `py-12`
- Column gap: `gap-8 lg:gap-12`
- Bottom bar: `py-6 border-t`

---

## Responsive Behavior

### Desktop (lg+)
- 4-column grid layout
- Inline newsletter form
- Horizontal payment logos

### Tablet (md-lg)
- 2x2 grid for link columns
- Newsletter stacked above

### Mobile (< md)
- Single column, all links visible (no accordion)
- Stacked newsletter form
- Centered payment logos
- Compact spacing

---

## Implementation Phases

### Phase 1: Footer Redesign
1. Create new Footer.tsx with premium layout
2. Integrate newsletter functionality (copy logic from Newsletter.tsx)
3. Add SVG payment logos
4. Remove theme toggle from footer

### Phase 2: Cleanup & Integration
1. Remove or repurpose Newsletter.tsx component
2. Update Index.tsx to remove standalone Newsletter section
3. Add theme preference to SettingsSection

### Phase 3: Polish
1. Add subtle animations (fade-in on scroll)
2. Test responsive behavior across breakpoints
3. Verify all links work correctly

---

## Additional Notes

### Email Address
The footer currently references `info@soteriaeyeclinic.com` in the "Email Us" link. This should be updated to an M&H email address when available. For now, I can use a placeholder or generic format like `hello@mheyewear.com` (you can update later).

### Newsletter Functionality
The existing newsletter uses a simulated API call. The real integration can be connected later when a newsletter service (like Mailchimp, Loops, etc.) is configured.

