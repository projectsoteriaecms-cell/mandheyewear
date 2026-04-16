

# Align M&H Platform with DCH E-Commerce Strategy Playbook

## Gap Analysis: What the Playbook Recommends vs. What's Already Built

| Strategy Area | Playbook Recommendation | Current Status |
|---|---|---|
| Face shape quiz + frame reco | Style quiz, personalized picks | DONE |
| Recently viewed / browsing reco | Carousel on home + shop | DONE |
| Virtual try-on as lead CTA | Inline VTO on PDP | DONE |
| WhatsApp button on every page | Fixed WhatsApp FAB | DONE |
| Naira pricing, VAT inclusive | Shown on PDP | DONE |
| Meta Pixel retargeting | Installed, events tracked | DONE |
| Prescription management | Upload + expiry in dashboard | DONE |
| Smart stock / request item | Multi-branch sourcing + request dialog | DONE |
| Abandoned cart recovery | 3-step WhatsApp/email sequence | NOT BUILT |
| Real-time social proof | "X people viewed this today" | NOT BUILT |
| Post-purchase automation | Order confirm → shipping → review → upsell | NOT BUILT |
| Loyalty / referral program | OptiPoints, referral credits | NOT BUILT |
| Price-lock urgency at checkout | "Price locked for 48h" | NOT BUILT |
| Payment failure retry flow | Auto-retry on Paystack failure | NOT BUILT |
| Prescription expiry nudge | 90-day automated reminder | NOT BUILT |
| Browse abandonment triggers | WhatsApp nudge after 2h no cart | NOT BUILT |
| Wishlist price-drop alerts | Notify when wishlisted item price drops | NOT BUILT |
| Post-eye-test follow-up | Clinic visit → frame shopping prompt | NOT BUILT |
| Birthday campaign | Personalized discount on birthday | NOT BUILT |
| Review collection | Post-delivery review request | NOT BUILT |

## Recommended Implementation Phases (Highest ROI First)

Given the scope, I recommend tackling this in **4 phases**, starting with the features that directly recover lost revenue and boost conversions.

### Phase 1: Conversion Boosters (Build Now)
The highest-impact, lowest-effort wins for the storefront UX.

**1. Real-Time Social Proof on PDP**
- Show "X people viewed this today" and "Y bought this week" badges on product pages
- Pull from existing `user_activity` table (view events already tracked)
- Add a `SocialProofBadge` component to the PDP

**2. Price-Lock Urgency at Checkout**
- Display "Price locked for 48 hours" message in the cart/checkout
- Reinforces commitment in a volatile Naira environment
- Pure frontend — no backend changes needed

**3. Payment Failure Recovery**
- Detect Paystack payment failures and show a retry prompt
- "Your payment didn't go through — try again" with a single button
- Edge function to send WhatsApp/email fallback after 15 minutes

### Phase 2: Automated Recovery Flows (Build Next)
The single highest-ROI automation investment per the playbook.

**4. Abandoned Cart Recovery Sequence**
- New `cart_abandonment_events` table to track carts left idle
- Scheduled edge function (cron) that checks for abandoned carts at 1h, 24h, 72h
- Sends WhatsApp (primary) + email (fallback) with product image, price, and direct cart link
- 72h message includes 10% discount code

**5. Browse Abandonment Nudge**
- If a user views a product 3+ times but never adds to cart, trigger a WhatsApp reminder after 2 hours
- Uses existing `user_activity` data

### Phase 3: Post-Purchase Lifecycle (Build After)
Turn one-time buyers into repeat customers.

**6. Post-Purchase Automation Chain**
- Order confirmed → shipping update → delivery notification → care guide
- Day 5: Review request (WhatsApp with link to Google review)
- Day 14: Cross-sell recommendation based on purchase
- Day 60-90: Prescription renewal nudge (links to Soteria clinic booking)
- New edge function `post-purchase-automation` with scheduled triggers

**7. Prescription Expiry Nudge**
- Check `prescriptions.expiry_date` weekly via cron edge function
- Send WhatsApp reminder when within 30 days of expiry
- Include Soteria booking link

### Phase 4: Loyalty and Engagement (Future)

**8. Loyalty Points System (OptiPoints)**
- New `loyalty_points` table (user_id, points, earned_from, created_at)
- Earn points on purchase, review, referral
- Redeem as discount at checkout

**9. Referral Program**
- New `referral_codes` table
- "Give ₦2,000, Get ₦2,000" mechanic
- Unique shareable link per user

**10. Birthday Campaign**
- Add `date_of_birth` to profiles
- Scheduled cron checks daily, sends personalized discount via WhatsApp

## What to Build First

I recommend starting with **Phase 1** (items 1-3) since they are entirely within our current tech stack, require minimal backend changes, and directly impact conversion rates. Shall I proceed with Phase 1?

### Technical Summary
- **Phase 1**: Frontend components only + 1 small edge function for payment retry
- **Phase 2**: 1 new table + 1-2 cron edge functions + WhatsApp Business API integration
- **Phase 3**: 1 cron edge function for lifecycle emails/WhatsApp
- **Phase 4**: 2 new tables + dashboard UI + checkout integration

