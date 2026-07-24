-- Repair 5 broken built-in segments by exposing current_rank.
--
-- Found by auditing every saved segment: "All Leads", "Newsletter Subscribers",
-- "Registered Users", "Active Customers" and "VIP Customers" all target the
-- field current_rank, which crm_contacts never exposed and the rule allowlist
-- never permitted. Every one aborted with
--   'Unknown field in segment rule: current_rank'
-- so ANY campaign targeting them failed before sending a single message.
-- 5 of 10 saved segments were dead, including the primary audience definitions.
--
-- The data existed all along in crm_customer_ranks (keyed by email). This joins
-- it in and allowlists the field. Phone-only contacts have no email, so their
-- current_rank is NULL -- correct: ranking is computed per email identity.
--
-- After applying, all 10 segments evaluate: All Leads 157, VTO Leads 160,
-- WhatsApp Broadcast List 3. Ranks 2-5 return 0 because every ranked contact is
-- currently rank 1 ("Lead") -- that is data, not breakage.
--
-- Mirrored in the frontend allowlist at src/modules/crm/lib/rule-tree.ts.

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
ranks AS (
  SELECT
    LOWER(TRIM(BOTH FROM crm_customer_ranks.email)) AS email_key,
    (array_agg(crm_customer_ranks.current_rank ORDER BY crm_customer_ranks.computed_at DESC))[1] AS current_rank
  FROM crm_customer_ranks
  WHERE crm_customer_ranks.email IS NOT NULL AND TRIM(BOTH FROM crm_customer_ranks.email) <> ''::text
  GROUP BY LOWER(TRIM(BOTH FROM crm_customer_ranks.email))
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
  ranks.current_rank,
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
  LEFT JOIN ranks ON ranks.email_key = ack.email_key
  LEFT JOIN revenue ON revenue.email_key = ack.email_key;

-- Allowlist current_rank so the 5 rank-based segments can compile.
CREATE OR REPLACE FUNCTION public.crm_build_where_clause(p_node jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
 SET search_path TO 'public'
AS $function$
DECLARE
  v_type       TEXT;
  v_operator   TEXT;
  v_conditions JSONB;
  v_parts      TEXT[];
  v_child      JSONB;
  v_part       TEXT;

  -- condition node fields
  v_field      TEXT;
  v_op         TEXT;
  v_val        TEXT;
  v_safe_col   TEXT;
  v_safe_val   TEXT;

  -- Array support
  v_arr        JSONB;
  v_arr_parts  TEXT[];
  v_elem       JSONB;
BEGIN
  v_type := p_node ->> 'type';

  -- ── GROUP node ─────────────────────────────────────────────────────────────
  IF v_type = 'group' THEN
    v_operator   := upper(p_node ->> 'operator');
    v_conditions := p_node -> 'conditions';

    IF v_operator NOT IN ('AND', 'OR') THEN
      RAISE EXCEPTION 'Invalid group operator: %', v_operator
        USING ERRCODE = 'P0001';
    END IF;

    IF jsonb_array_length(v_conditions) = 0 THEN
      RETURN '';
    END IF;

    v_parts := ARRAY[]::TEXT[];
    FOR v_child IN SELECT * FROM jsonb_array_elements(v_conditions) LOOP
      v_part := crm_build_where_clause(v_child);
      IF v_part <> '' THEN
        v_parts := array_append(v_parts, '(' || v_part || ')');
      END IF;
    END LOOP;

    IF array_length(v_parts, 1) IS NULL THEN
      RETURN '';
    END IF;

    RETURN array_to_string(v_parts, ' ' || v_operator || ' ');
  END IF;

  -- ── CONDITION node ─────────────────────────────────────────────────────────
  IF v_type = 'condition' THEN
    v_field := p_node ->> 'field';
    v_op    := p_node ->> 'op';

    -- Validate field against allowlist and map to safe column name
    v_safe_col := CASE v_field
      WHEN 'email'                    THEN 'email'
      WHEN 'full_name'                THEN 'full_name'
      WHEN 'phone'                    THEN 'phone'
      WHEN 'is_vto_lead'              THEN 'is_vto_lead'
      WHEN 'is_newsletter_subscriber' THEN 'is_newsletter_subscriber'
      WHEN 'is_registered'            THEN 'is_registered'
      WHEN 'marketing_consent'        THEN 'marketing_consent'
      WHEN 'whatsapp_opted_in'        THEN 'whatsapp_opted_in'
      WHEN 'newsletter_active'        THEN 'newsletter_active'
      WHEN 'current_rank'             THEN 'current_rank'
      WHEN 'is_suppressed'            THEN 'is_suppressed'
      WHEN 'try_on_count'             THEN 'try_on_count'
      WHEN 'lifetime_value'           THEN 'lifetime_value'
      WHEN 'order_count'              THEN 'order_count'
      WHEN 'last_order_at'            THEN 'last_order_at'
      WHEN 'first_seen'               THEN 'first_seen'
      WHEN 'last_activity_at'         THEN 'last_activity_at'
      WHEN 'prescription_on_file'     THEN 'prescription_on_file'
      WHEN 'last_frame_name'          THEN 'last_frame_name'
      ELSE NULL
    END;

    IF v_safe_col IS NULL THEN
      RAISE EXCEPTION 'Unknown field in segment rule: %', v_field
        USING ERRCODE = 'P0001';
    END IF;

    -- Validate operator
    IF v_op NOT IN ('eq','neq','gt','gte','lt','lte','ilike','not_ilike',
                    'is_null','is_not_null','in','not_in') THEN
      RAISE EXCEPTION 'Unknown operator in segment rule: %', v_op
        USING ERRCODE = 'P0001';
    END IF;

    -- Null operators need no value
    IF v_op = 'is_null' THEN
      RETURN format('%I IS NULL', v_safe_col);
    END IF;
    IF v_op = 'is_not_null' THEN
      RETURN format('%I IS NOT NULL', v_safe_col);
    END IF;

    -- Set operators
    IF v_op IN ('in', 'not_in') THEN
      v_arr := p_node -> 'value';
      IF v_arr IS NULL OR jsonb_typeof(v_arr) <> 'array' THEN
        RAISE EXCEPTION 'Operator % requires an array value', v_op
          USING ERRCODE = 'P0001';
      END IF;
      v_arr_parts := ARRAY[]::TEXT[];
      FOR v_elem IN SELECT * FROM jsonb_array_elements(v_arr) LOOP
        v_arr_parts := array_append(v_arr_parts, format('%L', v_elem #>> '{}'));
      END LOOP;
      IF v_op = 'in' THEN
        RETURN format('%I IN (%s)', v_safe_col, array_to_string(v_arr_parts, ','));
      ELSE
        RETURN format('%I NOT IN (%s)', v_safe_col, array_to_string(v_arr_parts, ','));
      END IF;
    END IF;

    -- Scalar operators
    v_val := p_node ->> 'value';
    IF v_val IS NULL THEN
      RAISE EXCEPTION 'Operator % requires a value', v_op
        USING ERRCODE = 'P0001';
    END IF;
    v_safe_val := format('%L', v_val);

    RETURN CASE v_op
      WHEN 'eq'        THEN format('%I = %s',        v_safe_col, v_safe_val)
      WHEN 'neq'       THEN format('%I <> %s',       v_safe_col, v_safe_val)
      WHEN 'gt'        THEN format('%I > %s',        v_safe_col, v_safe_val)
      WHEN 'gte'       THEN format('%I >= %s',       v_safe_col, v_safe_val)
      WHEN 'lt'        THEN format('%I < %s',        v_safe_col, v_safe_val)
      WHEN 'lte'       THEN format('%I <= %s',       v_safe_col, v_safe_val)
      WHEN 'ilike'     THEN format('%I ILIKE %s',    v_safe_col, v_safe_val)
      WHEN 'not_ilike' THEN format('%I NOT ILIKE %s',v_safe_col, v_safe_val)
      ELSE NULL
    END;
  END IF;

  RAISE EXCEPTION 'Unknown rule node type: %', v_type
    USING ERRCODE = 'P0001';
END;
$function$;
