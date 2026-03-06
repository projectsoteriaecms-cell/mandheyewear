

## Zoho Books Integration Plan

### Overview
Build a bi-directional integration between Zoho Books (master inventory) and this e-commerce platform using backend functions and database sync tables. Zoho controls products and stock; orders flow back to Zoho as sales orders/invoices.

### Step 1: Store Zoho API Credentials
Use the `add_secret` tool to securely store three secrets:
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN` (user needs to complete the OAuth code exchange first)
- `ZOHO_ORGANIZATION_ID` (Zoho Books org ID)

Before requesting secrets, guide the user through generating the refresh token from the authorization code.

### Step 2: Database Changes
Create a `zoho_sync_log` table to track sync operations:
- `id`, `sync_type` (product_sync, stock_sync, order_push), `status`, `records_processed`, `records_failed`, `error_details`, `started_at`, `completed_at`
- RLS: super_admin/branch_manager can view

Add `zoho_item_id` column to the `products` table to map local products to Zoho items.

### Step 3: Edge Function -- `zoho-sync`
A single edge function handling multiple actions:

**Token Management:**
- Exchange refresh token for access token (Zoho tokens expire every hour)
- Cache access token logic within the function

**Inbound Sync (Zoho → Platform):**
- `sync-products`: Fetch items from Zoho Books API (`/api/v3/items`), upsert into `products` table matching on `zoho_item_id` or SKU. Maps Zoho fields (name, rate, sku, description, status) to local schema.
- `sync-stock`: Fetch item stock levels, update `inventory` table quantities.

**Outbound Sync (Platform → Zoho):**
- `push-order`: When an order is confirmed, create a Zoho Books invoice or sales order via API (`/api/v3/invoices`), mapping order items to Zoho line items by `zoho_item_id`.

**Webhook Receiver:**
- Accept Zoho webhook POST notifications for item updates and stock changes, triggering immediate sync of affected items.

### Step 4: Edge Function -- `zoho-webhook`
A public (no JWT) endpoint that:
- Validates the webhook payload
- Processes item.created, item.updated, item.deleted events
- Updates the local `products` and `inventory` tables accordingly
- Logs to `zoho_sync_log`

### Step 5: Frontend -- Admin Sync Panel
Add a "Zoho Sync" section in admin Settings or as a sidebar nav item:
- Manual "Sync Now" button for full product/stock sync
- Sync history log from `zoho_sync_log`
- Last sync timestamp display
- Sync status indicator

### Step 6: Order Push Integration
Modify the existing `paystack-payment` edge function (or add a post-payment hook) to call `zoho-sync` with `push-order` action after successful order creation.

### Architecture

```text
Zoho Books                    Backend Functions              Database
───────────                   ──────────────────            ──────────
                              zoho-sync
  /api/v3/items ◄────────── (sync-products) ──────────► products (zoho_item_id)
  /api/v3/items ◄────────── (sync-stock)    ──────────► inventory
  /api/v3/invoices ◄──────── (push-order)   ◄────────── orders

  webhooks ──────────────────► zoho-webhook ──────────► products + inventory
                                                        zoho_sync_log
```

### Implementation Order
1. Request and store API credentials (secrets)
2. Add `zoho_item_id` column + `zoho_sync_log` table (migration)
3. Build `zoho-sync` edge function (token refresh + product/stock sync + order push)
4. Build `zoho-webhook` edge function (real-time updates)
5. Add admin UI sync panel
6. Wire order push into payment verification flow

### Technical Notes
- Zoho Books API base: `https://www.zohoapis.com/books` (or `.com.ng` for Nigeria data center -- will need to confirm)
- Token endpoint: `https://accounts.zoho.com/oauth/v2/token`
- Rate limits: 100 requests/min per org -- batch sync must respect this
- The `external_id` column on products can store the Zoho item ID, or we add a dedicated `zoho_item_id` column for clarity

