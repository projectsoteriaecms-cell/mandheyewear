import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const action = url.searchParams.get('action');
  const error = url.searchParams.get('error');

  const clientId = Deno.env.get('ZOHO_CLIENT_ID')!;
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET')!;
  const redirectUri = `${url.origin}${url.pathname}`;

  // If there's an error from Zoho
  if (error) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto">
        <h2 style="color:#dc2626">Authorization Failed</h2>
        <p>Error: ${error}</p>
        <p>Description: ${url.searchParams.get('error_description') || 'Unknown'}</p>
        <p><a href="${redirectUri}?action=start">Try again</a></p>
      </body></html>`,
      { headers: { 'Content-Type': 'text/html', ...corsHeaders } }
    );
  }

  // Step 1: Redirect to Zoho authorization
  if (action === 'start' || (!code && !action)) {
    const zohoAuthUrl = new URL('https://accounts.zoho.com/oauth/v2/auth');
    zohoAuthUrl.searchParams.set('scope', 'ZohoBooks.fullaccess.all');
    zohoAuthUrl.searchParams.set('client_id', clientId);
    zohoAuthUrl.searchParams.set('response_type', 'code');
    zohoAuthUrl.searchParams.set('redirect_uri', redirectUri);
    zohoAuthUrl.searchParams.set('access_type', 'offline');
    zohoAuthUrl.searchParams.set('prompt', 'consent');

    return Response.redirect(zohoAuthUrl.toString(), 302);
  }

  // Step 2: Exchange code for tokens
  if (code) {
    try {
      const tokenResponse = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          `<html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto">
            <h2 style="color:#dc2626">Token Exchange Failed</h2>
            <p>Error: ${tokenData.error}</p>
            <p><a href="${redirectUri}?action=start">Try again</a></p>
          </body></html>`,
          { headers: { 'Content-Type': 'text/html', ...corsHeaders } }
        );
      }

      const refreshToken = tokenData.refresh_token || 'Not provided (may already exist)';

      return new Response(
        `<html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto">
          <h2 style="color:#16a34a">✅ Authorization Successful!</h2>
          <h3>Refresh Token:</h3>
          <textarea readonly style="width:100%;height:80px;padding:8px;font-family:monospace;font-size:14px;border:2px solid #16a34a;border-radius:8px" onclick="this.select()">${refreshToken}</textarea>
          <p style="color:#666;font-size:14px">👆 Click to select, then copy this token and paste it back in Lovable.</p>
          ${tokenData.access_token ? `
          <h3>Access Token (for reference):</h3>
          <textarea readonly style="width:100%;height:60px;padding:8px;font-family:monospace;font-size:12px;border:1px solid #ddd;border-radius:8px" onclick="this.select()">${tokenData.access_token}</textarea>
          ` : ''}
          <p style="margin-top:20px;color:#888;font-size:12px">You can close this tab after copying the refresh token.</p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html', ...corsHeaders } }
      );
    } catch (err) {
      return new Response(
        `<html><body style="font-family:sans-serif;padding:40px;max-width:600px;margin:auto">
          <h2 style="color:#dc2626">Error</h2>
          <p>${err.message}</p>
          <p><a href="${redirectUri}?action=start">Try again</a></p>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html', ...corsHeaders } }
      );
    }
  }

  return new Response('Invalid request', { status: 400, headers: corsHeaders });
});
