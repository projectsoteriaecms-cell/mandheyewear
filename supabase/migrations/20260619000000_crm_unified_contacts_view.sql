-- ============================================================================
-- CRM: Unified Contacts View
-- ----------------------------------------------------------------------------
-- Problem: customer data lives in 3 disconnected silos:
--   - vto_email_leads      (anonymous + user leads captured from Virtual Try-On)
--   - profiles             (registered users: name, phone, frame prefs, Rx)
--   - newsletter_subscribers (email list)
-- ...with revenue in `orders` (keyed by auth user_id) and opt-out state in
-- `suppressed_emails`. There is no single "who is this person across every
-- touchpoint" record for segmentation and campaign targeting to query.
--
-- Solution: a read-only VIEW that unifies all sources keyed by normalized
-- email. Zero data migration, zero risk to existing flows. Segments and
-- campaigns query THIS view as the canonical contact layer.
--
-- security_invoker = true  -> the view runs with the querying user's
-- privileges, so existing RLS on the underlying tables still applies
-- (admin dashboard already reads these tables).
--
--   email_key (lower/trim email) is the universal join key.
--   user_id links a contact to orders/profiles when they are registered.
--
--        vto_email_leads ┐
--        newsletter_subs ┼── UNION distinct email ──┐
--        profiles        ┘                          │
--                                                   ▼
--                                            crm_contacts (view)
--                                                   ▲
--                       orders (via profiles.user_id, payment_status='paid')
-- ============================================================================

CREATE OR REPLACE VIEW public.crm_contacts
WITH (security_invoker = true)
AS
WITH all_emails AS (
  -- Universe of every distinct, non-empty, normalized email across sources.
  SELECT DISTINCT lower(trim(email)) AS email_key
  FROM public.vto_email_leads
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION
  SELECT DISTINCT lower(trim(email))
  FROM public.newsletter_subscribers
  WHERE email IS NOT NULL AND trim(email) <> ''
  UNION
  SELECT DISTINCT lower(trim(email))
  FROM public.profiles
  WHERE email IS NOT NULL AND trim(email) <> ''
),
vto AS (
  -- Try-on lead activity, collapsed to one row per email.
  SELECT
    lower(trim(email))                                            AS email_key,
    bool_or(marketing_consent)                                   AS vto_marketing_consent,
    min(created_at)                                              AS vto_first_seen,
    max(created_at)                                              AS vto_last_seen,
    count(*)                                                     AS try_on_count,
    (array_agg(frame_name        ORDER BY created_at DESC))[1]   AS last_frame_name,
    (array_agg(try_on_image_url  ORDER BY created_at DESC))[1]   AS last_try_on_image_url
  FROM public.vto_email_leads
  WHERE email IS NOT NULL AND trim(email) <> ''
  GROUP BY 1
),
news AS (
  SELECT
    lower(trim(email))      AS email_key,
    bool_or(is_active)      AS newsletter_active,
    min(subscribed_at)      AS newsletter_since
  FROM public.newsletter_subscribers
  WHERE email IS NOT NULL AND trim(email) <> ''
  GROUP BY 1
),
prof AS (
  -- Most-recently-updated profile wins when an email maps to >1 profile.
  SELECT
    lower(trim(email))                                          AS email_key,
    (array_agg(id           ORDER BY updated_at DESC))[1]       AS profile_id,
    (array_agg(user_id      ORDER BY updated_at DESC))[1]       AS user_id,
    (array_agg(full_name    ORDER BY updated_at DESC))[1]       AS full_name,
    (array_agg(phone_number ORDER BY updated_at DESC))[1]       AS phone,
    (array_agg(frame_preferences ORDER BY updated_at DESC))[1]  AS frame_preferences,
    bool_or(prescription_on_file)                              AS prescription_on_file,
    min(created_at)                                            AS profile_since
  FROM public.profiles
  WHERE email IS NOT NULL AND trim(email) <> ''
  GROUP BY 1
),
revenue AS (
  -- Lifetime value = sum of PAID orders, linked via the contact's profile user_id.
  -- Only registered contacts (with a profile + orders) accrue revenue.
  SELECT
    p.email_key,
    sum(o.total_amount)   AS lifetime_value,
    count(o.id)           AS order_count,
    max(o.created_at)     AS last_order_at
  FROM public.orders o
  JOIN (
    SELECT lower(trim(email)) AS email_key, user_id
    FROM public.profiles
    WHERE email IS NOT NULL AND trim(email) <> '' AND user_id IS NOT NULL
  ) p ON p.user_id = o.user_id
  WHERE o.payment_status = 'paid'
  GROUP BY 1
)
SELECT
  ae.email_key                                          AS email,
  prof.user_id,
  prof.profile_id,
  prof.full_name,
  prof.phone,
  prof.frame_preferences,
  COALESCE(prof.prescription_on_file, false)            AS prescription_on_file,

  -- Source membership flags
  (vto.email_key  IS NOT NULL)                          AS is_vto_lead,
  (news.email_key IS NOT NULL)                          AS is_newsletter_subscriber,
  (prof.email_key IS NOT NULL)                          AS is_registered,

  -- Consent / contactability
  COALESCE(vto.vto_marketing_consent, false)            AS marketing_consent,
  COALESCE(news.newsletter_active, false)               AS newsletter_active,
  EXISTS (
    SELECT 1 FROM public.suppressed_emails s
    WHERE lower(trim(s.email)) = ae.email_key
  )                                                     AS is_suppressed,

  -- Virtual Try-On engagement
  COALESCE(vto.try_on_count, 0)                         AS try_on_count,
  vto.last_frame_name,
  vto.last_try_on_image_url,

  -- Revenue / lifecycle
  COALESCE(revenue.lifetime_value, 0)                   AS lifetime_value,
  COALESCE(revenue.order_count, 0)                      AS order_count,
  revenue.last_order_at,

  -- Timeline (LEAST/GREATEST ignore NULLs in Postgres)
  LEAST(vto.vto_first_seen, prof.profile_since, news.newsletter_since) AS first_seen,
  GREATEST(vto.vto_last_seen, revenue.last_order_at)                   AS last_activity_at
FROM all_emails ae
LEFT JOIN vto     ON vto.email_key     = ae.email_key
LEFT JOIN news    ON news.email_key    = ae.email_key
LEFT JOIN prof    ON prof.email_key    = ae.email_key
LEFT JOIN revenue ON revenue.email_key = ae.email_key;

COMMENT ON VIEW public.crm_contacts IS
  'Unified read-only CRM contact layer over vto_email_leads + profiles + newsletter_subscribers, enriched with paid-order LTV and suppression state. Keyed by normalized email. Source of truth for segmentation and campaign targeting. Added 2026-06-19 (CRM phase 1).';

-- Admins read the CRM via the authenticated role; RLS on underlying tables
-- still governs row visibility because of security_invoker.
GRANT SELECT ON public.crm_contacts TO authenticated;
