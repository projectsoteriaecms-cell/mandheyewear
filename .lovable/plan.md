

# Phase 2: Automated Recovery Flows

## Overview
Build two automated recovery systems that detect abandoned carts and browse abandonment, then send recovery messages via email (Resend, already configured) and WhatsApp deep links.

## 1. Database: `cart_abandonment_events` table

New table to track abandonment detection and recovery attempts.

```sql
CREATE TABLE public.cart_abandonment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cart_snapshot jsonb NOT NULL DEFAULT '[]',
  total_value numeric NOT NULL DEFAULT 0,
  currency text DEFAULT 'NGN',
  abandoned_at timestamptz NOT NULL DEFAULT now(),
  step_1_sent_at timestamptz,  -- 1h reminder
  step_2_sent_at timestamptz,  -- 24h reminder
  step_3_sent_at timestamptz,  -- 72h + discount
  discount_code text,
  recovered_at timestamptz,    -- null until they complete purchase
  created_at timestamptz DEFAULT now()
);
```

RLS: service-role only (cron edge function). Staff can SELECT for analytics.

## 2. Edge Function: `recover-abandoned-carts`

A single cron-triggered function that:

**Step 1 (1h):** Queries `cart_items` for users whose cart has been idle > 1 hour with no order placed. Creates a row in `cart_abandonment_events`. Sends a "You left something behind" email via Resend (reusing existing gateway pattern from `send-order-notification`). Includes product images, names, prices, and a direct link back to `/checkout`.

**Step 2 (24h):** Queries `cart_abandonment_events` where `step_1_sent_at` is set but `step_2_sent_at` is null and `abandoned_at` > 24h ago. Sends a follow-up "Still thinking about it?" email with social proof ("X people bought this today").

**Step 3 (72h):** Same pattern. Generates a 10% discount code (stored in `discount_code` column). Sends "Last chance — here's 10% off" email.

**Recovery detection:** When an order is placed, mark matching `cart_abandonment_events` as recovered.

## 3. Edge Function: `browse-abandonment-nudge`

Queries `user_activity` for users who viewed the same product 3+ times in the last 2 hours but have no `cart_items` for that product. Sends a targeted "Still eyeing this?" email with the product image and a direct link to the PDP.

Rate-limited: max 1 nudge per user per 24 hours (tracked via a simple `last_nudge_sent` field or checking `created_at` on sent records).

## 4. Cron Scheduling

Use `pg_cron` + `pg_net` to invoke both edge functions:
- `recover-abandoned-carts`: every 15 minutes
- `browse-abandonment-nudge`: every 30 minutes

## 5. Recovery Marking (Order Trigger)

Add logic in the existing order creation flow (or a small DB trigger on `orders`) to mark `cart_abandonment_events.recovered_at = now()` when a user who had an abandonment event completes a purchase.

## 6. WhatsApp Integration

Since there's no WhatsApp Business API configured, recovery emails will include a "Chat with us on WhatsApp" button linking to `wa.me/2348063363506?text=Hi, I need help completing my order {order_ref}`. This uses the existing WhatsApp number without requiring API setup.

## What This Does NOT Include
- No WhatsApp Business API (would need separate setup and approval)
- No discount code redemption at checkout (that's a Phase 4 loyalty feature)
- No frontend UI changes — this is entirely backend automation

## Files to Create/Modify
- **Migration**: `cart_abandonment_events` table + RLS policies
- **New**: `supabase/functions/recover-abandoned-carts/index.ts`
- **New**: `supabase/functions/browse-abandonment-nudge/index.ts`
- **Config**: `supabase/config.toml` (add function entries)
- **Cron**: pg_cron schedule via insert tool

## Technical Notes
- Emails sent via existing Resend gateway (`connector-gateway.lovable.dev/resend`)
- Uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for cart queries
- Cart staleness determined by `cart_items.created_at` (last item added/updated)
- Browse abandonment uses existing `user_activity` table (no schema changes)

