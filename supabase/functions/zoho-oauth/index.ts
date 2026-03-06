import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZOHO_AUTH_URL = "https://accounts.zoho.com/oauth/v2/auth";
const ZOHO_TOKEN_URL = "https://accounts.zoho.com/oauth/v2/token";

const normalizeNoTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const htmlResponse = (html: string, status = 200) =>
  new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
  });

const renderPage = (title: string, content: string) => `
<html>
  <body style="font-family:sans-serif;padding:40px;max-width:640px;margin:auto;line-height:1.45">
    <h2>${title}</h2>
    ${content}
  </body>
</html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const action = url.searchParams.get("action");
  const oauthError = url.searchParams.get("error");

  const clientId = Deno.env.get("ZOHO_CLIENT_ID")?.trim() ?? "";
  const clientSecret = Deno.env.get("ZOHO_CLIENT_SECRET")?.trim() ?? "";
  const explicitRedirectUri = Deno.env.get("ZOHO_REDIRECT_URI")?.trim();
  const baseUrl = Deno.env.get("SUPABASE_URL")?.trim();

  const redirectUri = explicitRedirectUri
    ? normalizeNoTrailingSlash(explicitRedirectUri)
    : baseUrl
      ? `${normalizeNoTrailingSlash(baseUrl)}/functions/v1/zoho-oauth`
      : "";

  const buildZohoAuthUrl = () => {
    const authUrl = new URL(ZOHO_AUTH_URL);
    authUrl.searchParams.set("scope", "ZohoBooks.fullaccess.all");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    return authUrl;
  };

  if (action === "debug") {
    return new Response(
      JSON.stringify(
        {
          redirectUri,
          authUrl: clientId && redirectUri ? buildZohoAuthUrl().toString() : null,
          accountsDomain: "https://accounts.zoho.com",
          usingExplicitRedirectUri: Boolean(explicitRedirectUri),
          hasBaseUrl: Boolean(baseUrl),
          hasClientId: Boolean(clientId),
          hasClientSecret: Boolean(clientSecret),
        },
        null,
        2,
      ),
      {
        headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders },
      },
    );
  }

  if (!redirectUri) {
    return htmlResponse(
      renderPage(
        '<span style="color:#dc2626">Configuration Error</span>',
        `<p>Unable to compute redirect URI. Set <code>SUPABASE_URL</code> or <code>ZOHO_REDIRECT_URI</code>.</p>`,
      ),
      500,
    );
  }

  if (!clientId || !clientSecret) {
    const missing = [
      !clientId ? "ZOHO_CLIENT_ID" : null,
      !clientSecret ? "ZOHO_CLIENT_SECRET" : null,
    ]
      .filter(Boolean)
      .join(", ");

    return htmlResponse(
      renderPage(
        '<span style="color:#dc2626">Missing Secrets</span>',
        `<p>Missing required secret(s): <strong>${missing}</strong>.</p>`,
      ),
      500,
    );
  }

  if (oauthError) {
    return htmlResponse(
      renderPage(
        '<span style="color:#dc2626">Authorization Failed</span>',
        `
        <p>Error: <code>${oauthError}</code></p>
        <p>Description: ${url.searchParams.get("error_description") || "Unknown"}</p>
        <p><a href="${redirectUri}?action=start">Try again</a></p>
      `,
      ),
      400,
    );
  }

  if (action === "start" || (!code && !action)) {
    return Response.redirect(buildZohoAuthUrl().toString(), 302);
  }

  if (code) {
    try {
      const tokenResponse = await fetch(ZOHO_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || tokenData.error) {
        return htmlResponse(
          renderPage(
            '<span style="color:#dc2626">Token Exchange Failed</span>',
            `
            <p>Error: <code>${tokenData.error || `HTTP ${tokenResponse.status}`}</code></p>
            <p>${tokenData.error_description || "Please verify your Zoho app settings and try again."}</p>
            <p><a href="${redirectUri}?action=start">Try again</a></p>
          `,
          ),
          400,
        );
      }

      const refreshToken = tokenData.refresh_token || "Not provided (may already exist)";

      return htmlResponse(
        renderPage(
          '<span style="color:#16a34a">✅ Authorization Successful!</span>',
          `
          <h3>Refresh Token:</h3>
          <textarea readonly style="width:100%;height:80px;padding:8px;font-family:monospace;font-size:14px;border:2px solid #16a34a;border-radius:8px" onclick="this.select()">${refreshToken}</textarea>
          <p style="color:#666;font-size:14px">👆 Click to select, then copy this token and paste it back in Lovable.</p>
          ${tokenData.access_token ? `
            <h3>Access Token (for reference):</h3>
            <textarea readonly style="width:100%;height:60px;padding:8px;font-family:monospace;font-size:12px;border:1px solid #ddd;border-radius:8px" onclick="this.select()">${tokenData.access_token}</textarea>
          ` : ""}
          <p style="margin-top:20px;color:#888;font-size:12px">You can close this tab after copying the refresh token.</p>
        `,
        ),
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      return htmlResponse(
        renderPage(
          '<span style="color:#dc2626">Error</span>',
          `
          <p>${errorMessage}</p>
          <p><a href="${redirectUri}?action=start">Try again</a></p>
        `,
        ),
        500,
      );
    }
  }

  return new Response("Invalid request", { status: 400, headers: corsHeaders });
});

