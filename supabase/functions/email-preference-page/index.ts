/**
 * email-preference-page
 *
 * Serves a self-contained HTML preference centre for email recipients.
 * No authentication required — contacts follow a signed link from their email.
 *
 * URL format: ?e={urlencode(email)}&t={preference_token_uuid}
 *
 * GET  — shows current preference form
 * POST — updates preferences, renders confirmation
 *
 * The token is validated by querying crm_preference_tokens (service_role).
 * On valid POST, calls crm_apply_email_preferences() to update source tables.
 *
 * Required env vars (set via `supabase secrets set`):
 *   SUPABASE_URL              (auto-injected)
 *   SUPABASE_SERVICE_ROLE_KEY (auto-injected)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Category definitions (mirrors DB seed) ──────────────────────────────────

const CATEGORIES = [
  {
    id: "marketing",
    label: "Marketing emails",
    description: "Special offers, new products, and personalised promotions",
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Monthly newsletter with eye health tips and clinic news",
  },
  {
    id: "appointment_reminders",
    label: "Appointment reminders",
    description: "Reminders for upcoming eye-care appointments and follow-ups",
  },
  {
    id: "promotions",
    label: "Promotions & discounts",
    description: "Seasonal campaigns and exclusive loyalty discounts",
  },
] as const;

// ── HTML helpers ──────────────────────────────────────────────────────────────

const PAGE_CSS = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
       background:#f0f4f8;color:#1e293b;min-height:100vh;padding:24px 16px}
  .wrap{max-width:520px;margin:0 auto}
  .card{background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.08);padding:32px}
  .logo{font-size:20px;font-weight:700;color:#0e7490;letter-spacing:-.5px;margin-bottom:24px}
  .logo span{color:#64748b;font-weight:400}
  h1{font-size:22px;font-weight:700;margin-bottom:8px}
  .sub{color:#64748b;font-size:14px;margin-bottom:28px;line-height:1.5}
  .email-chip{display:inline-block;background:#f1f5f9;border-radius:20px;
              padding:4px 12px;font-size:13px;color:#475569;margin-bottom:24px}
  .divider{border:none;border-top:1px solid #e2e8f0;margin:20px 0}
  .cat{display:flex;align-items:flex-start;gap:12px;padding:14px 0;border-bottom:1px solid #f1f5f9}
  .cat:last-of-type{border-bottom:none}
  .cat label{cursor:pointer;flex:1}
  .cat-label{font-size:15px;font-weight:600;color:#1e293b}
  .cat-desc{font-size:13px;color:#64748b;margin-top:2px;line-height:1.4}
  input[type=checkbox]{width:18px;height:18px;accent-color:#0e7490;flex-none;margin-top:2px;cursor:pointer}
  .btn-primary{display:block;width:100%;background:#0e7490;color:#fff;border:none;
               border-radius:8px;padding:13px;font-size:15px;font-weight:600;
               cursor:pointer;margin-top:24px;transition:background .15s}
  .btn-primary:hover{background:#0c6278}
  .btn-primary:disabled{opacity:.6;cursor:not-allowed}
  .unsub-link{display:block;text-align:center;margin-top:16px;font-size:13px;
              color:#94a3b8;text-decoration:underline;cursor:pointer}
  .unsub-link:hover{color:#dc2626}
  .banner{border-radius:8px;padding:14px 16px;font-size:14px;margin-bottom:20px;line-height:1.5}
  .banner.success{background:#f0fdf4;border:1px solid #bbf7d0;color:#166534}
  .banner.error{background:#fef2f2;border:1px solid #fecaca;color:#991b1b}
  .footer{margin-top:20px;font-size:12px;color:#94a3b8;text-align:center;line-height:1.6}
  .back{color:#0e7490;text-decoration:none;font-size:13px}
`.replace(/\n\s*/g, " ");

function buildPage(opts: {
  email: string;
  prefs: Record<string, boolean>;
  e: string;
  t: string;
  banner?: { type: "success" | "error"; message: string };
}): string {
  const { email, prefs, e, t, banner } = opts;
  const base = encodeURIComponent(e);

  const checkboxes = CATEGORIES.map((cat) => {
    const checked = prefs[cat.id] !== false; // default to true if no row
    return `
      <div class="cat">
        <input type="checkbox" id="${cat.id}" name="${cat.id}" ${checked ? "checked" : ""}>
        <label for="${cat.id}">
          <div class="cat-label">${cat.label}</div>
          <div class="cat-desc">${cat.description}</div>
        </label>
      </div>`;
  }).join("");

  const bannerHtml = banner
    ? `<div class="banner ${banner.type}">${banner.message}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Email Preferences — Soteria Eye Clinic</title>
  <style>${PAGE_CSS}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="logo">Soteria <span>Eye Clinic</span></div>
      <h1>Email Preferences</h1>
      <p class="sub">Choose which emails you'd like to receive from us.</p>
      <div class="email-chip">${email}</div>

      ${bannerHtml}

      <form method="POST" action="?e=${base}&t=${encodeURIComponent(t)}">
        <input type="hidden" name="action" value="update">
        ${checkboxes}
        <button type="submit" class="btn-primary">Save preferences</button>
      </form>

      <form method="POST" action="?e=${base}&t=${encodeURIComponent(t)}" style="margin:0">
        <input type="hidden" name="action" value="unsubscribe_all">
        <button type="submit" class="unsub-link">Unsubscribe from all emails</button>
      </form>

      <hr class="divider">
      <div class="footer">
        Soteria Eye Clinic · This link is unique to your email address and expires only when you request a new one.
      </div>
    </div>
  </div>
</body>
</html>`;
}

function errorHtml(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Soteria Eye Clinic</title>
  <style>${PAGE_CSS}</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <div class="logo">Soteria <span>Eye Clinic</span></div>
      <div class="banner error"><strong>${title}</strong><br>${message}</div>
      <p class="footer">If you need help, contact us at <a href="mailto:info@soteriaeyeclinic.com" class="back">info@soteriaeyeclinic.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      "Cache-Control": "no-store",
    },
  });
}

// ── Entry point ───────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const url    = new URL(req.url);
  const rawE   = url.searchParams.get("e") ?? "";  // URL-encoded email
  const t      = url.searchParams.get("t") ?? "";  // preference token UUID

  if (!rawE || !t) {
    return html(errorHtml("Invalid link", "This preference link is missing required parameters. Please click the link from your email again."), 400);
  }

  const email = decodeURIComponent(rawE).toLowerCase().trim();
  if (!email.includes("@")) {
    return html(errorHtml("Invalid link", "The email address in this link appears to be invalid."), 400);
  }

  // Validate UUID format (prevent injection)
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) {
    return html(errorHtml("Invalid token", "This preference link contains an invalid token."), 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Validate token
  const { data: tokenRow } = await supabase
    .from("crm_preference_tokens")
    .select("email")
    .eq("email", email)
    .eq("token", t)
    .maybeSingle();

  if (!tokenRow) {
    return html(errorHtml(
      "Link expired or invalid",
      "This preference link is no longer valid. Please contact Soteria Eye Clinic to receive a new one.",
    ), 403);
  }

  // ── GET: show preference form ─────────────────────────────────────────────

  if (req.method !== "POST") {
    const { data: prefRows } = await supabase
      .from("crm_email_preferences")
      .select("category_id, opted_in")
      .eq("email", email);

    const prefs: Record<string, boolean> = {};
    for (const row of prefRows ?? []) {
      prefs[row.category_id] = row.opted_in;
    }

    return html(buildPage({ email, prefs, e: rawE, t }));
  }

  // ── POST: update preferences ──────────────────────────────────────────────

  const form    = await req.formData();
  const action  = form.get("action") as string;

  if (action === "unsubscribe_all") {
    const { error } = await supabase.rpc("crm_apply_email_preferences", {
      p_email:           email,
      p_prefs:           {},
      p_unsubscribe_all: true,
    });

    if (error) {
      console.error("crm_apply_email_preferences error:", error);
      return html(buildPage({
        email, prefs: {}, e: rawE, t,
        banner: { type: "error", message: "Something went wrong. Please try again." },
      }));
    }

    return html(buildPage({
      email,
      prefs: Object.fromEntries(CATEGORIES.map((c) => [c.id, false])),
      e: rawE,
      t,
      banner: {
        type: "success",
        message: "You have been unsubscribed from all emails. You will only receive transactional messages (e.g. order confirmations).",
      },
    }));
  }

  // action = "update"
  const prefs: Record<string, boolean> = {};
  for (const cat of CATEGORIES) {
    prefs[cat.id] = form.get(cat.id) === "on";
  }

  const { error } = await supabase.rpc("crm_apply_email_preferences", {
    p_email:           email,
    p_prefs:           prefs,
    p_unsubscribe_all: false,
  });

  if (error) {
    console.error("crm_apply_email_preferences error:", error);
    return html(buildPage({
      email, prefs, e: rawE, t,
      banner: { type: "error", message: "Something went wrong. Please try again." },
    }));
  }

  return html(buildPage({
    email,
    prefs,
    e: rawE,
    t,
    banner: { type: "success", message: "Your preferences have been saved." },
  }));
});
