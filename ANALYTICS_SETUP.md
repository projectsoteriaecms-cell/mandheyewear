# M&H Eyewear: Analytics & User Experience Tracking

Complete guide to connecting analytics platforms and measuring user experience.

---

## Part 1: Analytics Platforms (Choose 1-3)

### Option A: **Mixpanel** (Recommended for E-commerce)

**What it does**: Event-based tracking for funnels (product view → checkout → purchase), user segmentation, retention analysis.

**Best for**: Understanding checkout flow, product interest, user segments, retention.

**Setup:**
1. Sign up: https://mixpanel.com
2. Create M&H Eyewear project
3. Get API token from Settings
4. Add to your site:

```typescript
// src/main.tsx
import mixpanel from 'mixpanel-browser';

mixpanel.init('YOUR_TOKEN');

// Track page views
mixpanel.track('Page View', {
  page: window.location.pathname,
  timestamp: new Date().toISOString(),
});

// Track product views
function trackProductView(productId: string, sku: string) {
  mixpanel.track('Product Viewed', {
    product_id: productId,
    sku: sku,
    timestamp: new Date().toISOString(),
  });
}

// Track checkout
function trackCheckoutStart(cartValue: number) {
  mixpanel.track('Checkout Started', {
    cart_value: cartValue,
    item_count: cart.length,
    timestamp: new Date().toISOString(),
  });
}
```

**Dashboard shows:**
- Funnel: Browse → Add to Cart → Checkout → Purchase
- Top products viewed
- User cohorts (new vs returning)
- Retention (day 1, 7, 30)
- Event frequency by user segment

**Cost:** Free plan (up to 1K events/day), then $999/mo

---

### Option B: **Segment** (Best for Multi-Platform)

**What it does**: Central hub that collects events once, sends to multiple platforms (Google Analytics, Mixpanel, Amplitude, custom webhooks).

**Best for**: Sending data to multiple tools, reducing code changes, custom event transformation.

**Setup:**
1. Sign up: https://segment.com
2. Create M&H source (JavaScript)
3. Get write key
4. Add to site:

```typescript
// src/main.tsx
import { SegmentAnalytics } from '@segment/analytics-next';

const analytics = new SegmentAnalytics();

analytics.load({
  writeKey: 'YOUR_WRITE_KEY',
});

// Track everything - Segment routes to all connected platforms
analytics.track('Product Viewed', {
  product_id: 'mh-104',
  sku: 'MH-104',
  price: 45000,
  currency: 'NGN',
});

analytics.track('Checkout Started', {
  cart_value: 185000,
  items: 4,
});
```

**Then connect destinations:**
- Google Analytics (free)
- Mixpanel
- Amplitude
- Your own webhook (POST events to Supabase)

**Cost:** Free for up to 10K events/month, then $120/mo

---

### Option C: **Amplitude** (Best for Cohort Analysis)

**What it does**: Deep user journey analysis, cohort comparison, behavior prediction.

**Best for**: Understanding *why* users drop off, which user segments convert best.

**Setup:**
1. Sign up: https://amplitude.com
2. Create M&H project
3. Get API key
4. Add to site:

```typescript
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('YOUR_API_KEY', 'user@mandheyewear.com');

// Track with user properties
amplitude.track('Product Viewed', {
  product_id: 'mh-104',
  category: 'eyeglasses',
  brand: 'Cole Haan',
  price: 45000,
}, {
  user_id: currentUser.id,
  device_id: localStorage.getItem('device_id'),
});
```

**Dashboard shows:**
- User journeys (actual path through site)
- Cohorts (users who viewed X but didn't buy)
- Retention curves by feature
- Feature adoption

**Cost:** Free plan, then $995/mo

---

### Option D: **Google Analytics 4** (Free & Comprehensive)

**What it does**: Page traffic, user flow, conversion tracking, demographics.

**Best for**: Basic traffic understanding, free alternative.

**Setup:**
1. Create GA4 property at https://analytics.google.com
2. Get measurement ID
3. Add to site:

```typescript
// src/main.tsx
import { GoogleAnalytics } from 'ga-4-react';

// GA4 auto-tracks page views + basic events
GoogleAnalytics.initialize('G-YOUR_MEASUREMENT_ID');

// Track custom events
window.gtag('event', 'product_view', {
  product_id: 'mh-104',
  sku: 'MH-104',
  value: 45000,
  currency: 'NGN',
});

window.gtag('event', 'purchase', {
  transaction_id: 'order-123',
  value: 185000,
  currency: 'NGN',
  items: [
    { item_id: 'mh-104', item_name: 'Cole Haan CH4045', price: 45000, quantity: 1 },
  ],
});
```

**Dashboard shows:**
- Pages most visited
- User flow (where users go next)
- Conversion rate
- Traffic source (organic, direct, referral)

**Cost:** FREE

---

## Part 2: Events to Track

### Core E-commerce Events

```javascript
// 1. Product Interactions
amplitude.track('Product Viewed', {
  product_id,
  sku,
  category,
  price,
  position_on_page, // 1st product shown, 2nd, etc.
});

amplitude.track('Product Added to Cart', {
  product_id,
  sku,
  price,
  quantity,
});

amplitude.track('Wishlist Added', {
  product_id,
  sku,
});

// 2. Search & Filter
amplitude.track('Search', {
  query, // "Ray-Ban", "prescription frames"
  results_count,
  category_filtered, // e.g., "eyeglasses"
  price_range_filtered, // e.g., "40000-100000"
});

amplitude.track('Filter Applied', {
  filter_type, // "category", "brand", "price"
  filter_value, // "sunglasses", "price_desc"
});

// 3. Checkout Flow
amplitude.track('Checkout Started', {
  cart_value,
  items_count,
  first_time_buyer: true/false,
});

amplitude.track('Checkout Step Completed', {
  step_number, // 1 = email, 2 = shipping, 3 = payment
  step_name, // "email_entry", "shipping_address", "payment"
});

amplitude.track('Checkout Abandoned', {
  cart_value,
  items_count,
  last_step_completed, // "payment" means they got to payment form
  reason, // "too expensive", "slow checkout", "unclear shipping"
});

amplitude.track('Purchase', {
  transaction_id,
  value,
  currency,
  items: [
    { sku, quantity, price }
  ],
  coupon_used: true/false,
  shipping_speed, // "standard", "express", "same_day"
});

// 4. User Engagement
amplitude.track('Page View', {
  page_name,
  page_path,
  referrer,
  session_duration, // ms on previous page
});

amplitude.track('Video Watched', {
  video_id, // e.g., "virtual-try-on-demo"
  duration_seconds,
  completed: true/false,
});

amplitude.track('Review Left', {
  product_id,
  rating, // 1-5
  review_length, // char count
});

// 5. Support/Issues
amplitude.track('Chat Started', {
  page_viewed_when_started,
  issue_type, // inferred from message
});

amplitude.track('Error Encountered', {
  error_type, // "image_failed_to_load", "auth_failed"
  page,
  error_message,
});

amplitude.track('Feedback Submitted', {
  feedback_type, // "bug", "feature_request", "complaint"
  category,
  sentiment, // "positive", "negative", "neutral"
});
```

---

## Part 3: User Properties to Capture

Set these once per user to slice analytics by segment:

```javascript
amplitude.setUserProperties({
  // Basics
  email: user.email,
  first_name: user.first_name,
  
  // Location
  country: user.country || 'NG',
  city: user.city,
  
  // Behavior
  signup_date: user.created_at,
  last_purchase_date: user.last_order?.created_at,
  lifetime_value: user.total_spent || 0,
  purchase_count: user.order_count || 0,
  
  // Segments
  user_segment: determineSegment(user), // "VIP", "regular", "at_risk"
  device_type: /mobile|android|iPhone/.test(navigator.userAgent) ? "mobile" : "desktop",
  
  // Preferences
  preferred_brand: user.favorite_brand || null,
  prescription_user: user.has_prescription || false,
  
  // Engagement
  email_optin: user.email_optin || false,
  support_tickets: user.support_ticket_count || 0,
});
```

---

## Part 4: Integration with Supabase Feedback System

Send events **directly to Supabase `analytics_events` table** + to Mixpanel/Amplitude:

```typescript
async function trackEvent(eventType: string, metadata: object) {
  // Send to Supabase
  await supabase.from('analytics_events').insert({
    event_type: eventType,
    user_id: currentUser?.id || null,
    session_id: getSessionId(),
    metadata: metadata,
    page_path: window.location.pathname,
  });

  // ALSO send to Mixpanel/Amplitude
  if (window.mixpanel) {
    window.mixpanel.track(eventType, metadata);
  }
  if (window.amplitude) {
    amplitude.track(eventType, metadata);
  }
}
```

**Why both?**
- **Supabase**: Full control, custom queries, integrates with QA audit system
- **Mixpanel/Amplitude**: Beautiful dashboards, pre-built funnels, cohort analysis

---

## Part 5: Weekly Analytics Review

### Every Monday 11 AM:

1. **Mixpanel Dashboard**
   - Funnel: Browse → Purchase (what % at each step?)
   - Top 5 products viewed
   - Cohort retention (do new users return?)

2. **Amplitude Cohorts**
   - Users who viewed but didn't buy
   - Users who abandoned at payment
   - Compare: first-time vs repeat buyers

3. **Supabase `analytics_events`**
   - Run SQL to find error patterns
   - Check page performance (slow pages = dropoff?)

4. **Action Items**
   - Low funnel conversion at step X → optimize that step
   - Top product not selling → discount or promote elsewhere
   - High cart abandonment → email follow-up campaign

---

## Part 6: Quick Setup Checklist

- [ ] Choose platform (recommend: **Mixpanel + Google Analytics 4**)
- [ ] Sign up and create property
- [ ] Get API key/token
- [ ] Install SDK in `src/main.tsx`
- [ ] Track 5 core events (page view, product view, checkout, purchase, error)
- [ ] Set user properties on login
- [ ] Verify events flow to dashboard
- [ ] Create custom funnel: Browse → Checkout → Purchase
- [ ] Set up weekly review routine

---

## Part 7: Calculating ROI & Insights

### Key Metrics to Track

```sql
-- From analytics_events table
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as daily_active_users,
  COUNT(CASE WHEN event_type = 'page_view' THEN 1 END) as page_views,
  COUNT(CASE WHEN event_type = 'product_view' THEN 1 END) as product_views,
  COUNT(CASE WHEN event_type = 'checkout_started' THEN 1 END) as checkout_starts,
  COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) as purchases,
  -- Conversion rates
  ROUND(100.0 * COUNT(CASE WHEN event_type = 'purchase' THEN 1 END) 
    / NULLIF(COUNT(CASE WHEN event_type = 'checkout_started' THEN 1 END), 0), 2) as checkout_conversion_rate,
  ROUND(100.0 * COUNT(CASE WHEN event_type = 'checkout_started' THEN 1 END)
    / NULLIF(COUNT(CASE WHEN event_type = 'product_view' THEN 1 END), 0), 2) as product_to_checkout_rate
FROM analytics_events
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

### Questions to Answer Weekly

1. **Traffic & Interest**
   - How many unique users visited?
   - Which products got most views?
   - What was the browse-to-checkout rate?

2. **Conversion Health**
   - Checkout completion rate (started → purchased)?
   - Where do users drop off?
   - Is it mobile-specific?

3. **User Segments**
   - Do first-time buyers convert differently?
   - Which brands are most popular?
   - Geographic patterns?

4. **Issues to Fix**
   - High error rate on mobile checkout? → Optimize form
   - Product X has views but no sales? → Maybe pricing or quality photos
   - Users searching but not finding? → Improve search/filters

---

## Files to Update

Once you add analytics:
- `src/main.tsx` — Initialize analytics SDK
- `src/modules/storefront/components/ProductCard.tsx` — Track product views
- `src/modules/checkout/pages/Checkout.tsx` — Track checkout events
- `supabase/functions/auth-email-hook/index.ts` — Track signup events

---

## Next: Connect to Your Feedback Loop

Once analytics are running:

1. **QA Audit** (daily) → logs errors to `error_logs`
2. **Analytics** (continuous) → logs events to `analytics_events`
3. **User Feedback** (anytime) → logs to `user_feedback`
4. **Weekly Review** → Compare all three to identify root causes

Example: If you see high checkout abandonment + "checkout form slow" error logs + "payment page is slow" user feedback → **Fix: optimize payment endpoint**
