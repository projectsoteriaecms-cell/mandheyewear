-- =============================================================================
-- T13: Resend webhook handler
--   crm_handle_email_event() — single authoritative entry point called by the
--   resend-webhook Edge Function. Deduplicates via UNIQUE(provider_event_id),
--   updates campaign run counters, and suppresses on bounce/complaint.
--
-- T14: Live-data segment preview
--   crm_preview_campaign_recipients() — evaluates segment rules against the
--   live crm_contacts VIEW so admin UI always shows current counts, not stale
--   cached member_count values.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- T13: crm_handle_email_event
-- ---------------------------------------------------------------------------
-- Called by the resend-webhook EF with SECURITY DEFINER (service role).
-- All writes go through this single function — no direct table access from EF.
--
-- Dedup guarantee: the UNIQUE(provider_event_id) constraint on crm_email_events
-- makes the INSERT ... ON CONFLICT DO NOTHING idempotent for duplicate webhook
-- deliveries (Resend delivers at-least-once via Svix).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_handle_email_event(
  p_provider_event_id  TEXT,        -- Svix svix-id header — unique per event delivery
  p_resend_email_id    TEXT,        -- Resend email_id from data.email_id — joins ledger
  p_event_type         TEXT,        -- 'sent'|'opened'|'clicked'|'bounced'|'complained'|'unsubscribed'
  p_occurred_at        TIMESTAMPTZ DEFAULT now(),
  p_link_clicked       TEXT        DEFAULT NULL,
  p_metadata           JSONB       DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ledger_email    TEXT;
  v_run_id          UUID;
  v_campaign_id     UUID;
  v_row_count       BIGINT;
  v_mapped_type     TEXT;
  v_suppress_reason TEXT;
BEGIN
  -- Map Resend event type names → our enum
  v_mapped_type := CASE p_event_type
    WHEN 'email.sent'          THEN 'sent'
    WHEN 'email.delivered'     THEN 'sent'       -- treat delivered same as sent
    WHEN 'email.opened'        THEN 'opened'
    WHEN 'email.clicked'       THEN 'clicked'
    WHEN 'email.bounced'       THEN 'bounced'
    WHEN 'email.complained'    THEN 'complained'
    WHEN 'email.unsubscribed'  THEN 'unsubscribed'
    -- Also accept already-mapped values
    WHEN 'sent'        THEN 'sent'
    WHEN 'opened'      THEN 'opened'
    WHEN 'clicked'     THEN 'clicked'
    WHEN 'bounced'     THEN 'bounced'
    WHEN 'complained'  THEN 'complained'
    WHEN 'unsubscribed' THEN 'unsubscribed'
    ELSE NULL
  END;

  IF v_mapped_type IS NULL THEN
    RETURN jsonb_build_object('inserted', false, 'reason', format('unknown_event_type: %s', p_event_type));
  END IF;

  -- Look up which campaign + contact this Resend email_id belongs to
  SELECT l.contact_email, l.campaign_run_id
  INTO   v_ledger_email, v_run_id
  FROM   public.crm_campaign_sent_ledger l
  WHERE  l.resend_message_id = p_resend_email_id
  LIMIT  1;

  IF v_run_id IS NOT NULL THEN
    SELECT r.campaign_id INTO v_campaign_id
    FROM   public.crm_campaign_runs r
    WHERE  r.id = v_run_id;
  END IF;

  -- ── Idempotent insert (T13 dedup) ─────────────────────────────────────────
  INSERT INTO public.crm_email_events (
    contact_email,
    campaign_id,
    campaign_run_id,
    event_type,
    provider_event_id,
    occurred_at,
    link_clicked,
    metadata
  )
  VALUES (
    v_ledger_email,
    v_campaign_id,
    v_run_id,
    v_mapped_type,
    p_provider_event_id,
    p_occurred_at,
    p_link_clicked,
    p_metadata
  )
  ON CONFLICT (provider_event_id) DO NOTHING;

  GET DIAGNOSTICS v_row_count = ROW_COUNT;
  -- v_row_count = 0 means we already processed this event → return early
  IF v_row_count = 0 THEN
    RETURN jsonb_build_object('inserted', false, 'reason', 'duplicate_event');
  END IF;

  -- ── Update campaign run counters ──────────────────────────────────────────
  IF v_run_id IS NOT NULL THEN
    UPDATE public.crm_campaign_runs SET
      bounced_count = bounced_count + (CASE WHEN v_mapped_type = 'bounced'   THEN 1 ELSE 0 END),
      opened_count  = opened_count  + (CASE WHEN v_mapped_type = 'opened'    THEN 1 ELSE 0 END),
      clicked_count = clicked_count + (CASE WHEN v_mapped_type = 'clicked'   THEN 1 ELSE 0 END)
    WHERE id = v_run_id;
  END IF;

  -- ── Auto-suppress on hard bounce, complaint, or unsubscribe ──────────────
  v_suppress_reason := CASE v_mapped_type
    WHEN 'bounced'      THEN 'bounce'
    WHEN 'complained'   THEN 'complaint'
    WHEN 'unsubscribed' THEN 'unsubscribe'
    ELSE NULL
  END;

  IF v_suppress_reason IS NOT NULL AND v_ledger_email IS NOT NULL THEN
    INSERT INTO public.suppressed_emails (email, reason, metadata)
    VALUES (
      lower(trim(v_ledger_email)),
      v_suppress_reason,
      jsonb_build_object(
        'campaign_id',         v_campaign_id,
        'campaign_run_id',     v_run_id,
        'provider_event_id',   p_provider_event_id,
        'source',              'crm_campaign'
      )
    )
    ON CONFLICT (email) DO NOTHING;  -- already suppressed — append-only, no overwrite
  END IF;

  RETURN jsonb_build_object(
    'inserted',         true,
    'event_type',       v_mapped_type,
    'campaign_id',      v_campaign_id,
    'campaign_run_id',  v_run_id,
    'contact_email',    v_ledger_email
  );
END;
$$;

COMMENT ON FUNCTION public.crm_handle_email_event IS
  'T13: Idempotent webhook handler. UNIQUE(provider_event_id) deduplicates at-least-once Svix delivery. Suppresses contacts on bounce/complaint/unsubscribe.';

-- ---------------------------------------------------------------------------
-- T14: crm_preview_campaign_recipients
-- ---------------------------------------------------------------------------
-- Evaluates segment rules against LIVE crm_contacts data — not the stale
-- member_count cache. Admin UI calls this before launching a campaign so
-- the displayed recipient count is always current.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_preview_campaign_recipients(
  p_campaign_id UUID,
  p_sample_limit INT DEFAULT 10
)
RETURNS TABLE(
  total_count   BIGINT,
  sample_emails TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_segment_id UUID;
  v_rules      JSONB;
  v_total      BIGINT;
  v_samples    TEXT[];
BEGIN
  -- Role check: staff can preview, manager/super_admin can send
  IF NOT (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
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
$$;

COMMENT ON FUNCTION public.crm_preview_campaign_recipients IS
  'T14: Live segment evaluation for admin preview. Always evaluates against current crm_contacts data — not the stale member_count cache. Used to show "This campaign will reach N contacts" before sending.';

-- Grants
GRANT EXECUTE ON FUNCTION public.crm_handle_email_event(TEXT,TEXT,TEXT,TIMESTAMPTZ,TEXT,JSONB)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.crm_preview_campaign_recipients(UUID, INT)
  TO authenticated;

-- RLS: allow staff to read crm_email_events
DROP POLICY IF EXISTS "crm_email_events_staff_read"    ON public.crm_email_events;
DROP POLICY IF EXISTS "crm_email_events_service_write" ON public.crm_email_events;

CREATE POLICY "crm_email_events_staff_read"
  ON public.crm_email_events FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_email_events_service_write"
  ON public.crm_email_events FOR INSERT TO service_role
  WITH CHECK (true);
