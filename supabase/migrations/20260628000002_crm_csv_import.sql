-- =============================================================================
-- CSV Contact Import
--
-- 1. Adds full_name and phone columns to vto_email_leads so contacts imported
--    via CSV have their names/phones visible in crm_contacts without needing
--    an auth account (profiles are linked to auth.users).
--
-- 2. Recreates crm_contacts VIEW to pull name/phone from vto_email_leads as
--    fallback when no profile exists.
--
-- 3. Updates crm_add_customer to save full_name and phone.
--
-- 4. Adds crm_bulk_import_contacts — bulk RPC for the CSV import dialog.
--    Takes up to 1 000 rows as JSONB; returns { imported, skipped, errors }.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Schema additions to vto_email_leads
-- ---------------------------------------------------------------------------

ALTER TABLE public.vto_email_leads
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone     TEXT;

COMMENT ON COLUMN public.vto_email_leads.full_name IS
  'Contact name supplied at lead capture or CSV import (no auth account required).';
COMMENT ON COLUMN public.vto_email_leads.phone IS
  'Phone number supplied at lead capture or CSV import.';

-- ---------------------------------------------------------------------------
-- 2. Recreate crm_contacts VIEW with vto name/phone fallback
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.crm_contacts
WITH (security_invoker = true)
AS
WITH all_emails AS (
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
  SELECT
    lower(trim(email))                                                             AS email_key,
    bool_or(marketing_consent)                                                    AS vto_marketing_consent,
    min(created_at)                                                               AS vto_first_seen,
    max(created_at)                                                               AS vto_last_seen,
    count(*)                                                                      AS try_on_count,
    (array_agg(frame_name        ORDER BY created_at DESC))[1]                    AS last_frame_name,
    (array_agg(try_on_image_url  ORDER BY created_at DESC))[1]                    AS last_try_on_image_url,
    -- Most-recent non-null name / phone from vto leads (set by CSV import or add-customer)
    (array_agg(full_name ORDER BY created_at DESC) FILTER (WHERE full_name IS NOT NULL))[1] AS vto_full_name,
    (array_agg(phone     ORDER BY created_at DESC) FILTER (WHERE phone IS NOT NULL))[1]     AS vto_phone
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
  SELECT
    lower(trim(email))                                           AS email_key,
    (array_agg(id           ORDER BY updated_at DESC))[1]        AS profile_id,
    (array_agg(user_id      ORDER BY updated_at DESC))[1]        AS user_id,
    (array_agg(full_name    ORDER BY updated_at DESC))[1]        AS full_name,
    (array_agg(phone_number ORDER BY updated_at DESC))[1]        AS phone,
    (array_agg(frame_preferences ORDER BY updated_at DESC))[1]   AS frame_preferences,
    bool_or(prescription_on_file)                               AS prescription_on_file,
    min(created_at)                                             AS profile_since
  FROM public.profiles
  WHERE email IS NOT NULL AND trim(email) <> ''
  GROUP BY 1
),
revenue AS (
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
  ae.email_key                                                   AS email,
  prof.user_id,
  prof.profile_id,
  -- Profile name takes priority; fall back to vto lead name (CSV import)
  COALESCE(prof.full_name, vto.vto_full_name)                    AS full_name,
  COALESCE(prof.phone,     vto.vto_phone)                        AS phone,
  prof.frame_preferences,
  COALESCE(prof.prescription_on_file, false)                     AS prescription_on_file,

  (vto.email_key  IS NOT NULL)                                   AS is_vto_lead,
  (news.email_key IS NOT NULL)                                   AS is_newsletter_subscriber,
  (prof.email_key IS NOT NULL)                                   AS is_registered,

  COALESCE(vto.vto_marketing_consent, false)                     AS marketing_consent,
  COALESCE(news.newsletter_active, false)                        AS newsletter_active,
  EXISTS (
    SELECT 1 FROM public.suppressed_emails s
    WHERE lower(trim(s.email)) = ae.email_key
  )                                                              AS is_suppressed,

  COALESCE(vto.try_on_count, 0)                                  AS try_on_count,
  vto.last_frame_name,
  vto.last_try_on_image_url,

  COALESCE(revenue.lifetime_value, 0)                            AS lifetime_value,
  COALESCE(revenue.order_count, 0)                               AS order_count,
  revenue.last_order_at,

  LEAST(vto.vto_first_seen, prof.profile_since, news.newsletter_since) AS first_seen,
  GREATEST(vto.vto_last_seen, revenue.last_order_at)                   AS last_activity_at
FROM all_emails ae
LEFT JOIN vto     ON vto.email_key     = ae.email_key
LEFT JOIN news    ON news.email_key    = ae.email_key
LEFT JOIN prof    ON prof.email_key    = ae.email_key
LEFT JOIN revenue ON revenue.email_key = ae.email_key;

GRANT SELECT ON public.crm_contacts TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. Update crm_add_customer to save full_name + phone
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crm_add_customer(
  p_email              TEXT,
  p_full_name          TEXT    DEFAULT NULL,
  p_phone              TEXT    DEFAULT NULL,
  p_marketing_consent  BOOLEAN DEFAULT FALSE,
  p_newsletter_opt_in  BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
BEGIN
  v_email := lower(trim(p_email));

  IF v_email IS NULL OR v_email = '' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Email is required');
  END IF;

  IF NOT (v_email ~* '^[^@]+@[^@]+\.[^@]+$') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid email format');
  END IF;

  INSERT INTO public.vto_email_leads (email, full_name, phone, marketing_consent, source)
  VALUES (v_email, NULLIF(trim(p_full_name), ''), NULLIF(trim(p_phone), ''), p_marketing_consent, 'crm_manual_add')
  ON CONFLICT (email) DO UPDATE SET
    full_name         = COALESCE(NULLIF(trim(EXCLUDED.full_name), ''), vto_email_leads.full_name),
    phone             = COALESCE(NULLIF(trim(EXCLUDED.phone), ''),     vto_email_leads.phone),
    marketing_consent = GREATEST(vto_email_leads.marketing_consent, EXCLUDED.marketing_consent);

  IF p_newsletter_opt_in THEN
    INSERT INTO public.newsletter_subscribers (email, is_active)
    VALUES (v_email, TRUE)
    ON CONFLICT (email) DO UPDATE SET is_active = TRUE;
  END IF;

  RETURN jsonb_build_object('success', true, 'email', v_email, 'message', 'Customer added successfully');
END;
$$;

GRANT EXECUTE ON FUNCTION public.crm_add_customer(TEXT,TEXT,TEXT,BOOLEAN,BOOLEAN) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. crm_bulk_import_contacts — batch CSV import
-- ---------------------------------------------------------------------------
-- p_rows: JSONB array of objects with keys:
--   email (required), full_name, phone, marketing_consent, newsletter_opt_in
-- Returns: { imported: N, skipped: M, errors: [{row, email, reason}] }
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crm_bulk_import_contacts(p_rows JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row         JSONB;
  v_email       TEXT;
  v_full_name   TEXT;
  v_phone       TEXT;
  v_mkt         BOOLEAN;
  v_news        BOOLEAN;
  v_imported    INT := 0;
  v_skipped     INT := 0;
  v_errors      JSONB := '[]'::JSONB;
  v_idx         INT  := 0;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: manager role required' USING ERRCODE = '42501';
  END IF;

  IF jsonb_array_length(p_rows) > 1000 THEN
    RAISE EXCEPTION 'Maximum 1 000 rows per import call';
  END IF;

  FOR v_row IN SELECT value FROM jsonb_array_elements(p_rows)
  LOOP
    v_idx       := v_idx + 1;
    v_email     := lower(trim(v_row->>'email'));
    v_full_name := NULLIF(trim(v_row->>'full_name'), '');
    v_phone     := NULLIF(trim(v_row->>'phone'),     '');
    v_mkt       := COALESCE((v_row->>'marketing_consent')::BOOLEAN, FALSE);
    v_news      := COALESCE((v_row->>'newsletter_opt_in')::BOOLEAN,  FALSE);

    IF v_email IS NULL OR v_email = '' OR NOT (v_email ~* '^[^@]+@[^@]+\.[^@]+$') THEN
      v_skipped := v_skipped + 1;
      v_errors  := v_errors || jsonb_build_array(
        jsonb_build_object('row', v_idx, 'email', v_row->>'email', 'reason', 'invalid_email')
      );
      CONTINUE;
    END IF;

    BEGIN
      INSERT INTO public.vto_email_leads (email, full_name, phone, marketing_consent, source)
      VALUES (v_email, v_full_name, v_phone, v_mkt, 'csv_import')
      ON CONFLICT (email) DO UPDATE SET
        full_name         = COALESCE(NULLIF(trim(EXCLUDED.full_name), ''), vto_email_leads.full_name),
        phone             = COALESCE(NULLIF(trim(EXCLUDED.phone), ''),     vto_email_leads.phone),
        marketing_consent = GREATEST(vto_email_leads.marketing_consent, EXCLUDED.marketing_consent);

      IF v_news THEN
        INSERT INTO public.newsletter_subscribers (email, is_active)
        VALUES (v_email, TRUE)
        ON CONFLICT (email) DO UPDATE SET is_active = TRUE;
      END IF;

      v_imported := v_imported + 1;
    EXCEPTION WHEN OTHERS THEN
      v_skipped := v_skipped + 1;
      v_errors  := v_errors || jsonb_build_array(
        jsonb_build_object('row', v_idx, 'email', v_email, 'reason', SQLERRM)
      );
    END;
  END LOOP;

  RETURN jsonb_build_object('imported', v_imported, 'skipped', v_skipped, 'errors', v_errors);
END;
$$;

COMMENT ON FUNCTION public.crm_bulk_import_contacts(JSONB) IS
  'Bulk CSV import. Upserts into vto_email_leads (and newsletter_subscribers when opted in). Returns { imported, skipped, errors }.';

GRANT EXECUTE ON FUNCTION public.crm_bulk_import_contacts(JSONB) TO authenticated;
