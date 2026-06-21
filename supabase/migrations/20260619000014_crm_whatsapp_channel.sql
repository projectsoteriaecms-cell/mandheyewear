-- =============================================================================
-- T20: Twilio WhatsApp — optional per-campaign parallel channel
--
-- A campaign may opt into WhatsApp (whatsapp_enabled = true). When it does, the
-- send-campaign-whatsapp Edge Function delivers the campaign's whatsapp_body to
-- every segment member that has a phone number — in PARALLEL with email, not as
-- a bounce fallback. It is fully decoupled from the email send state machine:
--   * its own ledger keyed by (campaign_id, contact_phone) is the double-send guard
--   * its own counters live on crm_campaigns (whatsapp_sent_count / failed_count)
--   * it never touches crm_campaigns.status, so email + WhatsApp can run together
--
-- "Optional" = the EF no-ops gracefully when Twilio env vars are not configured,
-- so the channel can ship dark and be switched on per-campaign later.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Campaign opt-in + config + counters
-- ---------------------------------------------------------------------------
ALTER TABLE public.crm_campaigns
  ADD COLUMN IF NOT EXISTS whatsapp_enabled       BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_body          TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_content_sid   TEXT,   -- optional Twilio approved-template Content SID
  ADD COLUMN IF NOT EXISTS whatsapp_heartbeat_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_completed_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS whatsapp_sent_count    INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS whatsapp_failed_count  INT NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 2. WhatsApp send ledger — per-recipient, idempotent
-- ---------------------------------------------------------------------------
-- UNIQUE(campaign_id, contact_phone) is the double-send guard. Resume reads
-- segment members NOT IN ledger, so a crashed/re-invoked EF never re-sends.
CREATE TABLE IF NOT EXISTS public.crm_campaign_whatsapp_ledger (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id        UUID NOT NULL REFERENCES public.crm_campaigns(id) ON DELETE CASCADE,
  contact_phone      TEXT NOT NULL,            -- normalized E.164 (no whatsapp: prefix)
  twilio_message_sid TEXT,                     -- NULL when status='failed'
  status             TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'failed')),
  error_message      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT crm_wa_ledger_unique UNIQUE (campaign_id, contact_phone)
);

CREATE INDEX IF NOT EXISTS crm_wa_ledger_campaign_idx
  ON public.crm_campaign_whatsapp_ledger (campaign_id);

COMMENT ON TABLE public.crm_campaign_whatsapp_ledger IS
  'T20 per-recipient WhatsApp send record. UNIQUE(campaign_id, contact_phone) is the double-send guard; failed rows are retried on next run only after manual clear.';

ALTER TABLE public.crm_campaign_whatsapp_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_wa_ledger_staff_read"    ON public.crm_campaign_whatsapp_ledger;
DROP POLICY IF EXISTS "crm_wa_ledger_manager_write" ON public.crm_campaign_whatsapp_ledger;

CREATE POLICY "crm_wa_ledger_staff_read"
  ON public.crm_campaign_whatsapp_ledger FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_wa_ledger_manager_write"
  ON public.crm_campaign_whatsapp_ledger FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- ---------------------------------------------------------------------------
-- 3. crm_whatsapp_campaign_config — EF reads this to decide whether to run
-- ---------------------------------------------------------------------------
-- Returns the campaign's WhatsApp config + segment rules in one round-trip.
-- whatsapp_enabled=false → EF no-ops. Manager-gated.
CREATE OR REPLACE FUNCTION public.crm_whatsapp_campaign_config(
  p_campaign_id UUID
)
RETURNS TABLE(
  campaign_id      UUID,
  campaign_name    TEXT,
  whatsapp_enabled BOOLEAN,
  whatsapp_body    TEXT,
  content_sid      TEXT,
  rules_json       JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_campaign public.crm_campaigns%ROWTYPE;
  v_rules    JSONB;
BEGIN
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Permission denied: WhatsApp send requires manager role'
      USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_campaign FROM public.crm_campaigns WHERE id = p_campaign_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT s.rules_json INTO v_rules
  FROM public.crm_segments s
  WHERE s.id = v_campaign.segment_id;

  campaign_id      := v_campaign.id;
  campaign_name    := v_campaign.name;
  whatsapp_enabled := v_campaign.whatsapp_enabled;
  whatsapp_body    := v_campaign.whatsapp_body;
  content_sid      := v_campaign.whatsapp_content_sid;
  rules_json       := COALESCE(v_rules, '{"type":"group","operator":"AND","conditions":[]}'::jsonb);
  RETURN NEXT;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. crm_get_unsent_whatsapp_batch — next N phone-having members not yet sent
-- ---------------------------------------------------------------------------
-- Mirrors crm_get_unsent_batch but keyed on phone + the WhatsApp ledger.
-- Filters out NULL/blank phones and suppressed contacts handled upstream by
-- crm_eval_segment_rules (it already reads NOT is_suppressed contacts).
CREATE OR REPLACE FUNCTION public.crm_get_unsent_whatsapp_batch(
  p_campaign_id UUID,
  p_rules_json  JSONB,
  p_batch_size  INT DEFAULT 50
)
RETURNS TABLE(phone TEXT, full_name TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.phone, r.full_name
  FROM   public.crm_eval_segment_rules(p_rules_json) AS r
  WHERE  r.phone IS NOT NULL
  AND    btrim(r.phone) <> ''
  AND    r.phone NOT IN (
    SELECT contact_phone
    FROM   public.crm_campaign_whatsapp_ledger
    WHERE  campaign_id = p_campaign_id
  )
  LIMIT  p_batch_size;
$$;

COMMENT ON FUNCTION public.crm_get_unsent_whatsapp_batch(UUID, JSONB, INT) IS
  'T20 resumable WhatsApp batch load. Segment members with a phone, minus the WhatsApp ledger — safe across crash/resume.';

-- ---------------------------------------------------------------------------
-- 5. crm_count_whatsapp_recipients — phone-having members (set at run start)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_count_whatsapp_recipients(
  p_rules_json JSONB
)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT count(*)
  FROM   public.crm_eval_segment_rules(p_rules_json) AS r
  WHERE  r.phone IS NOT NULL AND btrim(r.phone) <> '';
$$;

-- ---------------------------------------------------------------------------
-- 6. crm_update_whatsapp_progress — bump counters + heartbeat after each batch
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_update_whatsapp_progress(
  p_campaign_id  UUID,
  p_sent_delta   INT,
  p_failed_delta INT DEFAULT 0
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.crm_campaigns
  SET    whatsapp_sent_count   = whatsapp_sent_count   + p_sent_delta,
         whatsapp_failed_count = whatsapp_failed_count + p_failed_delta,
         whatsapp_heartbeat_at = now(),
         updated_at            = now()
  WHERE  id = p_campaign_id;
$$;

-- ---------------------------------------------------------------------------
-- 7. crm_complete_whatsapp — stamp completion timestamp
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_complete_whatsapp(
  p_campaign_id UUID
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.crm_campaigns
  SET    whatsapp_completed_at = now(),
         whatsapp_heartbeat_at = now(),
         updated_at            = now()
  WHERE  id = p_campaign_id;
$$;

-- ---------------------------------------------------------------------------
-- 8. Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.crm_whatsapp_campaign_config(UUID)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_get_unsent_whatsapp_batch(UUID, JSONB, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_count_whatsapp_recipients(JSONB)            TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_update_whatsapp_progress(UUID, INT, INT)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_complete_whatsapp(UUID)                     TO authenticated;
