-- =============================================================================
-- Automated Trigger Scheduler
--
-- 1. Adds schedule_daily flag to crm_reengagement_triggers
--    When TRUE, crm_auto_fire_triggers() picks it up each day.
--
-- 2. crm_auto_fire_triggers() — SECURITY DEFINER, no auth.uid() check.
--    Fires all active daily triggers not yet run today.
--    Returns JSONB: [{trigger_id, trigger_name, contact_count, campaign_id}]
--
-- 3. Patches crm_claim_campaign_for_send to allow service_role callers
--    so send-campaign-batch EF can be triggered from the scheduler.
--
-- 4. Updates crm_list_triggers() to expose schedule_daily.
--
-- 5. Schedules a daily pg_cron job at 08:00 UTC (09:00 WAT).
--    Prerequisites (run once, NOT in this migration):
--      a) Enable pg_cron + pg_net in Supabase Dashboard → Database → Extensions
--      b) Deploy fire-scheduled-triggers Edge Function
--      c) supabase secrets set CRON_SECRET=<random-string>
--      d) In Supabase SQL editor:
--         ALTER DATABASE postgres SET "app.cron_secret" = '<same-random-string>';
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. schedule_daily column
-- ---------------------------------------------------------------------------

ALTER TABLE public.crm_reengagement_triggers
  ADD COLUMN IF NOT EXISTS schedule_daily BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.crm_reengagement_triggers.schedule_daily IS
  'When TRUE this trigger fires automatically each day via the scheduler EF.';

-- ---------------------------------------------------------------------------
-- 2. crm_auto_fire_triggers() — scheduler-safe, no auth.uid() check
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crm_auto_fire_triggers()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trigger     public.crm_reengagement_triggers%ROWTYPE;
  v_rules       JSONB;
  v_count       BIGINT;
  v_segment_id  UUID;
  v_campaign_id UUID;
  v_now_label   TEXT  := to_char(now(), 'YYYY-MM-DD');
  v_results     JSONB := '[]'::JSONB;
BEGIN
  FOR v_trigger IN
    SELECT *
    FROM   public.crm_reengagement_triggers
    WHERE  is_active      = TRUE
    AND    schedule_daily = TRUE
    AND    (last_run_at IS NULL OR last_run_at::DATE < CURRENT_DATE)
    ORDER  BY created_at ASC
  LOOP
    -- Build rules snapshot for today's date
    v_rules := public.crm_build_trigger_rules(
      v_trigger.trigger_type,
      v_trigger.threshold_days
    );

    -- Count matching contacts
    SELECT COUNT(*) INTO v_count
    FROM   public.crm_eval_segment_rules(v_rules);

    -- Record the run regardless of match count
    UPDATE public.crm_reengagement_triggers
    SET    last_run_at        = now(),
           last_contact_count = v_count,
           updated_at         = now()
    WHERE  id = v_trigger.id;

    v_campaign_id := NULL;

    IF v_count > 0 THEN
      -- Static snapshot segment
      INSERT INTO public.crm_segments
        (name, description, rules_json, is_dynamic, member_count)
      VALUES (
        format('[Auto] %s — %s', v_trigger.name, v_now_label),
        format('Auto-scheduled daily trigger: "%s" (%s-day rule, %s)',
               v_trigger.name, v_trigger.threshold_days, v_now_label),
        v_rules,
        false,
        v_count
      )
      RETURNING id INTO v_segment_id;

      -- Scheduled campaign (send-campaign-batch picks it up)
      INSERT INTO public.crm_campaigns
        (name, segment_id, status, subject_line)
      VALUES (
        format('[Auto] %s — %s', v_trigger.name, v_now_label),
        v_segment_id,
        'scheduled',
        COALESCE(
          v_trigger.template_subject,
          format('A message from Soteria Eye Clinic — %s', v_now_label)
        )
      )
      RETURNING id INTO v_campaign_id;

      -- Back-link
      UPDATE public.crm_reengagement_triggers
      SET    last_campaign_id = v_campaign_id,
             updated_at       = now()
      WHERE  id = v_trigger.id;
    END IF;

    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'trigger_id',    v_trigger.id,
      'trigger_name',  v_trigger.name,
      'contact_count', v_count,
      'campaign_id',   v_campaign_id
    ));
  END LOOP;

  RETURN v_results;
END;
$$;

COMMENT ON FUNCTION public.crm_auto_fire_triggers() IS
  'Scheduler-safe bulk trigger runner. No auth.uid() check. Call via service_role only.';

GRANT EXECUTE ON FUNCTION public.crm_auto_fire_triggers() TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Patch crm_claim_campaign_for_send to allow service_role callers
--    Only change: added `auth.role() = 'service_role' OR` to the guard.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crm_claim_campaign_for_send(
  p_campaign_id UUID DEFAULT NULL
)
RETURNS TABLE(
  campaign_id    UUID,
  run_id         UUID,
  campaign_name  TEXT,
  segment_id     UUID,
  rules_json     JSONB,
  subject_line   TEXT,
  template_id    TEXT,
  is_new_run     BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_campaign  public.crm_campaigns%ROWTYPE;
  v_run_id    UUID;
  v_is_new    BOOLEAN;
  v_rules     JSONB;
BEGIN
  -- Allow service_role (scheduler / automated) or human managers
  IF NOT (
    auth.role() = 'service_role'                          OR
    public.has_role(auth.uid(), 'branch_manager')         OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: campaign send requires manager role'
      USING ERRCODE = '42501';
  END IF;

  -- Atomically lock the next claimable campaign row
  SELECT c.* INTO v_campaign
  FROM public.crm_campaigns c
  WHERE (
    p_campaign_id IS NULL OR c.id = p_campaign_id
  )
  AND (
    c.status = 'scheduled'
    OR (p_campaign_id IS NOT NULL AND c.status = 'draft')
    OR (
      c.status = 'running'
      AND (c.send_heartbeat_at IS NULL OR c.send_heartbeat_at < now() - interval '10 minutes')
    )
  )
  ORDER BY c.scheduled_at ASC NULLS LAST, c.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Recover or create campaign run
  IF v_campaign.status = 'running'
     AND v_campaign.active_run_id IS NOT NULL THEN
    v_run_id := v_campaign.active_run_id;
    v_is_new := false;
  ELSE
    INSERT INTO public.crm_campaign_runs (campaign_id)
    VALUES (v_campaign.id)
    RETURNING id INTO v_run_id;
    v_is_new := true;
  END IF;

  -- Flip status → running
  UPDATE public.crm_campaigns
  SET    status            = 'running',
         started_at        = COALESCE(started_at, now()),
         send_heartbeat_at = now(),
         active_run_id     = v_run_id,
         updated_at        = now()
  WHERE  id = v_campaign.id;

  -- Fetch segment rules
  SELECT s.rules_json INTO v_rules
  FROM   public.crm_segments s
  WHERE  s.id = v_campaign.segment_id;

  campaign_id   := v_campaign.id;
  run_id        := v_run_id;
  campaign_name := v_campaign.name;
  segment_id    := v_campaign.segment_id;
  rules_json    := COALESCE(v_rules, '{"type":"group","operator":"AND","conditions":[]}'::jsonb);
  subject_line  := v_campaign.subject_line;
  template_id   := v_campaign.template_id;
  is_new_run    := v_is_new;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.crm_claim_campaign_for_send(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Update crm_list_triggers() to expose schedule_daily
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.crm_list_triggers()
RETURNS TABLE(
  id                   UUID,
  name                 TEXT,
  description          TEXT,
  trigger_type         TEXT,
  threshold_days       INT,
  template_subject     TEXT,
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
    t.template_subject, t.is_active, t.schedule_daily,
    t.last_run_at, t.last_contact_count, t.last_campaign_id,
    c.name   AS last_campaign_name,
    c.status AS last_campaign_status,
    t.created_at
  FROM   public.crm_reengagement_triggers t
  LEFT   JOIN public.crm_campaigns c ON c.id = t.last_campaign_id
  ORDER  BY t.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.crm_list_triggers() TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. pg_cron daily schedule at 08:00 UTC
--    Calls fire-scheduled-triggers EF via pg_net HTTP.
--    Uses X-Cron-Secret header (set app.cron_secret in DB settings — see above).
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
  AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN

    -- Remove stale schedule if it exists
    BEGIN
      PERFORM cron.unschedule('crm-auto-fire-triggers');
    EXCEPTION WHEN OTHERS THEN
      NULL; -- job didn't exist yet
    END;

    PERFORM cron.schedule(
      'crm-auto-fire-triggers',
      '0 8 * * *',
      $cmd$SELECT net.http_post(
          url     := 'https://znhrwzxthusqtqreawwq.supabase.co/functions/v1/fire-scheduled-triggers',
          headers := jsonb_build_object(
            'Content-Type',  'application/json',
            'X-Cron-Secret', current_setting('app.cron_secret', true)
          ),
          body    := '{}'::jsonb
        ) AS request_id$cmd$
    );

    RAISE NOTICE 'pg_cron schedule "crm-auto-fire-triggers" registered (08:00 UTC daily).';
  ELSE
    RAISE NOTICE 'pg_cron or pg_net not enabled — skipping schedule creation.';
    RAISE NOTICE 'Enable both extensions in Supabase Dashboard > Database > Extensions, then re-run this migration.';
  END IF;
END;
$$;
