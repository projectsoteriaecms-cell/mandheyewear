

# Plan: Automate Zoho OAuth Token Exchange

## Problem
Manually capturing the authorization code from the redirect URL and running a cURL command is error-prone. Instead, we'll build a backend function that handles the entire OAuth flow automatically.

## Approach
Create a `zoho-oauth` edge function that serves two purposes:
1. **`/start`** -- Redirects the user to Zoho's authorization page with the correct parameters
2. **`/callback`** -- Receives the authorization code from Zoho's redirect, exchanges it for a refresh token, and displays the token on screen for the user to copy

## Steps

### 1. Create `zoho-oauth` edge function
- **GET `?action=start`**: Constructs the Zoho OAuth URL with `client_id`, `redirect_uri` (pointing back to this function's callback), `scope=ZohoBooks.fullaccess.all`, `access_type=offline`, and redirects the browser there.
- **GET `?code=...`** (callback): Takes the `code` parameter, POSTs to `https://accounts.zoho.com/oauth/v2/token` with `grant_type=authorization_code`, and returns the refresh token in a simple HTML page for the user to copy.

### 2. Store Client ID and Secret first
Use the secrets tool to store `ZOHO_CLIENT_ID` and `ZOHO_CLIENT_SECRET` so the edge function can use them.

### 3. User flow
1. User updates their Zoho API Console redirect URI to point to the edge function callback URL
2. User visits the edge function `/start` URL in their browser
3. Zoho asks them to authorize
4. Zoho redirects back to the edge function with the code
5. The function exchanges it and shows the refresh token
6. User copies the refresh token back to Lovable to store as a secret

## Technical Details
- Edge function URL pattern: `https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/zoho-oauth`
- Redirect URI to register in Zoho Console: `https://ispizamxlrukxmysgyjv.supabase.co/functions/v1/zoho-oauth`
- The function will be temporary -- can be deleted after obtaining the refresh token

