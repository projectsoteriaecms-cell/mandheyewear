

# Paystack Payment Integration

## Overview
Connect the checkout flow to Paystack so customers can pay with cards, bank transfers, and USSD. The integration uses Paystack's inline popup on the frontend and a backend function to verify payments before creating orders.

## How It Works

1. Customer confirms their delivery address on the checkout page
2. They click "Pay" -- this calls a backend function to initialize a Paystack transaction
3. Paystack's popup opens in the browser for the customer to enter payment details
4. On successful payment, the popup returns a reference
5. A second backend function verifies the payment with Paystack's API
6. If verified, the order is created in the database, cart is cleared, and the customer is redirected to the order confirmation page

## Changes

### 1. Store the Paystack Secret Key as a backend secret
- The secret key (`sk_live_...`) will be stored securely as a backend secret called `PAYSTACK_SECRET_KEY`
- The public key (`pk_live_...`) is safe to use in frontend code

### 2. Create a backend function: `paystack-payment`
Handles two actions via a `POST` request:

**Initialize** (`action: "initialize"`):
- Receives: email, amount (in kobo), metadata (cart items, shipping address)
- Calls Paystack's `/transaction/initialize` API
- Returns: authorization_url, access_code, reference

**Verify** (`action: "verify"`):
- Receives: reference
- Calls Paystack's `/transaction/verify/:reference` API
- If payment is successful:
  - Creates an order in the `orders` table with the payment reference
  - Creates order items from the cart metadata
  - Clears the user's cart
  - Returns the order ID
- If payment failed, returns an error

### 3. Update the Checkout page (`src/pages/Checkout.tsx`)
- Load Paystack's inline JS script (`https://js.paystack.co/v1/inline.js`)
- Replace the placeholder `handlePayment` with real logic:
  1. Call the backend function to initialize a transaction
  2. Open Paystack's popup using `PaystackPop.setup()` with the access code
  3. On success callback: call verify endpoint, then navigate to `/order/:orderId`
  4. On close callback (user dismissed popup): show a toast and re-enable the button

### 4. Add Paystack inline script type declaration
- Add a TypeScript declaration for the `PaystackPop` global so the frontend can use the Paystack inline JS without type errors

## Security Considerations
- The secret key never touches the frontend -- all Paystack API calls with the secret key happen in the backend function
- Payment verification happens server-side before creating the order
- The backend function validates the authenticated user before processing
- Amount is calculated server-side from cart data to prevent tampering

## Technical Details

**Backend function endpoint:** `/paystack-payment`
- Method: POST
- Auth: Required (user must be logged in)
- Body for initialize: `{ action: "initialize", amount, email, metadata }`
- Body for verify: `{ action: "verify", reference }`

**Paystack popup flow:**
```text
Checkout Page --> Initialize (backend) --> Paystack Popup --> Success callback --> Verify (backend) --> Order Created --> /order/:id
```

**Config update (`supabase/config.toml`):**
```toml
[functions.paystack-payment]
verify_jwt = false
```

**Files created:**
- `supabase/functions/paystack-payment/index.ts`
- `src/types/paystack.d.ts`

**Files modified:**
- `src/pages/Checkout.tsx` (replace placeholder payment with real Paystack flow)
- `supabase/config.toml` (add function config)
