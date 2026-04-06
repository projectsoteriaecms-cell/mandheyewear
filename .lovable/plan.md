

## Testing the Full Order → Payment → Zoho Reconciliation Flow

### What We're Testing

The complete chain: Customer adds items to cart → Checkout → Paystack test payment → Order created → Auto-push to Zoho Books → Reconciliation card updates on dashboard.

### Current State (Already Wired)

1. **Checkout → Zoho push**: Already connected (line 196 in Checkout.tsx). After successful Paystack verification, a fire-and-forget call pushes the order to Zoho Books.
2. **Edge function `push_order`**: Creates a Sales Order in Zoho Books with line items, customer info, and shipping address.
3. **Admin Orders page**: Shows sync status per order with manual "Push to Zoho" button.
4. **Reconciliation card**: Shows push stats on the Inventory page.

### The Problem for Testing

The `push_order` action requires products in the order to have a `zoho_item_id` set (line 887-894 in zoho-sync). If the M&H e-commerce products (the ones with images that customers buy) don't have `zoho_item_id` mapped, the Zoho push will fail with "No items with Zoho mapping found."

### Test Plan (Step-by-Step)

**Step 1 — Verify product mapping**
Check how many M&H products have `zoho_item_id` set. If none/few do, we need to ensure at least a couple of test products are linked before testing.

**Step 2 — Place a test order using Paystack test mode**
- Log in as a customer
- Add a Zoho-mapped product to cart
- Complete checkout with test card: `4084 0840 8408 4081`, CVV: `408`, OTP: `123456`
- Confirm order is created with `payment_status = 'paid'`

**Step 3 — Verify Zoho push fired**
- Check `zoho_sync_log` for a `push_order` entry matching the order
- Check edge function logs for any errors
- Verify the Sales Order appeared in Zoho Books

**Step 4 — Verify reconciliation dashboard**
- Go to Admin → Inventory and confirm the Reconciliation Card shows "1 synced"
- Go to Admin → Orders and confirm the order shows as synced

**Step 5 — Test the manual push fallback**
- If the auto-push failed (e.g., missing mapping), use the "Push to Zoho" button on the Admin Orders page

### What I'll Build

1. **Quick data check** — Query how many purchasable products have `zoho_item_id` set. If zero, we'll need to either run a sync or manually map a test product before the test can succeed.
2. **Test the edge function directly** — Call the `push_order` action with a known order ID (if any exist) to verify the Zoho API connection works, without needing to go through checkout.
3. **Fix any gaps** — If the auto-push silently fails due to missing mappings, add better error visibility (e.g., log to `zoho_sync_log` even when no items have Zoho IDs, so the reconciliation card shows the failure).

### Shall I Start?

I'll begin by querying the database to check product mappings and existing orders, then test the edge function directly. This will tell us exactly where we stand before you need to place a test payment.

