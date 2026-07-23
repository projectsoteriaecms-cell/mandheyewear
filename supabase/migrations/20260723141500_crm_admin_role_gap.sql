-- The 'admin' app_role (added 2026-03-10, sits between branch_manager and
-- super_admin) was never added to any CRM-side RLS policy or SECURITY
-- DEFINER RPC -- every check here only recognizes branch_staff /
-- branch_manager / super_admin. Several CRM page-level RoleGuards already
-- allow 'admin' (e.g. WhatsAppTemplates.tsx), so an admin-role user passes
-- the page gate and then hits 42501 on every actual data call. No live user
-- currently holds plain 'admin', so this hasn't bitten yet -- fixing it now
-- before the next person is assigned that role.

-- ── RLS policies ─────────────────────────────────────────────────────────

ALTER POLICY campaign_test_queue_manager_write ON public.campaign_test_queue
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY campaign_test_queue_staff_read ON public.campaign_test_queue
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_campaign_runs_manager_write ON public.crm_campaign_runs
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_campaign_runs_staff_read ON public.crm_campaign_runs
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_sent_ledger_manager_write ON public.crm_campaign_sent_ledger
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_sent_ledger_staff_read ON public.crm_campaign_sent_ledger
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_wa_ledger_manager_write ON public.crm_campaign_whatsapp_ledger
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_wa_ledger_staff_read ON public.crm_campaign_whatsapp_ledger
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_campaigns_manager_write ON public.crm_campaigns
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_campaigns_staff_read ON public.crm_campaigns
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_daily_quota_staff_read ON public.crm_daily_send_quota
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_email_events_staff_read ON public.crm_email_events
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_email_prefs_staff_rw ON public.crm_email_preferences
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_pref_tokens_manager_write ON public.crm_preference_tokens
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_pref_tokens_staff_read ON public.crm_preference_tokens
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_triggers_manager_write ON public.crm_reengagement_triggers
  USING (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_triggers_staff_read ON public.crm_reengagement_triggers
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY admin_read_segment_eval_queue ON public.crm_segment_eval_queue
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

ALTER POLICY crm_segments_staff_read ON public.crm_segments
  USING (has_role(auth.uid(), 'branch_staff'::app_role) OR has_role(auth.uid(), 'branch_manager'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- ── SECURITY DEFINER RPCs ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.crm_contact_stats()
 RETURNS TABLE(total_contacts bigint, vto_leads bigint, subscribers bigint, registered bigint, paying_customers bigint, suppressed bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: CRM access requires staff role'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)                                          AS total_contacts,
    COUNT(*) FILTER (WHERE is_vto_lead)               AS vto_leads,
    COUNT(*) FILTER (WHERE is_newsletter_subscriber)  AS subscribers,
    COUNT(*) FILTER (WHERE is_registered)             AS registered,
    COUNT(*) FILTER (WHERE lifetime_value > 0)        AS paying_customers,
    COUNT(*) FILTER (WHERE is_suppressed)             AS suppressed
  FROM public.crm_contacts;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_ensure_preference_token(p_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email  TEXT := lower(trim(p_email));
  v_token  UUID;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.crm_preference_tokens (email)
  VALUES (v_email)
  ON CONFLICT (email) DO NOTHING;

  SELECT token INTO v_token FROM public.crm_preference_tokens WHERE email = v_email;
  RETURN v_token;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_get_ab_stats(p_campaign_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ab_enabled BOOLEAN;
  v_ab_winner  TEXT;
  v_sent_a     BIGINT := 0;
  v_sent_b     BIGINT := 0;
  v_opens_a    BIGINT := 0;
  v_opens_b    BIGINT := 0;
BEGIN
  -- Staff may view stats
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  SELECT ab_enabled, ab_winner
  INTO   v_ab_enabled, v_ab_winner
  FROM   public.crm_campaigns
  WHERE  id = p_campaign_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'campaign_not_found');
  END IF;

  IF NOT v_ab_enabled THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'ab_not_enabled');
  END IF;

  -- Count recipients per variant across all runs for this campaign
  SELECT
    COUNT(*) FILTER (WHERE l.ab_variant = 'a'),
    COUNT(*) FILTER (WHERE l.ab_variant = 'b')
  INTO v_sent_a, v_sent_b
  FROM public.crm_campaign_sent_ledger l
  JOIN public.crm_campaign_runs r ON r.id = l.campaign_run_id
  WHERE r.campaign_id = p_campaign_id
    AND l.ab_variant IS NOT NULL;

  -- Unique openers per variant (one open event per contact, not per open action)
  SELECT
    COUNT(DISTINCT l.contact_email) FILTER (WHERE l.ab_variant = 'a'),
    COUNT(DISTINCT l.contact_email) FILTER (WHERE l.ab_variant = 'b')
  INTO v_opens_a, v_opens_b
  FROM public.crm_campaign_sent_ledger l
  JOIN public.crm_campaign_runs r ON r.id = l.campaign_run_id
  JOIN public.crm_email_events   e ON
         e.contact_email    = l.contact_email
     AND e.campaign_run_id  = l.campaign_run_id
     AND e.event_type       = 'opened'
  WHERE r.campaign_id = p_campaign_id
    AND l.ab_variant  IS NOT NULL;

  RETURN jsonb_build_object(
    'ok',          true,
    'ab_winner',   v_ab_winner,
    'sent_a',      v_sent_a,
    'sent_b',      v_sent_b,
    'opens_a',     v_opens_a,
    'opens_b',     v_opens_b,
    'open_rate_a', CASE WHEN v_sent_a > 0
                     THEN round((v_opens_a::NUMERIC / v_sent_a) * 100, 1)
                     ELSE 0 END,
    'open_rate_b', CASE WHEN v_sent_b > 0
                     THEN round((v_opens_b::NUMERIC / v_sent_b) * 100, 1)
                     ELSE 0 END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_get_send_quota_status()
 RETURNS TABLE(today_date date, today_sent integer, quota_limit integer, warmup_day integer, pct_used numeric, global_kill boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_today      DATE := CURRENT_DATE;
  v_start      DATE;
  v_day_num    INT;
  v_quota      INT;
  v_sent       INT := 0;
  v_kill       BOOLEAN;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  SELECT min(date) INTO v_start FROM public.crm_daily_send_quota;
  IF v_start IS NULL THEN v_start := v_today; END IF;

  v_day_num := (v_today - v_start)::INT + 1;

  SELECT ws.daily_limit INTO v_quota
  FROM   public.crm_warm_up_schedule ws
  WHERE  v_day_num BETWEEN ws.day_from AND ws.day_to
  ORDER  BY ws.day_from DESC LIMIT 1;
  IF v_quota IS NULL THEN v_quota := 10000; END IF;

  SELECT q.sent_count INTO v_sent
  FROM   public.crm_daily_send_quota q
  WHERE  q.date = v_today;
  IF v_sent IS NULL THEN v_sent := 0; END IF;

  SELECT (h.state = 'open') INTO v_kill
  FROM   public.crm_service_health h
  WHERE  h.service_name = 'crm_bulk_send';
  IF v_kill IS NULL THEN v_kill := false; END IF;

  today_date  := v_today;
  today_sent  := v_sent;
  quota_limit := v_quota;
  warmup_day  := v_day_num;
  pct_used    := ROUND((v_sent::NUMERIC / NULLIF(v_quota, 0)) * 100, 1);
  global_kill := v_kill;
  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_preview_campaign_recipients(p_campaign_id uuid, p_sample_limit integer DEFAULT 10)
 RETURNS TABLE(total_count bigint, sample_emails text[])
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_segment_id UUID;
  v_rules      JSONB;
  v_total      BIGINT;
  v_samples    TEXT[];
BEGIN
  -- Role check: staff can preview, manager/admin/super_admin can send
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: CRM preview requires staff role'
      USING ERRCODE = '42501';
  END IF;

  -- Fetch segment rules for this campaign
  SELECT c.segment_id INTO v_segment_id
  FROM   public.crm_campaigns c
  WHERE  c.id = p_campaign_id;

  IF v_segment_id IS NOT NULL THEN
    SELECT s.rules_json INTO v_rules
    FROM   public.crm_segments s
    WHERE  s.id = v_segment_id;
  END IF;

  -- Default to "match all" if no rules
  v_rules := COALESCE(v_rules, '{"type":"group","operator":"AND","conditions":[]}'::jsonb);

  -- Count total live-matching contacts (T14: live evaluation)
  SELECT count(*) INTO v_total
  FROM   public.crm_eval_segment_rules(v_rules);

  -- Sample emails for preview display (separate call, LIMIT avoids full scan)
  SELECT array_agg(e.email) INTO v_samples
  FROM (
    SELECT email
    FROM   public.crm_eval_segment_rules(v_rules)
    LIMIT  p_sample_limit
  ) e;

  total_count   := v_total;
  sample_emails := COALESCE(v_samples, ARRAY[]::TEXT[]);
  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_rls_preflight()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
  v_uid       UUID    := auth.uid();
  v_is_staff  BOOLEAN := false;
  v_is_mgr    BOOLEAN := false;
  v_is_admin  BOOLEAN := false;
  v_is_super  BOOLEAN := false;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object(
      'ok',      false,
      'reason',  'not_authenticated',
      'message', 'You must be signed in to access CRM features.'
    );
  END IF;

  v_is_staff := public.has_role(v_uid, 'branch_staff');
  v_is_mgr   := public.has_role(v_uid, 'branch_manager');
  v_is_admin := public.has_role(v_uid, 'admin');
  v_is_super := public.has_role(v_uid, 'super_admin');

  IF NOT (v_is_staff OR v_is_mgr OR v_is_admin OR v_is_super) THEN
    RETURN jsonb_build_object(
      'ok',      false,
      'reason',  'insufficient_role',
      'message', 'CRM access requires branch staff, manager, admin, or super admin role. '
                 'Contact your administrator to have your role updated.',
      'uid',     v_uid
    );
  END IF;

  RETURN jsonb_build_object(
    'ok',     true,
    'reason', 'authorized',
    'role',   CASE
                WHEN v_is_super THEN 'super_admin'
                WHEN v_is_admin THEN 'admin'
                WHEN v_is_mgr   THEN 'branch_manager'
                ELSE                 'branch_staff'
              END,
    'uid',    v_uid
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_approve_whatsapp_template(p_template_id uuid, p_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: template approval requires manager role'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.crm_whatsapp_templates
  SET    approval_state = 'approved',
         approval_notes  = p_notes,
         approved_by     = auth.uid(),
         approved_at     = now(),
         updated_at      = now()
  WHERE  id = p_template_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_reject_whatsapp_template(p_template_id uuid, p_notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: template rejection requires manager role'
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.crm_whatsapp_templates
  SET    approval_state = 'rejected',
         approval_notes  = p_notes,
         approved_by     = auth.uid(),
         approved_at     = now(),
         updated_at      = now()
  WHERE  id = p_template_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_bulk_import_contacts(p_rows jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    public.has_role(auth.uid(), 'admin')          OR
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
$function$;

CREATE OR REPLACE FUNCTION public.crm_claim_campaign_for_send(p_campaign_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(campaign_id uuid, run_id uuid, campaign_name text, segment_id uuid, rules_json jsonb, subject_line text, template_id text, is_new_run boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_campaign public.crm_campaigns%ROWTYPE;
  v_run_id UUID; v_is_new BOOLEAN; v_rules JSONB;
BEGIN
  IF NOT (
    auth.role() = 'service_role' OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: campaign send requires manager role' USING ERRCODE = '42501';
  END IF;
  SELECT c.* INTO v_campaign FROM public.crm_campaigns c
  WHERE (p_campaign_id IS NULL OR c.id = p_campaign_id)
  AND (c.status = 'scheduled'
    OR (p_campaign_id IS NOT NULL AND c.status = 'draft')
    OR (c.status = 'running' AND (c.send_heartbeat_at IS NULL OR c.send_heartbeat_at < now() - interval '10 minutes')))
  ORDER BY c.scheduled_at ASC NULLS LAST, c.created_at ASC
  LIMIT 1 FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_campaign.status = 'running' AND v_campaign.active_run_id IS NOT NULL THEN
    v_run_id := v_campaign.active_run_id; v_is_new := false;
  ELSE
    INSERT INTO public.crm_campaign_runs (campaign_id) VALUES (v_campaign.id) RETURNING id INTO v_run_id;
    v_is_new := true;
  END IF;
  UPDATE public.crm_campaigns
  SET status = 'running', started_at = COALESCE(started_at, now()),
      send_heartbeat_at = now(), active_run_id = v_run_id, updated_at = now()
  WHERE id = v_campaign.id;
  SELECT s.rules_json INTO v_rules FROM public.crm_segments s WHERE s.id = v_campaign.segment_id;
  campaign_id := v_campaign.id; run_id := v_run_id; campaign_name := v_campaign.name;
  segment_id := v_campaign.segment_id;
  rules_json := COALESCE(v_rules, '{"type":"group","operator":"AND","conditions":[]}'::jsonb);
  subject_line := v_campaign.subject_line; template_id := v_campaign.template_id; is_new_run := v_is_new;
  RETURN NEXT;
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_fire_reengagement_trigger(p_trigger_id uuid)
 RETURNS TABLE(campaign_id uuid, contact_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_trigger       public.crm_reengagement_triggers%ROWTYPE;
  v_rules         JSONB;
  v_count         BIGINT;
  v_segment_id    UUID;
  v_new_campaign_id UUID;
  v_now_label     TEXT := to_char(now(), 'YYYY-MM-DD');
BEGIN
  -- Managers, admins, and super_admins may fire triggers
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
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
$function$;

CREATE OR REPLACE FUNCTION public.crm_resolve_ab_winner(p_campaign_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ab_enabled BOOLEAN;
  v_sent_a     BIGINT := 0;
  v_sent_b     BIGINT := 0;
  v_opens_a    BIGINT := 0;
  v_opens_b    BIGINT := 0;
  v_winner     TEXT;
BEGIN
  -- Manager, admin, or super_admin may resolve
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: manager role required' USING ERRCODE = '42501';
  END IF;

  SELECT ab_enabled
  INTO   v_ab_enabled
  FROM   public.crm_campaigns
  WHERE  id = p_campaign_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'campaign_not_found');
  END IF;

  IF NOT v_ab_enabled THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'ab_not_enabled');
  END IF;

  -- Sent counts
  SELECT
    COUNT(*) FILTER (WHERE l.ab_variant = 'a'),
    COUNT(*) FILTER (WHERE l.ab_variant = 'b')
  INTO v_sent_a, v_sent_b
  FROM public.crm_campaign_sent_ledger l
  JOIN public.crm_campaign_runs r ON r.id = l.campaign_run_id
  WHERE r.campaign_id = p_campaign_id
    AND l.ab_variant IS NOT NULL;

  -- Unique openers per variant
  SELECT
    COUNT(DISTINCT l.contact_email) FILTER (WHERE l.ab_variant = 'a'),
    COUNT(DISTINCT l.contact_email) FILTER (WHERE l.ab_variant = 'b')
  INTO v_opens_a, v_opens_b
  FROM public.crm_campaign_sent_ledger l
  JOIN public.crm_campaign_runs r ON r.id = l.campaign_run_id
  JOIN public.crm_email_events   e ON
         e.contact_email    = l.contact_email
     AND e.campaign_run_id  = l.campaign_run_id
     AND e.event_type       = 'opened'
  WHERE r.campaign_id = p_campaign_id
    AND l.ab_variant  IS NOT NULL;

  -- Higher open rate wins; variant A wins on a tie
  v_winner := CASE
    WHEN v_sent_a = 0 AND v_sent_b = 0 THEN NULL
    WHEN v_sent_a = 0 THEN 'b'
    WHEN v_sent_b = 0 THEN 'a'
    WHEN (v_opens_b::NUMERIC / v_sent_b) > (v_opens_a::NUMERIC / v_sent_a) THEN 'b'
    ELSE 'a'
  END;

  IF v_winner IS NOT NULL THEN
    UPDATE public.crm_campaigns
    SET    ab_winner = v_winner
    WHERE  id = p_campaign_id;
  END IF;

  RETURN jsonb_build_object(
    'ok',          true,
    'ab_winner',   v_winner,
    'sent_a',      v_sent_a,
    'sent_b',      v_sent_b,
    'opens_a',     v_opens_a,
    'opens_b',     v_opens_b,
    'open_rate_a', CASE WHEN v_sent_a > 0
                     THEN round((v_opens_a::NUMERIC / v_sent_a) * 100, 1)
                     ELSE 0 END,
    'open_rate_b', CASE WHEN v_sent_b > 0
                     THEN round((v_opens_b::NUMERIC / v_sent_b) * 100, 1)
                     ELSE 0 END
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.crm_rotate_preference_token(p_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_email    TEXT := lower(trim(p_email));
  v_token    UUID := gen_random_uuid();
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'admin')          OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.crm_preference_tokens (email, token, refreshed_at)
  VALUES (v_email, v_token, now())
  ON CONFLICT (email) DO UPDATE
    SET token = EXCLUDED.token,
        refreshed_at = now();

  RETURN v_token;
END;
$function$;
