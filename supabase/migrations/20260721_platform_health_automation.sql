-- Phase 4 observability: alerts + auto-remediation.
--
-- Runs on a schedule (pg_cron -> platform-health-check Edge Function, every
-- 15 min). Three things happen each run:
--   1. Alert check: error spike / stuck unverified signups / failed emails.
--      Triggered conditions get logged as platform_events (so they show up
--      in the existing observability dashboard) and are returned to the
--      Edge Function, which sends ONE summary alert email if anything fired.
--      Dedup: won't re-fire the same alert type within 60 minutes.
--   2. Backfill: auth.users rows missing a profiles or user_roles row (the
--      exact gap that caused the "invisible user" incident) get one created.
--      Purely additive -- never touches an existing row.
--   3. Retry: failed *signup* confirmation emails (auth.resend regenerates a
--      fresh OTP -- the old code would be expired, so nothing else can be
--      "retried" here) get one more attempt, capped at 3 tries and a 24h
--      window so an old, abandoned signup doesn't retry forever.

-- ---------------------------------------------------------------------------
-- 1. Bounded retry tracking on the existing email audit table
-- ---------------------------------------------------------------------------

ALTER TABLE public.email_send_log
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.email_send_log.retry_count IS
  'Auto-remediation retry attempts. Capped at 3 by platform_get_retryable_signup_emails().';

-- ---------------------------------------------------------------------------
-- 2. Alert check -- returns only the alerts newly triggered THIS run
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_check_alerts()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_error_count       bigint;
  v_stuck_signups     bigint;
  v_failed_emails     bigint;
  v_new_alerts        jsonb := '[]'::jsonb;
  v_already_alerted   boolean;
BEGIN
  -- Condition A: error spike -- 10+ error/fatal events in the last 15 min.
  SELECT count(*) INTO v_error_count
  FROM public.platform_events
  WHERE severity IN ('error', 'fatal')
    AND created_at > now() - interval '15 minutes';

  IF v_error_count >= 10 THEN
    SELECT EXISTS (
      SELECT 1 FROM public.platform_events
      WHERE event_type = 'alert.error_spike'
        AND created_at > now() - interval '60 minutes'
    ) INTO v_already_alerted;

    IF NOT v_already_alerted THEN
      INSERT INTO public.platform_events (session_id, event_type, severity, context)
      VALUES ('system', 'alert.error_spike', 'error',
              jsonb_build_object('count', v_error_count, 'window_minutes', 15));
      v_new_alerts := v_new_alerts || jsonb_build_array(jsonb_build_object(
        'type', 'error_spike', 'detail', format('%s errors in the last 15 minutes', v_error_count)
      ));
    END IF;
  END IF;

  -- Condition B: signups stuck unverified for over an hour (bounded to the
  -- last 7 days so a genuinely abandoned signup from months ago doesn't
  -- alert forever).
  SELECT count(*) INTO v_stuck_signups
  FROM auth.users
  WHERE email_confirmed_at IS NULL
    AND created_at < now() - interval '1 hour'
    AND created_at > now() - interval '7 days';

  IF v_stuck_signups > 0 THEN
    SELECT EXISTS (
      SELECT 1 FROM public.platform_events
      WHERE event_type = 'alert.stuck_signups'
        AND created_at > now() - interval '60 minutes'
    ) INTO v_already_alerted;

    IF NOT v_already_alerted THEN
      INSERT INTO public.platform_events (session_id, event_type, severity, context)
      VALUES ('system', 'alert.stuck_signups', 'warn',
              jsonb_build_object('count', v_stuck_signups));
      v_new_alerts := v_new_alerts || jsonb_build_array(jsonb_build_object(
        'type', 'stuck_signups', 'detail', format('%s signups unverified for over an hour', v_stuck_signups)
      ));
    END IF;
  END IF;

  -- Condition C: failed email sends in the last hour.
  SELECT count(*) INTO v_failed_emails
  FROM public.email_send_log
  WHERE status = 'failed'
    AND created_at > now() - interval '1 hour';

  IF v_failed_emails > 0 THEN
    SELECT EXISTS (
      SELECT 1 FROM public.platform_events
      WHERE event_type = 'alert.failed_emails'
        AND created_at > now() - interval '60 minutes'
    ) INTO v_already_alerted;

    IF NOT v_already_alerted THEN
      INSERT INTO public.platform_events (session_id, event_type, severity, context)
      VALUES ('system', 'alert.failed_emails', 'warn',
              jsonb_build_object('count', v_failed_emails));
      v_new_alerts := v_new_alerts || jsonb_build_array(jsonb_build_object(
        'type', 'failed_emails', 'detail', format('%s failed email sends in the last hour', v_failed_emails)
      ));
    END IF;
  END IF;

  RETURN v_new_alerts;
END;
$$;

COMMENT ON FUNCTION public.platform_check_alerts() IS
  'Scheduler-safe. Checks error/signup/email health, logs+returns only newly-triggered alerts (60min dedup).';

GRANT EXECUTE ON FUNCTION public.platform_check_alerts() TO service_role;

-- ---------------------------------------------------------------------------
-- 3. Backfill missing profiles/roles -- purely additive
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_backfill_missing_records()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profiles_created integer;
  v_roles_created    integer;
BEGIN
  WITH missing AS (
    SELECT u.id, u.email
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.user_id = u.id
    WHERE p.user_id IS NULL
  ),
  inserted AS (
    INSERT INTO public.profiles (user_id, email)
    SELECT id, email FROM missing
    RETURNING 1
  )
  SELECT count(*) INTO v_profiles_created FROM inserted;

  WITH missing AS (
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.user_roles r ON r.user_id = u.id
    WHERE r.user_id IS NULL
  ),
  inserted AS (
    INSERT INTO public.user_roles (user_id, role)
    SELECT id, 'customer' FROM missing
    RETURNING 1
  )
  SELECT count(*) INTO v_roles_created FROM inserted;

  RETURN jsonb_build_object(
    'profiles_created', v_profiles_created,
    'roles_created', v_roles_created
  );
END;
$$;

COMMENT ON FUNCTION public.platform_backfill_missing_records() IS
  'Scheduler-safe. Creates a default profile/role row for any auth.users missing one. Never touches existing rows.';

GRANT EXECUTE ON FUNCTION public.platform_backfill_missing_records() TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Retryable signup-confirmation emails
--    (Only 'signup' -- any other auth email type carries a one-time token
--    that a blind Resend replay would send stale/expired.)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.platform_get_retryable_signup_emails()
RETURNS TABLE(id uuid, recipient_email text)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT e.id, e.recipient_email
  FROM public.email_send_log e
  WHERE e.status = 'failed'
    AND e.template_name = 'signup'
    AND e.retry_count < 3
    AND e.created_at > now() - interval '24 hours';
$$;

COMMENT ON FUNCTION public.platform_get_retryable_signup_emails() IS
  'Scheduler-safe. Failed signup-confirmation sends eligible for auto-retry (max 3 attempts, 24h window).';

GRANT EXECUTE ON FUNCTION public.platform_get_retryable_signup_emails() TO service_role;

CREATE OR REPLACE FUNCTION public.platform_mark_email_retried(
  p_id uuid,
  p_success boolean,
  p_error text DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.email_send_log
  SET retry_count = retry_count + 1,
      status = CASE WHEN p_success THEN 'sent' ELSE status END,
      error_message = CASE WHEN p_success THEN NULL ELSE COALESCE(p_error, error_message) END
  WHERE id = p_id;
$$;

COMMENT ON FUNCTION public.platform_mark_email_retried(uuid, boolean, text) IS
  'Scheduler-safe. Records the outcome of an auto-retry attempt.';

GRANT EXECUTE ON FUNCTION public.platform_mark_email_retried(uuid, boolean, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 5. pg_cron schedule -- every 15 minutes.
--    Prerequisites (same as the existing crm-auto-fire-triggers job):
--      a) pg_cron + pg_net already enabled (this project has them)
--      b) Deploy the platform-health-check Edge Function
--      c) supabase secrets set CRON_SECRET=<same value already in use>
--      d) supabase secrets set ADMIN_ALERT_EMAIL=<address to receive alerts>
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron')
  AND EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN

    BEGIN
      PERFORM cron.unschedule('platform-health-check');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    PERFORM cron.schedule(
      'platform-health-check',
      '*/15 * * * *',
      $cmd$SELECT net.http_post(
          url     := 'https://znhrwzxthusqtqreawwq.supabase.co/functions/v1/platform-health-check',
          headers := '{"Content-Type": "application/json", "X-Cron-Secret": "CRON_SECRET_PLACEHOLDER"}'::jsonb,
          body    := '{}'::jsonb
        ) AS request_id$cmd$
    );

    RAISE NOTICE 'pg_cron schedule "platform-health-check" registered (every 15 min).';
  ELSE
    RAISE NOTICE 'pg_cron or pg_net not enabled -- skipping schedule creation.';
  END IF;
END;
$$;
