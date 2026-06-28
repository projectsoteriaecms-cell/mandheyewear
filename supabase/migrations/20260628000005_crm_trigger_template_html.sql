-- =============================================================================
-- CRM Re-engagement Trigger — Email Body Template
--
-- Adds template_html column to crm_reengagement_triggers so auto-fired
-- campaigns get a real email body instead of the generic fallback.
--
-- Also updates:
--   crm_fire_reengagement_trigger  → passes body_html when creating campaign
--   crm_list_triggers              → exposes template_html to the frontend
-- =============================================================================

ALTER TABLE public.crm_reengagement_triggers
  ADD COLUMN IF NOT EXISTS template_html TEXT;

-- ---------------------------------------------------------------------------
-- crm_fire_reengagement_trigger — now passes body_html to the campaign
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
  v_trigger         public.crm_reengagement_triggers%ROWTYPE;
  v_rules           JSONB;
  v_count           BIGINT;
  v_segment_id      UUID;
  v_new_campaign_id UUID;
  v_now_label       TEXT := to_char(now(), 'YYYY-MM-DD');
BEGIN
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

  v_rules := public.crm_build_trigger_rules(v_trigger.trigger_type, v_trigger.threshold_days);

  SELECT COUNT(*) INTO v_count
  FROM   public.crm_eval_segment_rules(v_rules);

  UPDATE public.crm_reengagement_triggers
  SET    last_run_at        = now(),
         last_contact_count = v_count,
         updated_at         = now()
  WHERE  id = p_trigger_id;

  IF v_count = 0 THEN
    campaign_id   := NULL;
    contact_count := 0;
    RETURN NEXT;
    RETURN;
  END IF;

  INSERT INTO public.crm_segments
    (name, description, rules_json, is_dynamic, member_count)
  VALUES (
    format('[Trigger] %s — %s', v_trigger.name, v_now_label),
    format(
      'Auto-generated snapshot by trigger "%s" (%s-day rule, fired %s)',
      v_trigger.name, v_trigger.threshold_days, v_now_label
    ),
    v_rules,
    false,
    v_count
  )
  RETURNING id INTO v_segment_id;

  INSERT INTO public.crm_campaigns
    (name, segment_id, status, subject_line, body_html)
  VALUES (
    format('[Trigger] %s — %s', v_trigger.name, v_now_label),
    v_segment_id,
    'scheduled',
    COALESCE(
      v_trigger.template_subject,
      format('A message from Soteria Eye Clinic — %s', v_now_label)
    ),
    v_trigger.template_html  -- NULL falls back to generic body in send-campaign-batch
  )
  RETURNING id INTO v_new_campaign_id;

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
-- crm_list_triggers — now includes template_html
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_list_triggers()
RETURNS TABLE(
  id                   UUID,
  name                 TEXT,
  description          TEXT,
  trigger_type         TEXT,
  threshold_days       INT,
  template_subject     TEXT,
  template_html        TEXT,
  is_active            BOOLEAN,
  schedule_daily       BOOLEAN,
  last_run_at          TIMESTAMPTZ,
  last_contact_count   INT,
  last_campaign_id     UUID,
  last_campaign_name   TEXT,
  last_campaign_status TEXT,
  created_at           TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    t.id, t.name, t.description, t.trigger_type, t.threshold_days,
    t.template_subject, t.template_html,
    t.is_active, t.schedule_daily,
    t.last_run_at, t.last_contact_count,
    t.last_campaign_id,
    c.name   AS last_campaign_name,
    c.status AS last_campaign_status,
    t.created_at
  FROM   public.crm_reengagement_triggers t
  LEFT   JOIN public.crm_campaigns c ON c.id = t.last_campaign_id
  ORDER  BY t.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.crm_fire_reengagement_trigger(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_list_triggers()                 TO authenticated;
