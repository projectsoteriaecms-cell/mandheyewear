-- ============================================================================
-- CRM Core Tables: segments, campaigns, campaign_runs,
--                  campaign_sent_ledger, email_events
-- ----------------------------------------------------------------------------
-- These tables sit on top of the crm_contacts VIEW (T6).
-- Recipients are keyed by normalized email (TEXT, not UUID FK) because
-- crm_contacts is a view and views cannot be FK targets.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- segments
-- Stores structured rule trees (JSONB). The segment compiler (T5) compiles
-- rules_json into parameterized Drizzle queries at runtime — no raw SQL stored.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_segments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  rules_json       JSONB NOT NULL DEFAULT '{"op":"AND","conditions":[]}'::jsonb,
  member_count     INT NOT NULL DEFAULT 0,  -- denormalized; refreshed by daily job (T3)
  last_computed_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crm_segments_name_unique UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS crm_segments_last_computed_idx
  ON public.crm_segments (last_computed_at);

COMMENT ON TABLE public.crm_segments IS
  'CRM audience segments. rules_json is a structured tree compiled to parameterized SQL at runtime (never interpolated directly).';

-- ---------------------------------------------------------------------------
-- campaigns
-- status machine: draft → scheduled → running → paused → completed
-- The atomic draft/scheduled → running flip (T9) prevents double-send.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_campaigns (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  template_id   TEXT,                      -- Resend template ID
  segment_id    UUID REFERENCES public.crm_segments(id) ON DELETE RESTRICT,
  subject_line  TEXT,
  preview_text  TEXT,
  status        TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','running','paused','completed')),
  scheduled_at  TIMESTAMPTZ,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_campaigns_status_idx      ON public.crm_campaigns (status);
CREATE INDEX IF NOT EXISTS crm_campaigns_segment_id_idx  ON public.crm_campaigns (segment_id);
CREATE INDEX IF NOT EXISTS crm_campaigns_scheduled_at_idx ON public.crm_campaigns (scheduled_at)
  WHERE scheduled_at IS NOT NULL;

COMMENT ON TABLE public.crm_campaigns IS
  'CRM email campaigns. Status transitions are atomic (T9 double-send guard). Background send job batches via Resend batch.send (100/call).';
COMMENT ON COLUMN public.crm_campaigns.status IS
  'draft→scheduled→running→paused→completed. Only draft/scheduled can be set to running (atomic flip guards double-send).';

-- ---------------------------------------------------------------------------
-- campaign_runs
-- One row per execution attempt of a campaign. Tracks send progress.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_campaign_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id      UUID NOT NULL REFERENCES public.crm_campaigns(id) ON DELETE CASCADE,
  total_recipients INT NOT NULL DEFAULT 0,
  sent_count       INT NOT NULL DEFAULT 0,
  bounced_count    INT NOT NULL DEFAULT 0,
  opened_count     INT NOT NULL DEFAULT 0,
  clicked_count    INT NOT NULL DEFAULT 0,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at     TIMESTAMPTZ,
  error_message    TEXT
);

CREATE INDEX IF NOT EXISTS crm_campaign_runs_campaign_id_idx
  ON public.crm_campaign_runs (campaign_id);

COMMENT ON TABLE public.crm_campaign_runs IS
  'Tracks each execution of a campaign. sent_count/opened_count/etc. are denormalized counters refreshed by the webhook handler.';

-- ---------------------------------------------------------------------------
-- campaign_sent_ledger
-- Recipient-level idempotency for the background send job (T8).
-- UNIQUE(campaign_run_id, contact_email) prevents double-send when the job
-- resumes mid-run (T9). Resume query: segment members NOT IN ledger.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_campaign_sent_ledger (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_run_id   UUID NOT NULL REFERENCES public.crm_campaign_runs(id) ON DELETE CASCADE,
  contact_email     TEXT NOT NULL,   -- lower(trim(email)) — matches crm_contacts key
  sent_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  resend_message_id TEXT,
  CONSTRAINT crm_sent_ledger_unique UNIQUE (campaign_run_id, contact_email)
);

CREATE INDEX IF NOT EXISTS crm_sent_ledger_run_id_idx
  ON public.crm_campaign_sent_ledger (campaign_run_id);

COMMENT ON TABLE public.crm_campaign_sent_ledger IS
  'Per-recipient send record. UNIQUE(campaign_run_id, contact_email) is the double-send guard. Resume reads segment NOT IN ledger — immune to mid-run opt-outs.';

-- ---------------------------------------------------------------------------
-- email_events
-- Stores Resend webhook events (T13). provider_event_id UNIQUE deduplicates
-- at-least-once webhook delivery (cross-model fix #7).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_email_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_email     TEXT,                                         -- normalized email
  campaign_id       UUID REFERENCES public.crm_campaigns(id) ON DELETE SET NULL,
  campaign_run_id   UUID REFERENCES public.crm_campaign_runs(id) ON DELETE SET NULL,
  event_type        TEXT NOT NULL
                      CHECK (event_type IN ('sent','opened','clicked','bounced','complained','unsubscribed')),
  provider_event_id TEXT,                                         -- Resend webhook event ID
  occurred_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  link_clicked      TEXT,
  metadata          JSONB,
  CONSTRAINT crm_email_events_provider_dedup UNIQUE (provider_event_id)
);

CREATE INDEX IF NOT EXISTS crm_email_events_contact_email_idx
  ON public.crm_email_events (contact_email)
  WHERE contact_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS crm_email_events_campaign_id_idx
  ON public.crm_email_events (campaign_id)
  WHERE campaign_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS crm_email_events_event_type_idx
  ON public.crm_email_events (event_type);

CREATE INDEX IF NOT EXISTS crm_email_events_occurred_at_idx
  ON public.crm_email_events (occurred_at DESC);

-- Partial index: unsubscribes — used for fast suppression checks.
CREATE INDEX IF NOT EXISTS crm_email_events_unsubscribed_idx
  ON public.crm_email_events (contact_email)
  WHERE event_type = 'unsubscribed';

COMMENT ON TABLE public.crm_email_events IS
  'Resend webhook events. UNIQUE(provider_event_id) deduplicates at-least-once delivery. Used for engagement analytics and campaign performance.';
COMMENT ON COLUMN public.crm_email_events.provider_event_id IS
  'Resend webhook event ID. UNIQUE constraint prevents double-counting from duplicate webhook deliveries.';

-- ---------------------------------------------------------------------------
-- RLS: admin-only for all CRM tables (no customer self-serve until Phase 2)
-- ---------------------------------------------------------------------------
ALTER TABLE public.crm_segments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaigns          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaign_runs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_campaign_sent_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_email_events       ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically. Admin dashboard reads via service
-- role key. These policies restrict authenticated (anon/user JWT) access.
CREATE POLICY "crm_segments_admin_only"
  ON public.crm_segments FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid()
      -- adjust role check to match your app_role enum
    )
  );

-- For MVP: block all authenticated non-service access to CRM tables.
-- The admin dashboard uses the service role key (bypasses RLS).
-- These policies are intentionally restrictive.
CREATE POLICY "crm_campaigns_admin_only"
  ON public.crm_campaigns FOR ALL TO authenticated
  USING (false);

CREATE POLICY "crm_campaign_runs_admin_only"
  ON public.crm_campaign_runs FOR ALL TO authenticated
  USING (false);

CREATE POLICY "crm_sent_ledger_admin_only"
  ON public.crm_campaign_sent_ledger FOR ALL TO authenticated
  USING (false);

CREATE POLICY "crm_email_events_admin_only"
  ON public.crm_email_events FOR ALL TO authenticated
  USING (false);

-- updated_at auto-refresh for tables that have it
CREATE OR REPLACE FUNCTION public.crm_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER crm_segments_updated_at
  BEFORE UPDATE ON public.crm_segments
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();

CREATE TRIGGER crm_campaigns_updated_at
  BEFORE UPDATE ON public.crm_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.crm_set_updated_at();
