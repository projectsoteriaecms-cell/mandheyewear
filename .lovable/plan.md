

## Comprehensive Shipping Zones and Logistics System

### Current State
- Flat shipping: free above ₦50,000, else ₦3,500 — no zone awareness
- Address form: only Nigerian states, no country field, no phone validation, no landmark field
- No shipping zone calculation, no international support
- No order lifecycle tracking beyond basic status

### What Will Be Built

#### 1. Shipping Zones Database Table
A new `shipping_zones` table with zone-based fee tiers:

| Zone | Description | Example | Estimated Fee | Est. Delivery |
|------|-------------|---------|---------------|---------------|
| lagos_mainland | Lagos Mainland | Ikeja, Surulere | ₦2,500 | 1-2 days |
| lagos_island | Lagos Island | VI, Lekki, Ikoyi | ₦2,000 | 1-2 days |
| southwest | SW Nigeria | Ogun, Oyo, Osun | ₦4,500 | 2-4 days |
| southeast | SE Nigeria | Enugu, Imo, Anambra | ₦5,500 | 3-5 days |
| southsouth | SS Nigeria | Rivers, Delta, Edo | ₦5,000 | 3-5 days |
| northcentral | NC Nigeria | FCT, Kwara, Plateau | ₦5,500 | 3-5 days |
| northeast | NE Nigeria | Borno, Adamawa | ₦6,500 | 4-7 days |
| northwest | NW Nigeria | Kano, Kaduna | ₦6,000 | 4-7 days |
| west_africa | West Africa | Ghana, Cameroon | ₦15,000 | 7-14 days |
| africa_other | Rest of Africa | Kenya, South Africa | ₦25,000 | 10-21 days |
| international | Diaspora/Global | USA, UK, EU | ₦35,000 | 14-30 days |

Free shipping threshold still applies for Lagos zones above ₦50,000.

#### 2. Enhanced Checkout Address Form
- **Phone number**: required, validated format (Nigerian +234 or international)
- **Country selector**: Nigeria (default) + West African countries + international (popular diaspora destinations: USA, UK, Canada, Germany, etc.)
- **Conditional fields**: When Nigeria selected, show state dropdown. When international, show country + region/province text field + postal/zip code
- **Landmark field**: required for Nigerian addresses ("Nearest bus stop, landmark, or popular building")
- **Local Government Area (LGA)**: optional field for Nigerian addresses for more precise delivery
- **Address validation**: minimum length, required landmark for Nigerian orders

#### 3. Dynamic Shipping Fee Calculation
- A helper function `calculateShippingZone(country, state, city)` that maps the address to a zone
- Shipping fee updates live in the Order Summary as the user fills the address
- For Lagos: detect mainland vs island from city/area name
- Free shipping threshold: only for Lagos zones
- International orders: shipping fee always applies

#### 4. Enhanced Order Flow / Status Pipeline
Expand `order_status` enum to support the full fulfillment lifecycle:

```
confirmed → processing → packed → shipped_local → out_for_delivery → delivered
                                → shipped_interstate → in_transit_hub → out_for_delivery → delivered
                                → shipped_international → customs_clearance → in_transit_country → delivered
```

This maps to the Jumia/TEMU-style tracking experience. The existing `order_status` enum will be extended with new values.

#### 5. Order Tracking Enhancement
Update the `/track-order` page to show a step-by-step progress bar reflecting the expanded statuses, with estimated delivery dates based on zone.

#### 6. Checkout UX Changes
- Step 1: Address (enhanced with all new fields) — shows calculated shipping zone + fee in real-time
- Step 2: Review (shows delivery estimate based on zone)
- Step 3: Payment (total includes zone-based shipping)

### Database Changes (Migration)
1. Create `shipping_zones` table (zone_key, label, base_fee, free_shipping_threshold, min_days, max_days, is_active)
2. Seed zone data
3. Add `shipping_zone` and `shipping_fee` columns to `orders` table
4. Extend `order_status` enum with new statuses
5. Add `country`, `landmark`, `postal_code` to the shipping_address JSON schema (no table change needed — it's already JSONB)

### Files to Create/Modify
- **New**: `src/shared/lib/shippingZones.ts` — zone mapping logic and fee calculator
- **New**: `src/components/checkout/ShippingZoneIndicator.tsx` — shows zone, fee, and delivery estimate
- **Modify**: `src/pages/Checkout.tsx` — enhanced address form with country, landmark, phone validation, dynamic fee
- **Modify**: `src/components/checkout/OrderSummary.tsx` — accept zone-based shipping fee instead of flat rate
- **Modify**: `src/pages/OrderTracking.tsx` — expanded status timeline
- **Modify**: `supabase/functions/paystack-payment/index.ts` — store shipping_zone and shipping_fee on the order
- **Migration**: new table + enum extension + order columns

