

# Swap Paystack to Test Mode

## Overview
Replace the live Paystack keys with test keys so you can safely test the full checkout flow without real charges.

## Changes

### 1. Update the backend secret: `PAYSTACK_SECRET_KEY`
- Replace the current live secret key with the test secret key: `sk_test_9951d2999cd0e6b7d7a0f6db4a52382e197a7160`
- This is used by the `paystack-payment` backend function to initialize and verify transactions

### 2. Update the frontend public key in `src/pages/Checkout.tsx`
- Change `PAYSTACK_PUBLIC_KEY` from `pk_live_7151d5547951be5e9c6ebcdf5a113e01a85b9418` to `pk_test_b65019a2e28f286dd4906d6aaa80bff38f035460`
- This is used by the Paystack popup in the browser

### 3. Redeploy the backend function
- Redeploy `paystack-payment` so it picks up the new secret value

## Testing After the Swap
Once swapped, you can test with Paystack's test card:
- Card number: `4084 0840 8408 4081`
- Expiry: any future date
- CVV: `408`
- OTP: `123456`

No real money will be charged in test mode.

## Technical Details

**Files modified:**
- `src/pages/Checkout.tsx` (line 29 -- swap public key constant)

**Secrets updated:**
- `PAYSTACK_SECRET_KEY` -- replaced with test secret key

**Functions redeployed:**
- `paystack-payment`

