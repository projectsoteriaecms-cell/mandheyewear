

## Enhanced Checkout, Order Notifications, and Logistics Operations System

### What This Covers
The user wants five things:
1. **Simpler, universal address form** — easy to fill regardless of country, with phone + email always visible
2. **Order confirmation emails** sent to the operations team at `operations_businessmanger@soteriaeyeclinic.com`
3. **Logistics vendor integration flow** — a structured system for handing off orders to shipping partners
4. **Better order tracking** tied to logistics partner updates
5. **Operations fulfillment workflow** — admin-side order management

---

### 1. Simplified Address Form (Checkout.tsx)

**Current problem**: Too many conditional fields, phone comes from profile (users can't edit it inline), no inline email field.

**Changes**:
- Add **phone number** and **email** as editable input fields directly on the checkout form (pre-filled from profile but editable)
- Simplify address: always show Address Line 1, City, State/Region (text input for international, dropdown for Nigeria), Country, Postal/Zip Code (optional for Nigeria, required for international)
- Keep **Landmark** field for Nigeria but make it a single combined "Address Line 2 / Landmark" field for all countries
- Remove the separate "confirm address" step — validate inline and let users proceed to payment directly
- Add proper phone validation: accept `+234...`, `0...` for Nigeria, and any `+XX...` for international

### 2. Order Confirmation Email to Operations

**What**: After successful payment verification, automatically send an email to `operations_businessmanger@soteriaeyeclinic.com` with full order details.

**How**:
- Create a new edge function `send-order-notification` that sends an email via Resend (already configured with `RESEND_API_KEY` and domain `notify.mandheyewear.com`)
- The email includes: order number, customer name, phone, email, full shipping address, shipping zone, items ordered, quantities, total amount, payment reference
- Call this function from `paystack-payment/index.ts` after successful order creation (non-blocking, like the Zoho sync)
- Use the existing Resend setup — sender: `Soteria Eye Clinic <noreply@notify.mandheyewear.com>`

### 3. Logistics Handoff System

**Database changes**:
- Add columns to `orders` table: `logistics_partner` (text), `tracking_number` (text), `logistics_notes` (text), `estimated_delivery_date` (date), `shipped_at` (timestamptz), `delivered_at` (timestamptz)
- Create `logistics_partners` table: id, name, contact_email, contact_phone, coverage_zones (text[]), api_endpoint (text, nullable for future integration), is_active (boolean)
- Seed with placeholder partners (e.g., "Lagos Local Dispatch", "Interstate Courier", "International Shipping Partner")

**Admin functionality**:
- On the admin order detail page, add a "Assign Logistics" section where staff can:
  - Select a logistics partner from the dropdown
  - Enter a tracking number
  - Update order status through the fulfillment pipeline
  - Add logistics notes
- When a logistics partner is assigned and tracking number entered, update order status to the appropriate "shipped" variant

### 4. Enhanced Order Tracking

- Show tracking number on the customer-facing order tracking page when available
- Show logistics partner name
- Show estimated delivery date based on zone
- Add a "Contact Support" section with operations email for shipping inquiries

### 5. Operations Email on Status Changes

- When admin updates order status (e.g., shipped, delivered), send a notification email to the customer AND to operations
- Customer email: "Your order has been shipped! Tracking number: XXX"
- Operations email: status change log for record-keeping

---

### Files to Create
- `supabase/functions/send-order-notification/index.ts` — order notification email to operations + customer
- Admin logistics assignment UI component (in existing admin orders page)

### Files to Modify
- `src/pages/Checkout.tsx` — simplified address form with inline phone/email
- `src/pages/OrderTracking.tsx` — show tracking number, logistics partner, estimated delivery
- `supabase/functions/paystack-payment/index.ts` — trigger order notification email after order creation
- Admin order management page — add logistics assignment section

### Database Migration
- Add logistics columns to `orders` table
- Create `logistics_partners` table with seed data
- RLS policies for logistics_partners (read: authenticated, write: admin only)

### Technical Notes
- Email sending uses existing Resend integration (secret already configured)
- Operations email: `operations_businessmanger@soteriaeyeclinic.com`
- Sender domain: `notify.mandheyewear.com` (already verified)
- All new edge function calls are non-blocking (fire-and-forget pattern like Zoho sync)

