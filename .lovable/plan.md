## What I found

**1. Tam Vincent does not exist in the auth system.**
I searched `auth.users` for any user whose name or email contains "tam" or "vincent" — zero matches. The 10 most recent signups (newest from April 19, 2026) do not include him. So either:
- His signup never completed (form errored out client-side, network failure, or he closed the tab before submit), **or**
- He used a different email/name than you're aware of.

**2. Your auth-email system is otherwise healthy.**
- Email domain `notify.mandheyewear.com` → ✅ verified and ready.
- `auth-email-hook` edge function is deployed and uses the correct queue-based pattern (`enqueue_email`).
- Templates exist for signup, magic-link, recovery, invite, etc.

**3. But — `email_send_log` has 0 auth_emails rows ever logged.**
Total rows in the log: 2. Rows for `template_name = 'auth_emails'`: **0**.
This is the real red flag. Every recent signup in `auth.users` has `confirmation_sent_at = NULL` except one (April 19) — meaning Supabase Auth is **not actually triggering the email hook for most signups**, OR the hook is firing but failing before it logs.

The most likely cause: **email confirmation is currently set to auto-confirm / disabled**, so most users get `email_confirmed_at` populated immediately at signup with no email ever sent. That matches the data — 9 of 10 recent users have `confirmation_sent_at = NULL` but `email_confirmed_at` set within milliseconds of `created_at`.

## Troubleshooting plan (what I'll do once you approve)

### Step 1 — Confirm with you which email Tam used
Before changing anything, ask Tam for the exact email address he typed. I'll then re-query `auth.users` to confirm whether the row exists at all. This tells us:
- **Row missing** → signup form failed; investigate client-side errors, password validation, or network.
- **Row exists, `email_confirmed_at` already set** → auto-confirm is on, no email was ever sent (by design).
- **Row exists, `confirmation_sent_at` set, `email_confirmed_at` NULL** → email was sent but didn't arrive (spam folder, suppression list, or delivery failure).

### Step 2 — Check Auth settings
Verify in Cloud → Users → Auth Settings whether **"Confirm email"** is currently ON. The data pattern strongly suggests it is OFF (auto-confirm), which means no signup emails are being sent at all. If you want users to verify their email before logging in, this needs to be turned on.

### Step 3 — Check the suppression list for Tam's email
Query `suppressed_emails` — if his address bounced or unsubscribed previously, all future sends are blocked.

### Step 4 — Test the full flow end-to-end
With a fresh test email I control, sign up and watch:
- `auth.users` row appears with `confirmation_sent_at` populated
- `email_send_log` gets a `pending` → `sent` row with `template_name = 'auth_emails'`
- Edge function logs for `auth-email-hook` and `process-email-queue` show success
- Email arrives in inbox (and spam folder is checked)

### Step 5 — Surface findings and fix
Based on what Steps 1–4 reveal, the fix is one of:
- Turn ON "Confirm email" in auth settings
- Remove Tam's address from suppression list (if applicable)
- Re-deploy `auth-email-hook` if logs show it's erroring
- Improve the signup form to surface errors to the user (so future failed signups don't go silent)

## What I need from you to proceed

1. **Tam's exact email address** (to look up his record).
2. Confirmation of intent: **do you want email confirmation required**, or is auto-confirm intentional? (This drives whether Step 2's fix is "turn it on" or "this is working as designed and Tam just didn't need an email.")

Once I have those two answers, I can execute Steps 1–5 and report back with a concrete fix.
