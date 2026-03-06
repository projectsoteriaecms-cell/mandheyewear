
Goal: fix the persistent Zoho “invalid redirect URL” error by making the OAuth redirect URI deterministic and exactly match what Zoho expects.

What I found
- The OAuth function currently builds redirect_uri from `req.url`:
  - `const redirectUri = \`${url.origin}${url.pathname}\`;`
- Live function output shows Zoho receiving:
  - `redirect_uri=http://ispizamxlrukxmysgyjv.supabase.co/zoho-oauth`
- That is incorrect for this app (wrong scheme + missing `/functions/v1/...`), so Zoho rejects it as invalid.

Implementation plan
1) Make redirect URI canonical (code change in `supabase/functions/zoho-oauth/index.ts`)
- Stop deriving redirect URI from `req.url`.
- Build it from backend base URL:
  - `const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "")`
  - `const redirectUri = \`${baseUrl}/functions/v1/zoho-oauth\``
- Optional override support:
  - `ZOHO_REDIRECT_URI` secret (if present) takes priority.
- Normalize trailing slash so Zoho comparison is exact.

2) Keep Zoho US endpoints explicit
- Continue using:
  - `https://accounts.zoho.com/oauth/v2/auth`
  - `https://accounts.zoho.com/oauth/v2/token`
- Add a small constant block for endpoint clarity (and easier region switching later if needed).

3) Improve robustness of the function
- Add explicit checks for missing `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` and return a clear HTML error page.
- Upgrade CORS header list to full standard set used by other backend functions in this project.
- Preserve current success/error HTML UX.

4) Add a debug mode to eliminate guesswork
- Support `?action=debug` returning JSON with:
  - computed `redirectUri`
  - `authUrl` preview (without secrets)
  - accounts domain in use
- This gives a one-click verification that the exact redirect URI is correct before hitting Zoho login.

5) Verify backend config
- Confirm `supabase/config.toml` keeps:
  - `[functions.zoho-oauth]`
  - `verify_jwt = false`
- No database schema/policy changes needed.

Validation plan
1) Call `.../functions/v1/zoho-oauth?action=debug`
- Confirm returned `redirectUri` is exactly:
  - `https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/zoho-oauth`
2) Call `.../functions/v1/zoho-oauth?action=start`
- Confirm Zoho auth URL contains the same encoded redirect URI.
3) Complete consent flow
- Confirm callback succeeds and refresh token appears.
4) If still failing
- Re-check Zoho app settings for exact redirect URI match (character-for-character, no trailing slash, correct app record).

User-side checklist after deploy
- In Zoho API Console (Server-based app), Authorized Redirect URI must be exactly:
  - `https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/zoho-oauth`
- Ensure you are editing the same Client ID/Secret pair currently stored in backend secrets.
