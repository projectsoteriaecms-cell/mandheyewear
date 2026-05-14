## Goal

Make the website booking form the **single point of capture** for every appointment across both brands. WhatsApp becomes a follow-up channel only — never an entry point. Every booking and every customer profile flows into **Brevo** as the CRM/engagement layer, with M&H and Soteria kept as separate contact lists so brand data stays clean.

Same architecture deploys to **M&H Eyewear** and **Soteria — Visionary Care** in parallel using the shared Supabase backend.

---

## Part 1 — Remove WhatsApp as a booking entry point (M&H + Soteria)

### What goes away
- "Book via WhatsApp" outline buttons on `EyeCare.tsx` (hero CTA + bottom CTA card)
- "Prefer WhatsApp? Chat to book directly →" link on `Booking.tsx` stepper
- The `/booking` override in the floating `WhatsAppButton.tsx` that pre-fills booking templates

### What replaces it
- After a booking is **saved to the database**, show a confirmation panel with:
  - Booking reference + summary
  - "Chat with us about this appointment on WhatsApp" button — pre-fills a message containing the booking reference, branch, service, date/time, and customer name. Staff opens this with full DB context already.
- The floating WhatsApp button on `/booking` falls back to the generic Eye Care enquiry message (no fake auto-fill).

### Net effect
- Zero leads bypass the database.
- WhatsApp conversations are now **enriched**, not blind — staff opens the chat already knowing exactly who and what.

---

## Part 2 — Brevo CRM sync layer (shared backend, per-brand lists)

### Connect Brevo
1. Link the Brevo connector via `standard_connectors--connect`. This installs `BREVO_API_KEY` (and `LOVABLE_API_KEY`) into edge functions automatically.
2. In Brevo, the user creates two contact lists ahead of time: **"M&H Eyewear"** and **"Soteria Eye Clinic"**. We store both list IDs in app secrets so each brand's frontend writes to the right list.

### New Supabase tables (shared backend, both brands use them)

```
crm_contacts
  id uuid pk
  brand_line enum (m_and_h_fashion | soteria_medical)
  user_id uuid (nullable — guest bookings allowed)
  email text
  phone text
  full_name text
  brevo_contact_id bigint (nullable, set after sync)
  source text (e.g. 'booking', 'shop', 'whatsapp_followup')
  consent_marketing boolean default false
  created_at, updated_at
  UNIQUE (brand_line, email)   -- separate contact per brand confirmed
```

```
crm_sync_log
  id uuid pk
  contact_id uuid fk
  appointment_id uuid (nullable)
  order_id uuid (nullable)
  event_type text ('contact_created' | 'appointment_logged' | 'order_logged' | 'whatsapp_followup_sent')
  brevo_response jsonb
  status text ('success' | 'failed' | 'retry')
  created_at
```

RLS: customers see only their own row; `branch_staff`/`branch_manager`/`super_admin` see all (mirrors existing `appointments` policy pattern).

### New edge function `brevo-sync`
Triggered server-side (not from the browser) whenever:
- A new `appointments` row is inserted → upsert contact + log appointment as a Brevo event/attribute.
- A new `orders` row is inserted (M&H only) → upsert contact + log order value.
- A WhatsApp follow-up is opened from the confirmation panel → log a `whatsapp_followup_sent` event.

The function:
1. Receives a payload from a DB trigger (via `pg_net` http call) or directly from the app.
2. Determines `brand_line` from the source frontend (passed as a header or in payload).
3. Upserts the contact in `crm_contacts` keyed on `(brand_line, email)`.
4. Calls Brevo `POST /contacts` (upsert with `updateEnabled: true`) targeting the brand's list ID.
5. Calls Brevo `POST /events` (or transactional attributes) to log the appointment/order.
6. Writes outcome to `crm_sync_log`. Failures are retried via a small cron-driven retry sweep.

NDPA compliance: only sync contacts whose booking form had `<DataProtectionConsent />` ticked. Marketing consent is a separate flag — bookings without marketing consent still sync (operational), but get tagged so Brevo automations exclude them from broadcast emails.

---

## Part 3 — Booking flow updates (M&H `Booking.tsx` + new Soteria booking page)

### Booking form additions
- Make name + phone + email required before step 1 advances (some are already collected; just confirm).
- Add an optional **"Chat with our team after booking"** consent toggle (default off) — controls whether the WhatsApp follow-up CTA is auto-emphasised on the confirmation screen.
- Keep the existing `<DataProtectionConsent />` gate.

### Confirmation screen (new component `BookingConfirmation.tsx`)
- Shows booking reference, branch, service, date/time.
- Primary CTA: "Add to calendar" / "View in dashboard".
- Secondary CTA: "Chat with our team on WhatsApp" — opens `wa.me` URL pre-filled with booking reference + summary so staff land in chat with full context.
- Fires the `brevo-sync` call client-side as a non-blocking `supabase.functions.invoke`.

### `WhatsAppButton.tsx` cleanup
- Remove the `/booking`-specific override and the `buildBookingWhatsAppMessage()` import.
- Floating button on `/booking` and `/eyecare` reverts to the generic enquiry template.

---

## Part 4 — Replicate to Soteria (parallel sprint)

The Soteria project (`f69985bd-…`) shares the Supabase backend. Replication means:

1. Copy the new files into Soteria with brand context flipped:
   - `src/shared/lib/brevoBrand.ts` exporting `BRAND_LINE = 'soteria_medical'` and the Soteria Brevo list ID env var.
2. Port the booking page (clinic-only services), the new `BookingConfirmation` component, and the WhatsApp follow-up CTA.
3. Hide all retail/eyewear routes — Soteria's nav already does this; just confirm `/shop`, `/product/*` stay disabled.
4. The `brevo-sync` edge function is shared (one function, branded by payload), so no duplication on the backend.
5. Add the Soteria-specific Brevo list ID via `secrets--add_secret` (`BREVO_SOTERIA_LIST_ID`); M&H gets `BREVO_MH_LIST_ID`.

Result: both sites write bookings to the same Supabase, but contacts and engagement events land in distinct Brevo lists for clean per-brand marketing.

---

## Technical summary (for reference)

**New files (M&H):**
- `src/components/booking/BookingConfirmation.tsx`
- `src/shared/lib/brevoBrand.ts`
- `src/shared/lib/whatsappFollowup.ts` (replaces `whatsappBooking.ts` — strictly post-booking)
- `supabase/functions/brevo-sync/index.ts`
- Migration: `crm_contacts`, `crm_sync_log` tables + RLS

**Edited (M&H):**
- `src/pages/Booking.tsx` — confirmation step uses new component, removes WhatsApp deep-link CTA
- `src/pages/EyeCare.tsx` — removes "Book via WhatsApp" buttons
- `src/components/WhatsAppButton.tsx` — drops `/booking` template override

**Deleted (M&H):**
- `src/shared/lib/whatsappBooking.ts`

**Soteria project (parallel):**
- Mirrored `Booking.tsx` (clinic services only), `BookingConfirmation.tsx`, `brevoBrand.ts` with `soteria_medical` brand line.
- Reuses the shared `brevo-sync` edge function on the same Supabase backend.

**Secrets to add:**
- `BREVO_MH_LIST_ID` (M&H project)
- `BREVO_SOTERIA_LIST_ID` (Soteria project)
- Brevo connector itself supplies `BREVO_API_KEY` automatically on link.

## Out of scope (for follow-up rounds)
- Building a dedicated in-app CRM dashboard (Brevo's own UI handles it for now).
- Backfilling existing `appointments`/`orders` rows into Brevo (one-shot script later if needed).
- WhatsApp Business API two-way sync (Brevo supports it — can wire up once you've activated WABA on your Brevo plan).