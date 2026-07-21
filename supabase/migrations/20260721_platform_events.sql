-- Platform observability: a single append-only event stream for every
-- touchpoint, for logged-in AND anonymous visitors.
--
-- Why a new table: user_activity.user_id and user_events.email are both NOT
-- NULL, so neither can record an anonymous visitor or a client-side crash —
-- which is most of what we need to see. This table keeps user_id nullable and
-- stitches a visitor's journey together with session_id instead.

CREATE TABLE IF NOT EXISTS public.platform_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- null for anonymous visitors
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- stable per browser tab session; stitches anonymous -> signed-in journeys
  session_id    text NOT NULL,
  event_type    text NOT NULL,
  severity      text NOT NULL DEFAULT 'info'
                CHECK (severity IN ('info','warn','error','fatal')),
  page          text,
  context       jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_agent    text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Query patterns: recent feed, per-session replay, error triage, funnels.
CREATE INDEX IF NOT EXISTS platform_events_created_idx  ON public.platform_events (created_at DESC);
CREATE INDEX IF NOT EXISTS platform_events_session_idx  ON public.platform_events (session_id, created_at);
CREATE INDEX IF NOT EXISTS platform_events_type_idx     ON public.platform_events (event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS platform_events_severity_idx ON public.platform_events (severity, created_at DESC)
  WHERE severity IN ('error','fatal');

ALTER TABLE public.platform_events ENABLE ROW LEVEL SECURITY;

-- Anyone (including logged-out visitors) may record an event; only staff may
-- read them. Write-only for the public keeps the stream complete without
-- leaking other people's activity.
DROP POLICY IF EXISTS anyone_insert ON public.platform_events;
CREATE POLICY anyone_insert ON public.platform_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS staff_select ON public.platform_events;
CREATE POLICY staff_select ON public.platform_events
  FOR SELECT USING (public.is_staff(auth.uid()));

GRANT INSERT ON public.platform_events TO anon, authenticated;
GRANT SELECT ON public.platform_events TO authenticated;

-- Convenience view for the admin dashboard: recent errors with a count of how
-- many distinct sessions each one hit, so a single noisy bug doesn't look like
-- a platform-wide outage.
CREATE OR REPLACE VIEW public.v_recent_errors AS
SELECT
  event_type,
  severity,
  context->>'message' AS message,
  count(*)                        AS occurrences,
  count(DISTINCT session_id)      AS sessions_affected,
  max(created_at)                 AS last_seen
FROM public.platform_events
WHERE severity IN ('error','fatal')
  AND created_at > now() - interval '7 days'
GROUP BY event_type, severity, context->>'message'
ORDER BY last_seen DESC;
