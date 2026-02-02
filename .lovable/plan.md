
# Meta Pixel Implementation Plan

## Overview
Install Meta Pixel (ID: `1429642005500083`) on the M&H Eyewear platform to enable conversion tracking, audience building, and attribution for Facebook/Instagram advertising campaigns.

## Implementation Approach

We'll implement Meta Pixel using a **React-native approach** rather than raw script injection. This provides:
- Type-safe event tracking
- Clean integration with existing hooks and components
- Automatic SPA (Single Page Application) route change tracking
- Easy maintenance and future customization

---

## Files to Create

### 1. Meta Pixel Hook (`src/hooks/useMetaPixel.ts`)
A custom hook that:
- Initializes the Facebook Pixel SDK on first load
- Exposes type-safe tracking methods for all standard events
- Handles SPA route changes with automatic PageView tracking

### 2. Type Definitions (`src/types/facebook-pixel.d.ts`)
TypeScript declarations for the global `fbq` function to ensure type safety.

---

## Files to Modify

### 1. `index.html`
Add the base Meta Pixel script in the `<head>` section (required for early initialization).

### 2. `src/App.tsx`
- Import and initialize the Meta Pixel hook
- Enable automatic PageView tracking on route changes

### 3. `src/hooks/useCart.ts`
Track **AddToCart** events when users add items to their cart.

### 4. `src/pages/ProductDetail.tsx`
Track **ViewContent** events when users view product pages.

### 5. `src/pages/Checkout.tsx`
Track **InitiateCheckout** events when users enter checkout.

### 6. `src/pages/Signup.tsx`
Track **CompleteRegistration** events when users create accounts.

### 7. `src/pages/Booking.tsx`
Track **Schedule** events when users book appointments.

---

## Events to Track

| Event | Trigger | Data Sent |
|-------|---------|-----------|
| `PageView` | Every route change | URL, referrer |
| `ViewContent` | Product detail page load | `content_ids`, `content_type`, `value`, `currency` |
| `AddToCart` | Add to cart button click | `content_ids`, `content_type`, `value`, `currency` |
| `InitiateCheckout` | Checkout page load | `content_ids`, `value`, `currency`, `num_items` |
| `CompleteRegistration` | Successful signup | `status: "complete"` |
| `Schedule` | Appointment confirmed | `branch`, `service` |
| `Search` | Eyewear filter/search | `search_string` |
| `Lead` | Contact form submission | `content_name` |

---

## Technical Details

### Base Pixel Script (index.html)

```html
<!-- Meta Pixel Code -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1429642005500083');
</script>
<noscript>
  <img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=1429642005500083&ev=PageView&noscript=1"/>
</noscript>
<!-- End Meta Pixel Code -->
```

### useMetaPixel Hook Structure

```text
useMetaPixel()
├── trackPageView() - Automatic on route changes
├── trackViewContent(product) - Product pages
├── trackAddToCart(product, quantity) - Cart additions
├── trackInitiateCheckout(items, value) - Checkout entry
├── trackCompleteRegistration() - Signups
├── trackSchedule(branch, service) - Bookings
├── trackSearch(query) - Search/filter actions
└── trackLead(source) - Contact forms
```

### SPA Route Change Tracking

Using `react-router-dom`'s `useLocation` hook:

```text
App.tsx
├── useLocation() to detect route changes
├── useEffect() to fire PageView on each change
└── Ensures Meta sees every "page" visit in SPA
```

---

## Integration Points

### Product Detail Page
```text
ProductDetail.tsx
└── useEffect on product load
    └── trackViewContent({
          content_ids: [product.id],
          content_type: 'product',
          content_name: product.name,
          value: product.price,
          currency: 'NGN'
        })
```

### Add to Cart
```text
useCart.ts → addToCart mutation
└── onSuccess callback
    └── trackAddToCart({
          content_ids: [productId],
          content_type: 'product',
          value: product.price * quantity,
          currency: 'NGN'
        })
```

### Checkout
```text
Checkout.tsx
└── useEffect on component mount
    └── trackInitiateCheckout({
          content_ids: cartItems.map(item => item.product_id),
          value: cartTotal,
          currency: 'NGN',
          num_items: cartCount
        })
```

### Registration
```text
Signup.tsx → handleSubmit success
└── trackCompleteRegistration({ status: 'complete' })
```

### Appointment Booking
```text
Booking.tsx → step 5 (confirmation)
└── trackSchedule({
      content_category: selectedService,
      content_name: selectedBranch.name
    })
```

---

## Performance Considerations

1. **Async Loading**: Pixel script loads asynchronously, won't block page render
2. **Deferred Initialization**: PageView fires after React hydration, not during SSR
3. **No Duplicate Events**: Hook checks for existing `fbq` before initializing
4. **Queue System**: Events queued if pixel hasn't loaded yet

---

## Privacy & Compliance

The pixel will respect user consent if you later add:
- Cookie consent banner
- `fbq('consent', 'revoke')` for opted-out users
- `fbq('consent', 'grant')` when consent given

---

## Testing & Verification

After implementation:
1. Install **Meta Pixel Helper** Chrome extension
2. Visit the site and verify events fire correctly
3. Check Events Manager in Meta Business Suite for real-time event logs
4. Verify parameter data (content_ids, values, currency) is accurate

---

## Summary of Changes

| File | Change Type | Purpose |
|------|-------------|---------|
| `index.html` | Modify | Add base pixel script |
| `src/types/facebook-pixel.d.ts` | Create | TypeScript declarations |
| `src/hooks/useMetaPixel.ts` | Create | Reusable tracking hook |
| `src/App.tsx` | Modify | Initialize pixel + PageView tracking |
| `src/pages/ProductDetail.tsx` | Modify | ViewContent event |
| `src/hooks/useCart.ts` | Modify | AddToCart event |
| `src/pages/Checkout.tsx` | Modify | InitiateCheckout event |
| `src/pages/Signup.tsx` | Modify | CompleteRegistration event |
| `src/pages/Booking.tsx` | Modify | Schedule event |
