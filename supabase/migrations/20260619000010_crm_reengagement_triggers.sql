-- =============================================================================
-- T17: Automated re-engagement triggers
--
-- Admins define trigger rules (type + threshold_days).  Firing a trigger:
--   1. Builds a static rules_json snapshot from the trigger type + today's date
--   2. Counts matching contacts (via crm_eval_segment_rules)
--   3. Creates a crm_segment + crm_campaign (status='scheduled')
--   4. Returns { campaign_id, contact_count }
--
-- The regular send-campaign-batch EF handles delivery — no new EF needed.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. crm_reengagement_triggers table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_reengagement_triggers (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT        NOT NULL,
  description         TEXT,

  -- What condition to check
  trigger_type        TEXT        NOT NULL,
  threshold_days      INT         NOT NULL DEFAULT 30,

  -- Email subject for auto-created campaign
  template_subject    TEXT,

  -- Control
  is_active           BOOLEAN     NOT NULL DEFAULT true,

  -- Execution history
  last_run_at         TIMESTAMPTZ,
  last_contact_count  INT         NOT NULL DEFAULT 0,
  last_campaign_id    UUID        REFERENCES public.crm_campaigns(id) ON DELETE SET NULL,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT crm_trigger_type_check CHECK (trigger_type IN (
    'inactive_days',             -- no activity for N days
    'no_purchase_days',          -- no purchase for N days
    'vto_no_convert_days',       -- did VTO, no purchase for N days
    'newsletter_no_engage_days'  -- newsletter subscriber, no activity for N days
  )),
  CONSTRAINT crm_trigger_threshold_check CHECK (threshold_days > 0 AND threshold_days <= 3650)
);

-- Seed the three most-useful re-engagement triggers for the clinic
INSERT INTO public.crm_reengagement_triggers
  (name, description, trigger_type, threshold_days, template_subject)
VALUES
  (
    'Win Back Inactive Customers',
    'Contacts with no activity in 60 days',
    'inactive_days', 60,
    'We miss you — here''s an exclusive offer for Soteria Eye Clinic'
  ),
  (
    'Convert VTO Leads',
    'Contacts who tried frames virtually but haven''t purchased after 14 days',
    'vto_no_convert_days', 14,
    'Love those frames? Get them with a special fitting discount'
  ),
  (
    'Re-engage Newsletter Subscribers',
    'Newsletter subscribers with no activity in 45 days',
    'newsletter_no_engage_days', 45,
    'What''s new at Soteria Eye Clinic — your monthly update'
  )
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.crm_reengagement_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crm_triggers_staff_read"
  ON public.crm_reengagement_triggers FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_triggers_manager_write"
  ON public.crm_reengagement_triggers FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- ---------------------------------------------------------------------------
-- 3. crm_build_trigger_rules(type, days) → JSONB
--
-- Builds a static rules_json snapshot from trigger type + today's date.
-- The cutoff date is computed at call time — subsequent calls on different
-- days produce different (but valid) rule trees.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_build_trigger_rules(
  p_type          TEXT,
  p_threshold_days INT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  v_cutoff TEXT := (CURRENT_DATE - (p_threshold_days || ' days')::INTERVAL)::DATE::TEXT;
BEGIN
  IF p_type = 'inactive_days' THEN
    -- No activity at all, OR last activity before cutoff
    RETURN jsonb_build_object(
      'type', 'group', 'operator', 'AND',
      'conditions', jsonb_build_array(
        jsonb_build_object(
          'type', 'group', 'operator', 'OR',
          'conditions', jsonb_build_array(
            jsonb_build_object('type', 'condition', 'field', 'last_activity_at', 'op', 'is_null'),
            jsonb_build_object('type', 'condition', 'field', 'last_activity_at', 'op', 'lt', 'value', v_cutoff)
          )
        )
      )
    );

  ELSIF p_type = 'no_purchase_days' THEN
    -- Never purchased OR most recent purchase before cutoff
    RETURN jsonb_build_object(
      'type', 'group', 'operator', 'OR',
      'conditions', jsonb_build_array(
        jsonb_build_object('type', 'condition', 'field', 'order_count', 'op', 'eq', 'value', '0'),
        jsonb_build_object('type', 'condition', 'field', 'last_order_at', 'op', 'lt', 'value', v_cutoff)
      )
    );

  ELSIF p_type = 'vto_no_convert_days' THEN
    -- Tried VTO, no purchase, first seen at least threshold_days ago
    RETURN jsonb_build_object(
      'type', 'group', 'operator', 'AND',
      'conditions', jsonb_build_array(
        jsonb_build_object('type', 'condition', 'field', 'is_vto_lead',   'op', 'eq', 'value', 'true'),
        jsonb_build_object('type', 'condition', 'field', 'order_count',   'op', 'eq', 'value', '0'),
        jsonb_build_object(
          'type', 'group', 'operator', 'OR',
          'conditions', jsonb_build_array(
            jsonb_build_object('type', 'condition', 'field', 'first_seen', 'op', 'is_null'),
            jsonb_build_object('type', 'condition', 'field', 'first_seen', 'op', 'lt', 'value', v_cutoff)
          )
        )
      )
    );

  ELSIF p_type = 'newsletter_no_engage_days' THEN
    -- Newsletter subscriber, no activity since threshold_days ago
    RETURN jsonb_build_object(
      'type', 'group', 'operator', 'AND',
      'conditions', jsonb_build_array(
        jsonb_build_object('type', 'condition', 'field', 'is_newsletter_subscriber', 'op', 'eq', 'value', 'true'),
        jsonb_build_object(
          'type', 'group', 'operator', 'OR',
          'conditions', jsonb_build_array(
            jsonb_build_object('type', 'condition', 'field', 'last_activity_at', 'op', 'is_null'),
            jsonb_build_object('type', 'condition', 'field', 'last_activity_at', 'op', 'lt', 'value', v_cutoff)
          )
        )
      )
    );

  ELSE
    RAISE EXCEPTION 'Unknown trigger type: %', p_type USING ERRCODE = 'P0001';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. crm_fire_reengagement_trigger(p_trigger_id) → (campaign_id, contact_count)
--
-- Evaluates matching contacts, creates a snapshot segment + scheduled campaign.
-- Returns NULL campaign_id when no contacts match (nothing to send).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_fire_reengagement_trigger(
  p_trigger_id UUID
)
RETURNS TABLE(campaign_id UUID, contact_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trigger       public.crm_reengagement_triggers%ROWTYPE;
  v_rules         JSONB;
  v_count         BIGINT;
  v_segment_id    UUID;
  v_new_campaign_id UUID;
  v_now_label     TEXT := to_char(now(), 'YYYY-MM-DD');
BEGIN
  -- Only managers may fire triggers
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: firing triggers requires branch_manager role'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_trigger
  FROM   public.crm_reengagement_triggers
  WHERE  id = p_trigger_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trigger not found: %', p_trigger_id;
  END IF;

  IF NOT v_trigger.is_active THEN
    RAISE EXCEPTION 'Trigger "%" is inactive — enable it before firing', v_trigger.name;
  END IF;

  -- Build the static rules snapshot for today
  v_rules := public.crm_build_trigger_rules(v_trigger.trigger_type, v_trigger.threshold_days);

  -- Count matching contacts (auth.uid() passes through to crm_eval_segment_rules)
  SELECT COUNT(*) INTO v_count
  FROM   public.crm_eval_segment_rules(v_rules);

  -- Record the run even if count = 0
  UPDATE public.crm_reengagement_triggers
  SET    last_run_at         = now(),
         last_contact_count  = v_count,
         updated_at          = now()
  WHERE  id = p_trigger_id;

  IF v_count = 0 THEN
    campaign_id   := NULL;
    contact_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Create a static snapshot segment
  INSERT INTO public.crm_segments
    (name, description, rules_json, is_dynamic, member_count)
  VALUES (
    format('[Trigger] %s — %s', v_trigger.name, v_now_label),
    format(
      'Auto-generated snapshot by trigger "%s" (%s-day rule, fired %s)',
      v_trigger.name, v_trigger.threshold_days, v_now_label
    ),
    v_rules,
    false,    -- static snapshot — won't be re-evaluated dynamically
    v_count
  )
  RETURNING id INTO v_segment_id;

  -- Create a scheduled campaign linked to that segment
  INSERT INTO public.crm_campaigns
    (name, segment_id, status, subject_line)
  VALUES (
    format('[Trigger] %s — %s', v_trigger.name, v_now_label),
    v_segment_id,
    'scheduled',
    COALESCE(
      v_trigger.template_subject,
      format('A message from Soteria Eye Clinic — %s', v_now_label)
    )
  )
  RETURNING id INTO v_new_campaign_id;

  -- Back-link the campaign to the trigger
  UPDATE public.crm_reengagement_triggers
  SET    last_campaign_id = v_new_campaign_id,
         updated_at       = now()
  WHERE  id = p_trigger_id;

  campaign_id   := v_new_campaign_id;
  contact_count := v_count;
  RETURN NEXT;
END;
$$;

-- ---------------------------------------------------------------------------
-- 5. crm_list_triggers() — convenience view with last-run enrichment
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_list_triggers()
RETURNS TABLE(
  id                 UUID,
  name               TEXT,
  description        TEXT,
  trigger_type       TEXT,
  threshold_days     INT,
  template_subject   TEXT,
  is_active          BOOLEAN,
  last_run_at        TIMESTAMPTZ,
  last_contact_count INT,
  last_campaign_id   UUID,
  last_campaign_name TEXT,
  last_campaign_status TEXT,
  created_at         TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.name, t.description, t.trigger_type, t.threshold_days,
    t.template_subject, t.is_active, t.last_run_at, t.last_contact_count,
    t.last_campaign_id,
    c.name   AS last_campaign_name,
    c.status AS last_campaign_status,
    t.created_at
  FROM   public.crm_reengagement_triggers t
  LEFT   JOIN public.crm_campaigns c ON c.id = t.last_campaign_id
  ORDER  BY t.created_at DESC;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION public.crm_build_trigger_rules(TEXT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_fire_reengagement_trigger(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_list_triggers()                 TO authenticated;
