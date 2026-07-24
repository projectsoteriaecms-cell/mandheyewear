-- Make whatsapp_opted_in targetable in segment rules.
--
-- crm_build_where_clause validates every rule field against a hard allowlist
-- (that allowlist IS the SQL-injection guard -- it maps user input to a known
-- column name and never interpolates it). whatsapp_opted_in was added to
-- crm_contacts in 20260724100000 but not here, so building a "WhatsApp
-- Broadcast List" segment on it raised 'Unknown field in segment rule'.
--
-- Adding it is what makes a WhatsApp broadcast audience expressible:
--   { field: 'whatsapp_opted_in', op: 'eq', value: 'true' }
--
-- Mirrored in the frontend allowlist at src/modules/crm/lib/rule-tree.ts.
-- Verified after applying: an injection-shaped field is still rejected with
-- 'Unknown field in segment rule', and the legit field compiles to
-- "whatsapp_opted_in = 'true'".

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

-- The broadcast audience itself, and a repair for a pre-existing broken segment.
--
-- "VTO Leads" was saved with value "" for the boolean field is_vto_lead. That
-- cannot cast, so crm_eval_segment_rules aborted with 22P02 and ANY campaign
-- using that segment failed before sending. Repaired to "true" (160 members).
INSERT INTO crm_segments (name, description, rules_json, member_count, last_computed_at)
SELECT
  'WhatsApp Broadcast List',
  'Everyone holding WhatsApp-channel marketing consent (consent_channel=whatsapp). The audience for WhatsApp broadcasts — includes phone-only leads with no email address.',
  '{"type":"group","operator":"AND","conditions":[{"op":"eq","type":"condition","field":"whatsapp_opted_in","value":"true"}]}'::jsonb,
  (SELECT count(*) FROM crm_contacts WHERE whatsapp_opted_in AND NOT is_suppressed),
  now()
WHERE NOT EXISTS (SELECT 1 FROM crm_segments WHERE name = 'WhatsApp Broadcast List');

UPDATE crm_segments
SET rules_json = '{"type":"group","operator":"AND","conditions":[{"op":"eq","type":"condition","field":"is_vto_lead","value":"true"}]}'::jsonb,
    updated_at = now()
WHERE name = 'VTO Leads'
  AND rules_json -> 'conditions' -> 0 ->> 'value' = '';
