
# Paystack Payment Integration Plan

## Overview
This plan outlines the complete integration of Paystack payment processing into the checkout flow. The integration will enable customers to pay securely using cards, bank transfers, and USSD payments.

## Current State Analysis
Your checkout infrastructure is already well-prepared:
- **Checkout UI** (`src/pages/Checkout.tsx`) - Complete with address form, order summary, and payment button placeholder
- **Cart System** (`src/hooks/useCart.ts`) - Fully functional with add/remove/clear operations
- **Orders Database** - Tables exist for `orders` and `order_items` with proper enums for `payment_status` (pending, paid, failed, refunded) and `order_status`
- **Order Confirmation Page** (`src/pages/OrderConfirmation.tsx`) - Ready to display successful orders

## Implementation Phases

### Phase 1: Secret Configuration
Before any code changes, you'll need to provide your Paystack Secret Key. I'll prompt you to add this securely to the backend.

**What you need:**
- Log into your [Paystack Dashboard](https://dashboard.paystack.com)
- Navigate to Settings → API Keys
- Copy your **Secret Key** (starts with `sk_test_` for test mode or `sk_live_` for production)

### Phase 2: Backend Function Creation
Create a new backend function `paystack-payment` that handles:

**Initialize Transaction Endpoint:**
- Receives order details (amount, email, cart items, shipping address)
- Creates an order in the database with `payment_status: 'pending'`
- Calls Paystack API to initialize transaction
- Returns authorization URL and reference to frontend

**Verify Transaction Endpoint:**
- Receives Paystack reference after payment
- Calls Paystack API to verify transaction status
- Updates order `payment_status` to 'paid' or 'failed'
- Clears customer's cart on successful payment

### Phase 3: Frontend Integration
Install the `react-paystack` library and update the checkout page:

**Payment Flow:**
1. Customer clicks "Pay" button
2. Frontend calls backend to initialize payment
3. Paystack popup opens for secure payment
4. On success, frontend calls backend to verify
5. Customer redirected to Order Confirmation page

```text
+----------------+     +------------------+     +-----------------+
|   Checkout     | --> | Backend Function | --> |   Paystack API  |
|   (Frontend)   |     | (Initialize)     |     |                 |
+----------------+     +------------------+     +-----------------+
        |                                              |
        v                                              v
+----------------+     +------------------+     +-----------------+
| Paystack Popup | --> | Backend Function | --> | Update Order DB |
| (User Pays)    |     | (Verify)         |     | Clear Cart      |
+----------------+     +------------------+     +-----------------+
        |
        v
+----------------+
| Order          |
| Confirmation   |
+----------------+
```

### Phase 4: Database Updates
Add a `paystack_reference` field to track Paystack transaction references (the existing `payment_reference` column can be used for this).

---

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `supabase/functions/paystack-payment/index.ts` | Backend function for initialize + verify |
| Modify | `supabase/config.toml` | Register new edge function |
| Modify | `src/pages/Checkout.tsx` | Integrate Paystack popup |
| Create | `src/hooks/usePaystackPayment.ts` | Custom hook for payment logic |

---

## Technical Details

### Backend Function Structure
```text
paystack-payment/index.ts
├── POST /initialize
│   ├── Validate user authentication
│   ├── Validate cart items & calculate total
│   ├── Create order with pending status
│   ├── Call Paystack /transaction/initialize
│   └── Return { authorization_url, reference, order_id }
│
└── POST /verify
    ├── Receive { reference }
    ├── Call Paystack /transaction/verify
    ├── Update order payment_status
    ├── Clear user's cart
    └── Return { success, order_id }
```

### Security Measures
- Secret key stored securely in backend secrets (never exposed to frontend)
- JWT verification for authenticated users only
- Server-side amount calculation (never trust frontend amounts)
- Transaction verification prevents payment spoofing

### Payment Flow States
| State | Order Status | Payment Status | User Sees |
|-------|--------------|----------------|-----------|
| Cart confirmed | - | - | Checkout page |
| Payment started | pending | pending | Paystack popup |
| Payment success | confirmed | paid | Confirmation page |
| Payment failed | pending | failed | Error message |
| Payment cancelled | - | - | Checkout page |

---

## Testing Strategy
After implementation:
1. Test with Paystack test cards (provided by Paystack)
2. Test payment cancellation flow
3. Test network failure scenarios
4. Verify order appears in customer dashboard
5. Verify cart is cleared after payment

---

## What Happens When You Approve

1. I'll prompt you to add your **PAYSTACK_SECRET_KEY** to the backend secrets
2. Create the backend function with initialize and verify endpoints
3. Update the checkout page with Paystack integration
4. Create a custom hook for clean payment logic
5. Test the complete flow end-to-end

**Estimated implementation time:** 15-20 minutes after you provide the Paystack secret key
