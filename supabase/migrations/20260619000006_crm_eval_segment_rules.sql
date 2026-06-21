-- T5: Segment rule compiler in Postgres
-- crm_eval_segment_rules(p_rules JSONB) → TABLE(email TEXT, ...)
--
-- Security model:
--   - Column names: verified against a hardcoded allowlist (CASE expression),
--     then quoted with format('%I', col) — unknown columns raise an exception.
--   - Operators: mapped through a hardcoded CASE — unknown ops raise an exception.
--   - Values: always passed via format('%L', val) or ARRAY literals — never
--     interpolated directly into the SQL string.
--
-- This function is marked SECURITY DEFINER so it can read crm_contacts
-- (which is a VIEW with SECURITY INVOKER) through a single elevated context.
-- It checks is_suppressed=false and marketing_consent=true to respect opt-outs.

CREATE OR REPLACE FUNCTION public.crm_eval_segment_rules(
  p_rules JSONB
)
RETURNS TABLE(
  email                    TEXT,
  full_name                TEXT,
  phone                    TEXT,
  is_vto_lead              BOOLEAN,
  is_newsletter_subscriber BOOLEAN,
  is_registered            BOOLEAN,
  marketing_consent        BOOLEAN,
  newsletter_active        BOOLEAN,
  is_suppressed            BOOLEAN,
  try_on_count             INTEGER,
  lifetime_value           NUMERIC,
  order_count              INTEGER,
  last_order_at            TIMESTAMPTZ,
  first_seen               TIMESTAMPTZ,
  last_activity_at         TIMESTAMPTZ,
  prescription_on_file     BOOLEAN,
  last_frame_name          TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sql       TEXT;
  v_where     TEXT := '';
  v_node      JSONB;
  v_clauses   TEXT[];
BEGIN
  -- Only staff/manager/super_admin may call this
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: CRM segment evaluation requires staff role'
      USING ERRCODE = '42501';
  END IF;

  -- Build WHERE clauses from the rule tree
  v_where := crm_build_where_clause(p_rules);

  v_sql := 'SELECT
    email, full_name, phone,
    is_vto_lead, is_newsletter_subscriber, is_registered,
    marketing_consent, newsletter_active, is_suppressed,
    try_on_count, lifetime_value, order_count,
    last_order_at, first_seen, last_activity_at,
    prescription_on_file, last_frame_name
  FROM public.crm_contacts
  WHERE is_suppressed = false
    AND marketing_consent = true';

  IF v_where <> '' THEN
    v_sql := v_sql || ' AND (' || v_where || ')';
  END IF;

  RETURN QUERY EXECUTE v_sql;
END;
$$;

-- ── Helper: recursively builds a WHERE clause string from a rule node JSONB ──

CREATE OR REPLACE FUNCTION public.crm_build_where_clause(
  p_node JSONB
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY INVOKER
SET search_path = public
AS $$
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
$$;

-- Grant execute to authenticated role (RLS inside the function checks the role)
GRANT EXECUTE ON FUNCTION public.crm_eval_segment_rules(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_build_where_clause(JSONB)  TO authenticated;
