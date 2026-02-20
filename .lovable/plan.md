
# SEO, Analytics & Social Commerce -- Full Audit and Optimization Plan

## Current Status Audit

### 1. Social Commerce

| Feature | Status | Notes |
|---------|--------|-------|
| Meta Product Feed | DONE | Edge function live, 77 active products, auto-generated descriptions |
| Meta Pixel (Facebook/Instagram) | DONE | Pixel ID 1429642005500083, tracks PageView, ViewContent, AddToCart, InitiateCheckout, CompleteRegistration, Schedule, Search, Lead, AddToWishlist |
| Meta Pixel page-view on SPA route change | DONE | `useMetaPixelPageView` hook in App.tsx |
| VTO Email Lead Capture | DONE | `vto_email_leads` table + edge function + modal |
| TikTok Pixel / Catalog | NOT STARTED | No code or config exists |
| Snapchat Camera Kit | PARTIAL | SDK installed, lens config exists, but no pixel tracking |

### 2. SEO -- On-Page Meta Tags & Structure

| Feature | Status | Gap |
|---------|--------|-----|
| Homepage meta tags | DONE | Title, description, OG, Twitter Card all set in index.html |
| Per-page dynamic meta tags | MISSING | All pages share the same static title/description from index.html. Product pages, Eyewear, Booking, etc. have no unique meta. |
| Canonical URL | PARTIAL | Only homepage canonical is set; no per-page canonicals |
| Structured Data (JSON-LD) | MISSING | No schema.org markup anywhere -- no Product, LocalBusiness, Organization, or BreadcrumbList schemas |
| Keyword optimization | PARTIAL | Basic keywords in meta tag; missing location-specific and long-tail keywords (e.g., "eye clinic Lagos", "buy prescription glasses online Nigeria") |
| Heading hierarchy | DONE | Pages use proper h1/h2/h3 structure |
| Image alt text | PARTIAL | Product images use product name; some static images use generic alt text |
| robots.txt | DONE | Allows all crawlers |

### 3. Sitemap & Search Console

| Feature | Status | Gap |
|---------|--------|-----|
| XML Sitemap | MISSING | No sitemap.xml exists. No edge function or static file |
| Sitemap in robots.txt | MISSING | robots.txt doesn't reference a sitemap |
| Search Console verification | NOT CONFIRMED | No google-site-verification meta tag in index.html |

### 4. Google Analytics

| Feature | Status | Gap |
|---------|--------|-----|
| Google Analytics (GA4) | MISSING | No gtag.js, no GA measurement ID anywhere in the codebase |
| Google Tag Manager | MISSING | No GTM container |

### 5. Conversion Tracking

| Feature | Status | Gap |
|---------|--------|-----|
| Meta Pixel events | DONE | Full standard event coverage |
| Google Ads conversion tracking | MISSING | No Google Ads tag |
| TikTok Pixel | MISSING | No implementation |
| Goal tracking (GA4 events) | MISSING | Blocked by GA4 not being configured |

---

## Optimization Plan

### Phase 1: Dynamic SEO Meta Tags (High Impact)

**Create a reusable `SEOHead` component** using `document.title` and dynamic meta tag injection (via a small `useEffect`-based hook -- no external library needed).

This component will be added to every page to set:
- `<title>` -- unique per page
- `<meta name="description">` -- unique per page
- `<link rel="canonical">` -- per-page URL
- Open Graph tags (title, description, URL, image)
- Twitter Card tags

**Per-page SEO content:**

| Page | Title | Description |
|------|-------|-------------|
| `/` | M&H Eyewear - Premium Eye Care & Designer Frames in Nigeria | See Better. Look Better. Book eye exams, shop designer frames, and try on glasses with AI. |
| `/eyewear` | Shop Designer Eyewear - Prescription Glasses & Sunglasses - M&H | Browse 100+ premium frames. Prescription glasses, sunglasses, and fashion eyewear. Free virtual try-on. |
| `/eye-care` | Eye Care Services - Eye Exams & Vision Tests - M&H Eyewear | Comprehensive eye care: eye exams, vision tests, contact lens fitting. Book your appointment today. |
| `/booking` | Book an Eye Exam - M&H Eyewear | Schedule your eye exam at any M&H branch. Professional optometry services across Nigeria. |
| `/try-on` | Virtual Try-On - See Frames on Your Face - M&H Eyewear | Upload your photo and try on 70+ frames instantly with our AI-powered virtual try-on. |
| `/product/:id` | [Product Name] - [Brand] - M&H Eyewear | [Auto-generated from product data] |
| `/style-quiz` | Style Quiz - Find Your Perfect Frames - M&H Eyewear | Take our style quiz to discover frames that match your face shape, lifestyle, and personal style. |
| `/branches` | Our Locations - M&H Eyewear Branches in Nigeria | Find an M&H Eyewear branch near you. Visit us for eye exams, frame fittings, and premium eyewear. |
| `/about` | About M&H Eyewear - Our Story | Learn about M&H Eyewear's mission to deliver premium eye care and designer frames across Nigeria. |
| `/contact` | Contact Us - M&H Eyewear | Get in touch with M&H Eyewear. Questions about orders, appointments, or our products. |

**New files:**
- `src/hooks/useSEO.ts` -- hook that manages document.title and meta tags
- Update each page component to call `useSEO({ title, description, canonical, ... })`

### Phase 2: Structured Data / JSON-LD (High Impact for Search)

**Create a `JsonLd` component** that injects schema.org structured data into the page head.

**Schemas to implement:**

1. **Organization** (site-wide, in App.tsx or Index)
```text
Type: Organization
name: M&H Eyewear
url: https://soteriaeyeclinic.lovable.app
logo: [logo URL]
sameAs: [social media URLs]
```

2. **LocalBusiness** (on `/branches` page, one per branch)
```text
Type: Optician / LocalBusiness
name, address, telephone, openingHours, geo coordinates
```

3. **Product** (on `/product/:id` pages)
```text
Type: Product
name, description, image, sku, brand, offers (price, currency, availability)
```

4. **BreadcrumbList** (on product and category pages)
```text
Home > Eyewear > [Product Name]
```

5. **FAQPage** (on `/faq` page)
```text
Question/Answer pairs for rich snippets
```

**New files:**
- `src/components/seo/JsonLd.tsx`
- `src/components/seo/index.ts`

### Phase 3: XML Sitemap (Critical for Indexing)

**Create an edge function** `sitemap` that generates a dynamic XML sitemap including:
- All static pages (/, /eyewear, /eye-care, /booking, /try-on, /style-quiz, /branches, /about, /contact, /faq, /privacy, /terms, /returns)
- All active product pages (`/product/:id`) from the database
- Proper `<lastmod>`, `<changefreq>`, and `<priority>` values

**Update robots.txt** to include:
```text
Sitemap: https://soteriaeyeclinic.lovable.app/sitemap.xml
```

**New files:**
- `supabase/functions/sitemap/index.ts`

### Phase 4: Google Analytics 4 (GA4)

**Requires:** A GA4 Measurement ID (format: `G-XXXXXXXXXX`) from the user.

**Implementation:**
- Add the gtag.js script to `index.html`
- Create a `useGoogleAnalytics` hook similar to `useMetaPixel` for tracking:
  - Page views (automatic with gtag config)
  - Custom events: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, `sign_up`, `generate_lead`
- Map existing Meta Pixel events to GA4 equivalents for unified tracking

**New files:**
- `src/hooks/useGoogleAnalytics.ts`
- Update `index.html` with gtag snippet

### Phase 5: Google Search Console Verification

**Add verification meta tag** to `index.html`:
```text
<meta name="google-site-verification" content="[VERIFICATION_CODE]" />
```

The user will need to:
1. Go to Google Search Console
2. Add the property (URL: https://soteriaeyeclinic.lovable.app)
3. Choose "HTML tag" verification method
4. Provide the verification code

### Phase 6: Enhanced Keyword Strategy

**Update meta keywords and descriptions** with Nigerian eye care industry terms:

Target keywords by page:
- **Homepage**: "eye care Nigeria", "designer eyewear Lagos", "prescription glasses online Nigeria", "premium eye clinic"
- **Eyewear**: "buy glasses online Nigeria", "designer frames", "prescription sunglasses", "affordable eyewear"
- **Eye Care**: "eye exam Lagos", "optometrist near me Nigeria", "vision test", "eye clinic Nigeria"
- **Booking**: "book eye exam online", "optometry appointment Nigeria"
- **Virtual Try-On**: "virtual try on glasses", "AI glasses try on", "try glasses online"

### Phase 7: TikTok Pixel (Future -- Pending Account Setup)

When ready, add TikTok Pixel similar to Meta Pixel:
- Script tag in `index.html`
- `useTikTokPixel` hook for event tracking
- Map standard events: PageView, ViewContent, AddToCart, PlaceAnOrder

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useSEO.ts` | Dynamic meta tag management hook |
| `src/components/seo/JsonLd.tsx` | Schema.org JSON-LD structured data component |
| `src/components/seo/index.ts` | SEO component exports |
| `supabase/functions/sitemap/index.ts` | Dynamic XML sitemap generator |

### Modified Files
| File | Changes |
|------|---------|
| `index.html` | Add Google Search Console verification tag placeholder |
| `public/robots.txt` | Add Sitemap directive |
| `src/pages/Index.tsx` | Add useSEO + Organization JsonLd |
| `src/pages/Eyewear.tsx` | Add useSEO |
| `src/pages/EyeCare.tsx` | Add useSEO |
| `src/pages/Booking.tsx` | Add useSEO |
| `src/pages/TryOn.tsx` | Add useSEO |
| `src/pages/ProductDetail.tsx` | Add useSEO + Product JsonLd |
| `src/pages/Branches.tsx` | Add useSEO + LocalBusiness JsonLd |
| `src/pages/About.tsx` | Add useSEO |
| `src/pages/Contact.tsx` | Add useSEO |
| `src/pages/FAQ.tsx` | Add useSEO + FAQPage JsonLd |
| `src/pages/StyleQuiz.tsx` | Add useSEO |
| Additional pages | Add useSEO with appropriate content |

---

## Blocked / Needs User Input

| Item | What's Needed | Why |
|------|--------------|-----|
| Google Analytics 4 | GA4 Measurement ID (`G-XXXXXXXXXX`) | Cannot set up tracking without it |
| Google Search Console | Verification code after adding property | Need code to add meta tag |
| TikTok Pixel | TikTok Pixel ID | Future phase, requires TikTok for Business account |
| Google Ads Conversion | Google Ads conversion ID + label | Only if running Google Ads |

---

## Implementation Order

1. **`useSEO` hook + apply to all pages** -- immediate SEO lift
2. **JSON-LD structured data** -- rich snippets in search results
3. **XML Sitemap edge function + robots.txt update** -- proper indexing
4. **Google Analytics 4** -- requires user's GA4 ID
5. **Search Console verification** -- requires user's verification code
6. **TikTok Pixel** -- future phase
