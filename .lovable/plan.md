## Goal

Add a clear, friendly **email verification status indicator** so users know if their account is verified, and give them a one-click way to **resend the confirmation email** if it isn't.

## Where it will appear

Two complementary touch points — both driven by the same data (`user.email_confirmed_at` from Supabase Auth):

1. **Inline banner on the Dashboard** — at the top of `src/pages/Dashboard.tsx`, just under the welcome header, visible across every dashboard tab. This is the primary nudge.
2. **Status row in the Profile card** — inside `src/components/dashboard/ProfileSection.tsx`, next to the user's email field. This is the "at-a-glance" confirmation when they're already editing their profile.

Both render only when relevant — the banner hides itself once the email is verified.

## What it shows

### When email is NOT verified
- Amber/Flame-toned alert card with `MailWarning` icon
- Title: "Verify your email to secure your account"
- Body: "We sent a confirmation link to **{user.email}**. Check your inbox (and spam folder). Didn't get it?"
- Primary action button: **"Resend confirmation email"**
- Secondary action: **"I used a different email"** (links to a small inline form to update the email via `supabase.auth.updateUser({ email })`)
- After clicking Resend: button disables, shows a 60-second countdown ("Resend in 0:58") to prevent spamming, and toasts "Email sent — check your inbox."

### When email IS verified
- Quiet, single-line success indicator inside the Profile card only (no top-of-dashboard banner)
- Green check icon + "Email verified"
- Includes the date verified for trust ("Verified on Apr 19, 2026")

## Technical implementation

### New shared hook
**`src/modules/auth/hooks/useEmailVerification.ts`**
- Reads `user` from `useAuth()`
- Returns `{ isVerified, email, verifiedAt, resend, isResending, cooldownSeconds }`
- `resend()` calls `supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: window.location.origin } })`
- Manages 60s cooldown via `localStorage` key `email_verification_resent_at` so the timer survives page reloads
- Surfaces toast errors (rate-limit, network, etc.) using `useToast`

### New component
**`src/components/dashboard/EmailVerificationBanner.tsx`**
- Renders the unverified-state card described above
- Uses semantic tokens only (`bg-card`, `text-foreground`, `border-destructive/40`, `text-amber-*` via tailwind config tokens already in use)
- Returns `null` when `isVerified === true`
- Includes the inline "Use a different email" mini-form (optional expand-on-click, not always visible)

### Edits
- **`src/pages/Dashboard.tsx`** — import and render `<EmailVerificationBanner />` directly under the welcome heading (line ~95 area, above the `<Tabs>`).
- **`src/components/dashboard/ProfileSection.tsx`** — add a small `<VerifiedBadge />` row beside the email field showing either "Verified ✓" with date, or "Unverified — Resend" inline.
- **`src/components/dashboard/index.ts`** — export the new banner.

### What it does NOT change
- No database migrations — uses `auth.users.email_confirmed_at` directly through the session.
- No edge function changes — `supabase.auth.resend()` triggers the existing `auth-email-hook` automatically.
- No new RLS policies.

## Edge cases handled
- User signed up via Google OAuth → `email_confirmed_at` is set automatically by the provider, banner never shows.
- Auto-confirm is currently ON (per our previous diagnosis) → banner won't show for any current user. **This is the right behavior** — the moment you turn email confirmation ON in auth settings, the banner activates for the next signup who hasn't confirmed yet, with zero further code changes.
- Resend rate limits from Supabase (typically 1/min) are absorbed by the 60s cooldown so users don't see the raw error.
- If `resend()` returns an error like "Email already confirmed", the banner refreshes the session and self-hides.

## Out of scope (ask if you want these next)
- Admin-side view of which customers have unverified emails — that'd be a separate small panel in the admin Users page.
- Forcing unverified users to verify before checkout — would need a checkout-route guard; happy to add as a follow-up.
