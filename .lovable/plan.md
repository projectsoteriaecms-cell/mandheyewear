

# Fix: Zoho "Invalid Redirect URL" Error

## Root Cause
The redirect URI your edge function generates must **exactly** match what you registered in the Zoho API Console. Common mismatches include trailing slashes, protocol differences, or regional domain differences.

## What to verify

The redirect URI your function uses is:
```
https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/zoho-oauth
```

### Steps
1. **Check Zoho API Console** — Go to [Zoho API Console](https://api-console.zoho.com/) → your app → Settings → Authorized Redirect URIs. The URI must be **exactly**: `https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/zoho-oauth` (no trailing slash, no extra path).

2. **Check Zoho region** — If your Zoho account is on a regional domain (e.g., `.zoho.com.ng` for Nigeria, `.zoho.in` for India, `.zoho.eu` for EU), the OAuth endpoints must match. The current function uses `accounts.zoho.com`. If you're on a different region, I'll need to update the function to use the correct regional domain (e.g., `accounts.zoho.com.ng`).

3. **Check app type** — In Zoho API Console, the app should be a **Server-based Application** (not Client-based or Self Client). Only server-based apps support redirect URIs.

## Plan
- If it's a region mismatch: Update the `zoho-oauth` edge function to use the correct Zoho regional domain for both the auth URL and token URL.
- If it's a redirect URI mismatch: Confirm the exact URI registered and ensure it matches.

Before implementing, I need to know: **Which Zoho region/domain do you use?** (e.g., zoho.com, zoho.com.ng, zoho.in, zoho.eu) and **what type of app did you create in the API Console** (Server-based, Client-based, or Self Client)?

