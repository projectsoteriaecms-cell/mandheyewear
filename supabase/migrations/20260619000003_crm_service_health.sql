-- Circuit breaker state for external services (Resend, Twilio, etc.)
-- Only the service role accesses this from Edge Functions; no public-facing RLS needed.
CREATE TABLE IF NOT EXISTS public.crm_service_health (
  service_name     TEXT        PRIMARY KEY,
  failure_count    INT         NOT NULL DEFAULT 0,
  last_failure_at  TIMESTAMPTZ,
  tripped_at       TIMESTAMPTZ,
  state            TEXT        NOT NULL DEFAULT 'closed'
                               CHECK (state IN ('closed', 'open', 'half_open')),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.crm_service_health ENABLE ROW LEVEL SECURITY;

-- Seed the Resend row so reads never 404 on first check
INSERT INTO public.crm_service_health (service_name) VALUES ('resend')
ON CONFLICT (service_name) DO NOTHING;
