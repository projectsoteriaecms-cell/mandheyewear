

# Homepage and Navigation Redesign Plan
## Inspired by Warby Parker, Vogue Eyewear, ZEELOOL, and Zenni - Following Dieter Rams' Principles

---

## Vision Overview

This redesign transforms the current homepage into a premium, minimalist experience that embodies Dieter Rams' design philosophy: "Less, but better." The new design will feel like a sophisticated blend of medical trust and fashion-forward eyewear, inspired by industry leaders like Warby Parker.

---

## Dieter Rams' 10 Principles Applied

| Principle | Application |
|-----------|-------------|
| **Innovative** | Style Quiz for personalized recommendations, unified brand presentation |
| **Useful** | Clear product categories, direct paths to key actions |
| **Aesthetic** | Clean typography, generous whitespace, refined color palette |
| **Understandable** | Intuitive navigation, clear visual hierarchy |
| **Unobtrusive** | Subtle animations, no visual clutter |
| **Honest** | Authentic product imagery, transparent pricing in Naira |
| **Long-lasting** | Timeless design patterns, not trendy |
| **Thorough** | Every detail considered, from spacing to icons |
| **Environmentally-friendly** | Efficient code, optimized images |
| **Minimal** | Only essential elements, no decoration for decoration's sake |

---

## Part 1: Navigation Redesign

### Current Issues
- Separate "Home" link is redundant when logo serves this purpose
- Too many CTA buttons competing for attention
- Navigation doesn't reflect core product categories
- Dual logo treatment feels disconnected

### New Navigation Structure

```text
+--------------------------------------------------------------------------------+
| [Find a Store]          [SOTERIA | M&H]              [Book an Eye Exam]       |
+--------------------------------------------------------------------------------+
| Style Quiz | Eyeglasses | Sunglasses | Eye Exams | Accessories    [Icons Row] |
+--------------------------------------------------------------------------------+
```

**Top Utility Bar (Warby Parker style)**
- Left: "Find a Store" link with location icon
- Center: Unified brand lockup (single combined logo or text treatment)
- Right: "Book an Eye Exam" CTA (matches Warby Parker's prominent booking)

**Main Navigation**
- Style Quiz (personalization entry point - leads to frame recommendations)
- Eyeglasses (prescription frames)
- Sunglasses (fashion and prescription sunglasses)
- Eye Exams (replaces "Eye Care" - clearer intent)
- Accessories (cases, cleaning kits, lens solutions)

**Icon Row (right side)**
- Account icon (dropdown with profile sections)
- Search icon
- Wishlist/Favorites heart icon
- Cart icon with count badge

### Logo Treatment
- Combined "SOTERIA | M&H" text lockup OR
- Single unified logo that represents both brands
- Clicking anywhere on the logo returns to homepage
- No separate "Home" text link needed

---

## Part 2: Homepage Redesign

### Section 1: Hero Area
**Warby Parker-inspired clean hero**

```text
+------------------------------------------------------------------------+
|                                                                         |
|              Your perfect pair is waiting                               |
|                                                                         |
|   Take the Style Quiz and get personalized frame recommendations        |
|                                                                         |
|              [Take the Style Quiz]   [Shop Eyeglasses]                 |
|                                                                         |
|   [Full-width lifestyle image of person wearing frames]                 |
|                                                                         |
+------------------------------------------------------------------------+
```

- Minimal text, maximum impact
- Single powerful headline
- Two primary CTAs (Quiz for personalization, Shop for direct browsing)
- High-quality lifestyle photography (not product shots)

### Section 2: Category Navigation Cards
**Visual category entry points (like Vogue Eyewear)**

```text
+--------------------+--------------------+--------------------+
|   [Eyeglasses]     |   [Sunglasses]     |  [Eye Exams]      |
|   Image + Label    |   Image + Label    |  Image + Label    |
+--------------------+--------------------+--------------------+
```

- Three equal-width cards with hover effects
- Category image with subtle overlay
- Clean typography for labels
- Links to respective catalog or booking pages

### Section 3: Personalization CTA
**Style Quiz promotion (Warby Parker's key feature)**

```text
+------------------------------------------------------------------------+
|  Find your perfect frame in 60 seconds                                  |
|                                                                         |
|  Answer a few questions about your style preferences, face shape,       |
|  and lifestyle. We'll recommend frames that fit you perfectly.          |
|                                                                         |
|  [Start the Style Quiz]                                                 |
+------------------------------------------------------------------------+
```

### Section 4: Featured Products
**Product recommendations (existing FeaturedFrames, refined)**

```text
+--------------------+--------------------+--------------------+
|  [Frame Image]     |  [Frame Image]     |  [Frame Image]    |
|  Wishlist | Try On |  Wishlist | Try On |  Wishlist | Try On|
|  Name       Price  |  Name       Price  |  Name       Price |
|  [Color dots]      |  [Color dots]      |  [Color dots]     |
+--------------------+--------------------+--------------------+
```

- Cleaner product cards following reference images
- "Try on" button on each card
- Color variant dots below product name
- Heart icon for wishlist
- Prices in Naira

### Section 5: Virtual Try-On Feature
**Refined VTO promotion**

```text
+------------------------------------------------------------------------+
|  Try frames on virtually                                                |
|                                                                         |
|  Use your camera or upload a photo to see how frames look on you.       |
|  Our AI technology calculates your face measurements for a perfect fit. |
|                                                                         |
|  [Try It Now]                                                           |
+------------------------------------------------------------------------+
```

### Section 6: Why Choose Us
**Trust indicators (simplified)**

```text
+------------------+------------------+------------------+------------------+
| Free Eye Exams   | Virtual Try-On   | Free Shipping    | Easy Returns    |
| Icon + Text      | Icon + Text      | Icon + Text      | Icon + Text     |
+------------------+------------------+------------------+------------------+
```

### Section 7: Newsletter
**Simple newsletter signup (like Vogue reference)**

```text
+------------------------------------------------------------------------+
|  Join our newsletter                                                    |
|  Stay up to date on styles, promos, and all things eyewear.            |
|                                                                         |
|  [Subscribe]                                                            |
+------------------------------------------------------------------------+
```

---

## Part 3: Customer Dashboard Redesign

### New Tab Structure (matching Warby Parker references)
Following the uploaded reference images:

| Tab | Content |
|-----|---------|
| **Home** | Welcome message, quick stats, recent activity |
| **Orders** | Order history with tracking links |
| **Prescriptions** | Uploaded/stored prescription documents |
| **Addresses** | Saved shipping addresses (new feature) |
| **Favorites** | Wishlist items |
| **Frame Profile** | Face dimensions, style preferences, fit data |

### Frame Profile Section (new)
Based on the reference image showing "Frame Profile":

```text
Your style preferences
+------------------------+------------------------+
| Frame shapes           | Preferred colors       |
| Get started with Quiz  | Get started with Quiz  |
+------------------------+------------------------+

Your facial features
+------------------------+------------------------+
| Face shape             | Pupillary distance     |
| From Virtual Try-On    | From Virtual Try-On    |
+------------------------+------------------------+

Your fit
+------------------------+------------------------+
| Frame width            | Best bridge fit        |
| From Virtual Try-On    | From Virtual Try-On    |
+------------------------+------------------------+
```

### Settings Page (new)
Clean settings form based on reference:

- Name (first, last)
- Email (read-only)
- Phone number
- Password change button
- Notification preferences (email, SMS checkboxes)
- Save changes button

---

## Part 4: Style Quiz Implementation

### Quiz Flow
1. **Welcome Screen**: "Let's find your perfect frames"
2. **Face Shape**: Select from visual options
3. **Frame Style**: Round, Square, Aviator, Cat-eye, etc.
4. **Color Preferences**: Neutrals, Bold colors, Tortoise, Metal
5. **Usage**: Reading, Computer, All-day, Fashion
6. **Budget Range**: Price tier selection in Naira
7. **Results**: Personalized frame recommendations

### Data Storage
- Save preferences to `profiles.frame_preferences` (JSON field already exists)
- Link to "Your recommendations" page showing filtered products
- Add "Quiz results" link in navigation for returning users

---

## Part 5: Footer Redesign

### Simplified Footer (following Vogue reference)

```text
+------------------------------------------------------------------------+
| Talk to us     | How can we help? | Privacy and Terms | Refer Friends |
|   [Dropdown]   |    [Dropdown]    |     [Dropdown]    |    [Link]     |
+------------------------------------------------------------------------+
| [Lock Icon] We guarantee every transaction is 100% secure              |
|                                        [Payment icons: Paystack, etc.]  |
+------------------------------------------------------------------------+
```

---

## Part 6: Technical Implementation

### New Files to Create

| File | Purpose |
|------|---------|
| `src/components/navigation/TopBar.tsx` | Utility bar (Find store, Book exam) |
| `src/components/navigation/MainNav.tsx` | Primary navigation |
| `src/components/navigation/MobileNav.tsx` | Mobile slide-out menu |
| `src/pages/StyleQuiz.tsx` | Multi-step quiz flow |
| `src/components/quiz/QuizStep.tsx` | Individual quiz step component |
| `src/components/quiz/QuizResults.tsx` | Results display |
| `src/components/home/HeroSection.tsx` | New minimal hero |
| `src/components/home/CategoryCards.tsx` | Visual category links |
| `src/components/home/TrustBadges.tsx` | Why choose us icons |
| `src/components/home/Newsletter.tsx` | Email signup |
| `src/components/dashboard/AddressesSection.tsx` | Saved addresses |
| `src/components/dashboard/PrescriptionsSection.tsx` | Prescription docs |
| `src/components/dashboard/FrameProfileSection.tsx` | Frame preferences |
| `src/components/dashboard/SettingsSection.tsx` | Account settings |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/Navigation.tsx` | Complete redesign with new structure |
| `src/pages/Index.tsx` | New section composition |
| `src/pages/Dashboard.tsx` | New tabs: Addresses, Prescriptions, Frame Profile |
| `src/components/Footer.tsx` | Simplified dropdown-based footer |
| `src/index.css` | Additional utility classes for new design |
| `src/routes/public.routes.tsx` | Add /style-quiz route |

### Database Updates
- Add `addresses` table for saved shipping addresses
- Add `prescriptions` table for uploaded prescription documents
- Extend `profiles.frame_preferences` JSON structure for quiz results

---

## Part 7: Component Architecture

```text
src/
├── components/
│   ├── navigation/
│   │   ├── TopBar.tsx          # Utility bar
│   │   ├── MainNav.tsx         # Desktop navigation
│   │   ├── MobileNav.tsx       # Mobile drawer
│   │   ├── NavDropdown.tsx     # Mega menu dropdowns
│   │   └── index.ts
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── CategoryCards.tsx
│   │   ├── QuizPromo.tsx
│   │   ├── TrustBadges.tsx
│   │   ├── Newsletter.tsx
│   │   └── index.ts
│   ├── quiz/
│   │   ├── QuizContainer.tsx
│   │   ├── QuizStep.tsx
│   │   ├── QuizProgress.tsx
│   │   ├── QuizResults.tsx
│   │   └── index.ts
│   └── dashboard/
│       ├── AddressesSection.tsx
│       ├── PrescriptionsSection.tsx
│       ├── FrameProfileSection.tsx
│       ├── SettingsSection.tsx
│       └── index.ts
```

---

## Implementation Phases

### Phase 1: Navigation Overhaul
1. Create new navigation component structure
2. Implement top utility bar
3. Build main navigation with new menu items
4. Remove "Home" link, make logo clickable
5. Add icon-based actions (search, wishlist, cart, account)
6. Mobile navigation redesign

### Phase 2: Homepage Sections
1. Create new hero section component
2. Build category cards section
3. Refine existing FeaturedFrames component
4. Create trust badges component
5. Add newsletter signup section
6. Compose new Index.tsx

### Phase 3: Style Quiz
1. Create quiz container and step components
2. Build each quiz step (face shape, style, colors, usage, budget)
3. Save results to user profile
4. Create recommendations page based on quiz results
5. Add "Quiz results" link for returning users

### Phase 4: Dashboard Enhancement
1. Add Addresses tab with CRUD functionality
2. Add Prescriptions tab with file upload
3. Add Frame Profile tab showing VTO data and quiz results
4. Create Settings page with profile management
5. Reorganize existing tabs

### Phase 5: Footer and Polish
1. Redesign footer with accordion/dropdown sections
2. Add payment icons
3. Final typography and spacing refinements
4. Animation and transition polish

---

## Visual Style Updates

### Typography
- Headlines: Playfair Display (existing)
- Body: Outfit (existing)
- Increased line height for readability
- Larger heading sizes for impact

### Spacing
- More generous padding (32px to 64px sections)
- Consistent 16px/24px grid alignment
- Increased whitespace between elements

### Colors
- Primary: Soteria Blue (medical trust)
- Accent: M&H Gold (calls to action)
- Background: Clean whites with subtle grays
- Text: Deep charcoal for readability

### Interactions
- Subtle hover states (not dramatic)
- Smooth 200-300ms transitions
- No bouncy animations (professional feel)

