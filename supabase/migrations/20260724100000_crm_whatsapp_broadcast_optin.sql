-- Phase 5 (part 1): make consented WhatsApp leads reachable by broadcast.
--
-- Two stacked blockers kept phone-only WhatsApp leads unreachable even after
-- Phase 2 made them visible in crm_contacts:
--
--   1. REGRESSION from Phase 2 (20260723150000): the final SELECT read
--      COALESCE(vto.vto_marketing_consent, false) and never referenced the
--      phone-only branch, so every phone-only contact reported
--      marketing_consent = false. crm_eval_segment_rules filters on
--      "marketing_consent = true", so those contacts were dropped from EVERY
--      segment before any send logic ran. Real impact: 08143304129 consented
--      (marketing_consent = true, consent_channel = 'whatsapp') but the view
--      reported false.
--
--   2. The WhatsApp opt-in gate in send-campaign-whatsapp tests
--      is_newsletter_subscriber. newsletter_subscribers is keyed by EMAIL, so
--      a phone-only lead can never satisfy it and is always recorded as
--      "not a newsletter subscriber".
--
-- Fix: repair the COALESCE, and expose whatsapp_opted_in — WhatsApp-channel
-- marketing consent captured at the try-on gate (marketing_consent = true AND
-- consent_channel = 'whatsapp'). That is a real, auditable opt-in (NDPA 2023 /
-- WhatsApp policy), not a relaxation of consent: contacts who did not tick
-- marketing consent stay excluded.

DROP VIEW IF EXISTS public.crm_contacts CASCADE;

CREATE VIEW public.crm_contacts AS
WITH all_contact_keys AS (
  SELECT
    LOWER(TRIM(BOTH FROM vto_email_leads.email)) AS email_key,
    NULL::text AS phone_key
  FROM vto_email_leads
  WHERE vto_email_leads.email IS NOT NULL AND TRIM(BOTH FROM vto_email_leads.email) <> ''::text
  UNION
  SELECT
    NULL::text,
    'phone:' || LOWER(TRIM(BOTH FROM vto_email_leads.phone))
  FROM vto_email_leads
  WHERE vto_email_leads.phone IS NOT NULL
    AND TRIM(BOTH FROM vto_email_leads.phone) <> ''::text
    AND (vto_email_leads.email IS NULL OR TRIM(BOTH FROM vto_email_leads.email) = ''::text)
  UNION
  SELECT
    LOWER(TRIM(BOTH FROM newsletter_subscribers.email)),
    NULL::text
  FROM newsletter_subscribers
  WHERE newsletter_subscribers.email IS NOT NULL AND TRIM(BOTH FROM newsletter_subscribers.email) <> ''::text
  UNION
  SELECT
    LOWER(TRIM(BOTH FROM profiles.email)),
    NULL::text
  FROM profiles
  WHERE profiles.email IS NOT NULL AND TRIM(BOTH FROM profiles.email) <> ''::text
),
vto AS (
  SELECT
    LOWER(TRIM(BOTH FROM vto_email_leads.email)) AS email_key,
    bool_or(vto_email_leads.marketing_consent) AS vto_marketing_consent,
    -- WhatsApp-channel opt-in: consent given specifically on a WhatsApp capture.
    bool_or(vto_email_leads.marketing_consent
            AND vto_email_leads.consent_channel = 'whatsapp') AS wa_opt_in,
    min(vto_email_leads.created_at) AS vto_first_seen,
    max(vto_email_leads.created_at) AS vto_last_seen,
    count(*) AS try_on_count,
    (array_agg(vto_email_leads.frame_name ORDER BY vto_email_leads.created_at DESC))[1] AS last_frame_name,
    (array_agg(vto_email_leads.try_on_image_url ORDER BY vto_email_leads.created_at DESC))[1] AS last_try_on_image_url,
    (array_agg(vto_email_leads.full_name ORDER BY vto_email_leads.created_at DESC) FILTER (WHERE vto_email_leads.full_name IS NOT NULL))[1] AS vto_full_name,
    (array_agg(vto_email_leads.phone ORDER BY vto_email_leads.created_at DESC) FILTER (WHERE vto_email_leads.phone IS NOT NULL))[1] AS vto_phone
  FROM vto_email_leads
  WHERE vto_email_leads.email IS NOT NULL AND TRIM(BOTH FROM vto_email_leads.email) <> ''::text
  GROUP BY (LOWER(TRIM(BOTH FROM vto_email_leads.email)))
),
vto_phone_only AS (
  SELECT
    'phone:' || LOWER(TRIM(BOTH FROM vto_email_leads.phone)) AS phone_key,
    bool_or(vto_email_leads.marketing_consent) AS vto_marketing_consent,
    bool_or(vto_email_leads.marketing_consent
            AND vto_email_leads.consent_channel = 'whatsapp') AS wa_opt_in,
    min(vto_email_leads.created_at) AS vto_first_seen,
    max(vto_email_leads.created_at) AS vto_last_seen,
    count(*) AS try_on_count,
    (array_agg(vto_email_leads.frame_name ORDER BY vto_email_leads.created_at DESC))[1] AS last_frame_name,
    (array_agg(vto_email_leads.try_on_image_url ORDER BY vto_email_leads.created_at DESC))[1] AS last_try_on_image_url,
    (array_agg(vto_email_leads.full_name ORDER BY vto_email_leads.created_at DESC) FILTER (WHERE vto_email_leads.full_name IS NOT NULL))[1] AS vto_full_name,
    LOWER(TRIM(BOTH FROM vto_email_leads.phone)) AS vto_phone
  FROM vto_email_leads
  WHERE vto_email_leads.phone IS NOT NULL
    AND TRIM(BOTH FROM vto_email_leads.phone) <> ''::text
    AND (vto_email_leads.email IS NULL OR TRIM(BOTH FROM vto_email_leads.email) = ''::text)
  GROUP BY LOWER(TRIM(BOTH FROM vto_email_leads.phone))
),
news AS (
  SELECT
    LOWER(TRIM(BOTH FROM newsletter_subscribers.email)) AS email_key,
    bool_or(newsletter_subscribers.is_active) AS newsletter_active,
    min(newsletter_subscribers.subscribed_at) AS newsletter_since
  FROM newsletter_subscribers
  WHERE newsletter_subscribers.email IS NOT NULL AND TRIM(BOTH FROM newsletter_subscribers.email) <> ''::text
  GROUP BY (LOWER(TRIM(BOTH FROM newsletter_subscribers.email)))
),
prof AS (
  SELECT
    LOWER(TRIM(BOTH FROM profiles.email)) AS email_key,
    (array_agg(profiles.id ORDER BY profiles.updated_at DESC))[1] AS profile_id,
    (array_agg(profiles.user_id ORDER BY profiles.updated_at DESC))[1] AS user_id,
    (array_agg(profiles.full_name ORDER BY profiles.updated_at DESC))[1] AS full_name,
    (array_agg(profiles.phone_number ORDER BY profiles.updated_at DESC))[1] AS phone,
    (array_agg(profiles.frame_preferences ORDER BY profiles.updated_at DESC))[1] AS frame_preferences,
    bool_or(profiles.prescription_on_file) AS prescription_on_file,
    min(profiles.created_at) AS profile_since
  FROM profiles
  WHERE profiles.email IS NOT NULL AND TRIM(BOTH FROM profiles.email) <> ''::text
  GROUP BY (LOWER(TRIM(BOTH FROM profiles.email)))
),
revenue AS (
  SELECT
    p.email_key,
    sum(o.total_amount) AS lifetime_value,
    count(o.id) AS order_count,
    max(o.created_at) AS last_order_at
  FROM orders o
    JOIN (
      SELECT
        LOWER(TRIM(BOTH FROM profiles.email)) AS email_key,
        profiles.user_id
      FROM profiles
      WHERE profiles.email IS NOT NULL
        AND TRIM(BOTH FROM profiles.email) <> ''::text
        AND profiles.user_id IS NOT NULL
    ) p ON p.user_id = o.user_id
  WHERE o.payment_status = 'paid'::payment_status
  GROUP BY p.email_key
)
SELECT
  ack.email_key AS email,
  prof.user_id,
  prof.profile_id,
  COALESCE(prof.full_name, vto.vto_full_name, vto_phone_only.vto_full_name) AS full_name,
  COALESCE(prof.phone, vto.vto_phone, vto_phone_only.vto_phone) AS phone,
  prof.frame_preferences,
  COALESCE(prof.prescription_on_file, false) AS prescription_on_file,
  vto.email_key IS NOT NULL OR vto_phone_only.phone_key IS NOT NULL AS is_vto_lead,
  news.email_key IS NOT NULL AS is_newsletter_subscriber,
  prof.email_key IS NOT NULL AS is_registered,
  -- FIX (Phase 2 regression): fall through to the phone-only branch so a
  -- phone-only lead's consent is not silently reported as false.
  COALESCE(vto.vto_marketing_consent, vto_phone_only.vto_marketing_consent, false) AS marketing_consent,
  -- NEW: WhatsApp-channel opt-in, the consent basis for WhatsApp broadcast.
  COALESCE(vto.wa_opt_in, vto_phone_only.wa_opt_in, false) AS whatsapp_opted_in,
  COALESCE(news.newsletter_active, false) AS newsletter_active,
  (EXISTS (
    SELECT 1
    FROM suppressed_emails s
    WHERE LOWER(TRIM(BOTH FROM s.email)) = ack.email_key
  )) AS is_suppressed,
  COALESCE(vto.try_on_count, vto_phone_only.try_on_count, 0::bigint) AS try_on_count,
  COALESCE(vto.last_frame_name, vto_phone_only.last_frame_name) AS last_frame_name,
  COALESCE(vto.last_try_on_image_url, vto_phone_only.last_try_on_image_url) AS last_try_on_image_url,
  COALESCE(revenue.lifetime_value, 0::numeric) AS lifetime_value,
  COALESCE(revenue.order_count, 0::bigint) AS order_count,
  revenue.last_order_at,
  LEAST(
    vto.vto_first_seen,
    vto_phone_only.vto_first_seen,
    prof.profile_since,
    news.newsletter_since
  ) AS first_seen,
  GREATEST(
    vto.vto_last_seen,
    vto_phone_only.vto_last_seen,
    revenue.last_order_at
  ) AS last_activity_at
FROM all_contact_keys ack
  LEFT JOIN vto ON vto.email_key = ack.email_key
  LEFT JOIN vto_phone_only ON vto_phone_only.phone_key = ack.phone_key
  LEFT JOIN news ON news.email_key = ack.email_key
  LEFT JOIN prof ON prof.email_key = ack.email_key
  LEFT JOIN revenue ON revenue.email_key = ack.email_key;

-- Surface the WhatsApp opt-in to the send path. Signature changes (new column),
-- so this must be dropped and recreated rather than CREATE OR REPLACE.
-- Only send-campaign-whatsapp calls this, by name over RPC.
DROP FUNCTION IF EXISTS public.crm_get_unsent_whatsapp_batch(uuid, jsonb, integer);

CREATE FUNCTION public.crm_get_unsent_whatsapp_batch(
  p_campaign_id uuid,
  p_rules_json  jsonb,
  p_batch_size  integer DEFAULT 50
)
RETURNS TABLE(
  phone                    text,
  full_name                text,
  is_newsletter_subscriber boolean,
  whatsapp_opted_in        boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT
    r.phone,
    r.full_name,
    r.is_newsletter_subscriber,
    -- Joined back on phone: crm_eval_segment_rules' signature is shared by the
    -- email path too, so widening it would ripple further than this change needs.
    COALESCE(c.whatsapp_opted_in, false) AS whatsapp_opted_in
  FROM public.crm_eval_segment_rules(p_rules_json) AS r
  LEFT JOIN public.crm_contacts c ON c.phone = r.phone
  WHERE r.phone IS NOT NULL
  AND   btrim(r.phone) <> ''
  AND   r.phone NOT IN (
    SELECT contact_phone
    FROM   public.crm_campaign_whatsapp_ledger
    WHERE  campaign_id = p_campaign_id
  )
  LIMIT p_batch_size;
$function$;
