

## Sync E-Commerce Transactions Back to Zoho + Stock Reconciliation

### Current State

Your Zoho integration currently works **one-way (inbound only)**:
- Products and stock levels are pulled FROM Zoho into your platform
- A `push_order` action already exists in the backend function to create Sales Orders in Zoho Books, but **it is never triggered** — no e-commerce orders are sent back to Zoho today

This means Zoho Books has no visibility into what's being sold on the e-commerce side, creating a gap in your accounting and stock records.

### What We'll Build

**1. Auto-push orders to Zoho after successful payment**
When a customer completes checkout and payment is verified, automatically create a Sales Order in Zoho Books. This connects the existing `push_order` backend action to the checkout flow.

**2. Stock reconciliation dashboard panel**
A new section on the Inventory page showing:
- Orders pushed to Zoho vs pending
- Stock discrepancies (platform stock vs last Zoho sync)
- Failed sync attempts that need attention

**3. Manual "Push to Zoho" button for older orders**
For any orders that were placed before this feature goes live, or that failed to sync, staff can manually push them from the Orders admin page.

### Technical Details

**File: `src/pages/Checkout.tsx`**
After successful payment verification, call `supabase.functions.invoke("zoho-sync", { body: { action: "push_order", order_id } })` in a fire-and-forget pattern (don't block the user's success screen if it fails).

**File: `src/pages/admin/Orders.tsx` (or order detail component)**
Add a "Sync to Zoho" button per order. Show sync status (synced/pending/failed) based on whether a matching `zoho_sync_log` entry exists for that order.

**File: `src/pages/admin/Inventory.tsx`**
Add a "Zoho Reconciliation" card showing:
- Last sync timestamp
- Orders awaiting push
- Stock variance summary (items where local stock differs from last Zoho pull)

**File: `supabase/functions/zoho-sync/index.ts`**
Minor update: the `push_order` action currently doesn't include a `customer_id` field in the Zoho Sales Order — we should add customer info from the order's profile if available.

### Files Modified
1. `src/pages/Checkout.tsx` — Auto-push order to Zoho after payment
2. `src/pages/admin/Inventory.tsx` — Add reconciliation summary card
3. `src/modules/integrations/hooks/useZohoSync.ts` — Add `pushOrder` method
4. Order admin component — Add manual "Sync to Zoho" button + status indicator
5. `supabase/functions/zoho-sync/index.ts` — Enhance `push_order` with customer data

