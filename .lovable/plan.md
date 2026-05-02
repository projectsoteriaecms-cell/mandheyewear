## Goal

Add a single, reusable modal that clearly explains the user's email verification status and lets them resend the confirmation email or update their email address. Trigger it from existing entry points (Profile email row + dashboard banner) so users get a focused, dedicated surface instead of the current inline-only flow.

## What to build

### 1. New component: `src/components/dashboard/EmailVerificationStatusDialog.tsx`

Controlled `Dialog` wrapping `useEmailVerification`. Two visual states:

**Verified state** (green theme)
- `ShieldCheck` icon header, title "Email verified"
- Body: "Your email `<email>` was verified on `<date>`. You're all set."
- Single "Done" close button.

**Unverified state** (amber theme)
- `MailWarning` icon header, title "Verify your email"
- Body explains: a confirmation link was sent to `<email>`; check inbox/spam.
- Sub-section "Steps to verify":
  1. Open the email from us
  2. Click the confirmation link
  3. Return here — status updates automatically
- Primary action: "Resend confirmation email" button with cooldown countdown (`mm:ss`) and spinner during send (mirrors banner behavior).
- Secondary action: "I used a different email" toggles an inline form (email input + "Send confirmation" / "Cancel") that calls `updateEmail()`.
- Footer note: "Still nothing after 5 minutes? Try updating your email or contact support."

Props: `open: boolean`, `onOpenChange: (open: boolean) => void`.

### 2. Wire triggers (no behavioral regressions)

- **`src/components/dashboard/ProfileSection.tsx`**: Replace the inline "Resend confirmation" link and the verified-date inline text with a single clickable status pill ("Verified" / "Not verified — view details") that opens the dialog. Keeps the visual hierarchy clean and gives both states a clear CTA into the modal.
- **`src/components/dashboard/EmailVerificationBanner.tsx`**: Add a "View details" link/button alongside the existing resend button that opens the same dialog. Keeps the banner's quick-resend affordance but funnels users wanting more context into the modal. Existing inline "I used a different email" toggle stays for backward compatibility.

### 3. Export

Add `EmailVerificationStatusDialog` to `src/components/dashboard/index.ts`.

## Technical notes

- Reuse existing `useEmailVerification` hook — no new logic needed; it already exposes `isVerified`, `verifiedAt`, `email`, `resend`, `updateEmail`, `isResending`, `cooldownSeconds`.
- Use shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`.
- Icons from `lucide-react`: `ShieldCheck`, `MailWarning`, `Loader2`, `RefreshCw`, `PencilLine`.
- Local state inside the dialog: `showEmailEdit`, `newEmail`, `isUpdating` (same pattern as the banner).
- After a successful `updateEmail`, reset the inline form but keep the dialog open so the user sees the success toast context.
- Auto-close the dialog when state transitions to verified (effect on `isVerified`).
- Respect existing 60s cooldown persisted in `localStorage` — no duplication.

## Files

- create `src/components/dashboard/EmailVerificationStatusDialog.tsx`
- edit `src/components/dashboard/ProfileSection.tsx` (swap inline status block for a status pill button that opens the dialog)
- edit `src/components/dashboard/EmailVerificationBanner.tsx` (add "View details" trigger)
- edit `src/components/dashboard/index.ts` (export)

## Out of scope

- Backend / Supabase auth template changes (already configured).
- New routes or page-level UI.
- Changes to OAuth / Google sign-in flows (auto-verified users will see the verified state).
