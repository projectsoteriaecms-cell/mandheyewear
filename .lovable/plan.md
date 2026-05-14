## Goal

Add an engaging WhatsApp follow-through path for eye-exam bookings. The on-site booking flow remains the primary onboarding journey, but a dedicated "Book on WhatsApp" option will deep-link the user into a pre-filled, structured WhatsApp message that asks (or confirms) preferred branch, service, and appointment time — so leads who prefer chat get an instant, guided conversation with our team.

## Where the CTA appears

1. **Booking page (`/booking`)** — A new "Prefer WhatsApp? Chat with us instead" link/button under the stepper, visible at every step. The message auto-fills with whatever the user has already selected (branch, service, date, time, notes). If nothing selected yet, it sends the structured prompt template.
2. **EyeCare page (`/eyecare`)** — A secondary "Book via WhatsApp" button next to each existing "Book an Appointment" CTA (hero + bottom CTA card). Sends the structured prompt template (no selections context here).
3. **Floating WhatsApp button** — When the user is on `/booking`, override the existing eye-care template to use the same structured booking template (auto-filled if selections exist).

## Message templates

**Structured prompt (no selections yet):**
```
Hello M&H Eye Care 👋

I'd like to book an eye exam. Please help me confirm:

• Preferred Branch: 
• Service Needed: 
• Preferred Date & Time: 
• Full Name: 
• Phone Number: 

Looking forward to your reply.
```

**Auto-filled (partial or full selections from booking form):**
```
Hello M&H Eye Care 👋

I'd like to book an eye exam with these details:

• Branch: {selectedBranch.name or "—"}
• Service: {selectedService.label or "—"}
• Date: {formatted date or "—"}
• Time: {formatted time or "—"}

{notes ? "Notes: " + notes : ""}

Please confirm availability. Thank you!
```

## Technical changes

1. **New helper** `src/shared/lib/whatsappBooking.ts`
   - Exports `WHATSAPP_NUMBER` constant (reuse `2349169849266`).
   - `buildBookingWhatsAppMessage({ branchName?, serviceLabel?, dateLabel?, timeLabel?, notes? })` returns the structured or auto-filled string.
   - `buildBookingWhatsAppUrl(params)` returns the full `https://wa.me/...?text=...` URL.

2. **`src/pages/Booking.tsx`**
   - Import helper. Compute branch/service/date/time labels from existing state.
   - Add a small "Prefer WhatsApp? Chat to book directly →" link with WhatsApp icon below the stepper (visible steps 1–4), opening the auto-filled URL in a new tab.

3. **`src/pages/EyeCare.tsx`**
   - Add a `Button variant="outline"` next to each "Book an Appointment" CTA (hero + bottom card) linking to the structured prompt URL. Use `WhatsappLogo` from `@phosphor-icons/react`.

4. **`src/components/WhatsAppButton.tsx`**
   - When `location.pathname.startsWith("/booking")`, use the new structured booking template instead of the generic eye-care message.
   - (Booking page selections are component-local so the floating button uses the no-selection structured prompt; the inline CTA on the booking page itself handles the auto-fill case.)

## Out of scope

- No backend / edge function changes.
- No changes to the existing on-site booking flow itself (still primary path).
- No analytics tracking added (can be a follow-up if requested).
