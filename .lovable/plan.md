

## Fix Resend Email Sender Domain Across Edge Functions

### Problem
Three edge functions send emails via Resend but two use the wrong sender address (`onboarding@resend.dev` — Resend's restricted test address). This means emails to real users are blocked unless the recipient is the Resend account owner. The `send-user-invitation` function already uses the correct domain.

### Issues per function

| Function | Current `from` | CORS headers |
|---|---|---|
| `send-tryon-result` | `onboarding@resend.dev` | OK |
| `send-appointment-confirmation` | `onboarding@resend.dev` | Missing new Supabase client headers |
| `send-user-invitation` | `notify.mandheyewear.com` | Missing new Supabase client headers |

### Fix

**`send-tryon-result/index.ts`** (line 153)
- Change `from: "Soteria Eye Clinic <onboarding@resend.dev>"` → `from: "Soteria Eye Clinic <noreply@notify.mandheyewear.com>"`

**`send-appointment-confirmation/index.ts`** (lines 8-9, 83)
- Update CORS `Access-Control-Allow-Headers` to include full Supabase client headers
- Change `from: "Soteria Eye Clinic <onboarding@resend.dev>"` → `from: "Soteria Eye Clinic <noreply@notify.mandheyewear.com>"`

**`send-user-invitation/index.ts`** (lines 7-8)
- Update CORS `Access-Control-Allow-Headers` to include full Supabase client headers (currently missing the `x-supabase-client-*` headers)

### Files changed
- `supabase/functions/send-tryon-result/index.ts` — sender address fix
- `supabase/functions/send-appointment-confirmation/index.ts` — sender address + CORS fix
- `supabase/functions/send-user-invitation/index.ts` — CORS fix

No database changes. No UI changes. Functions will be auto-deployed.

