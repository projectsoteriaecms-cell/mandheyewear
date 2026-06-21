-- =============================================================================
-- T8 + T9: Campaign send infrastructure
--
-- T9 (double-send guard):
--   crm_claim_campaign_for_send() uses FOR UPDATE SKIP LOCKED so two concurrent
--   Edge Function invocations can never both start sending the same campaign.
--   The UNIQUE(campaign_run_id, contact_email) constraint in crm_campaign_sent_ledger
--   is the second line of defence (INSERT ON CONFLICT DO NOTHING in the EF).
--
-- T8 (batched, ledger-resumable):
--   crm_get_unsent_batch() returns the next N recipients not yet in the ledger
--   for a given run.  The EF loops until this returns 0 rows, then completes.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Schema additions
-- ---------------------------------------------------------------------------

-- crm_segments: is_dynamic flag (static segments are maintained manually)
ALTER TABLE public.crm_segments
  ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN NOT NULL DEFAULT true;

-- crm_campaigns: send execution columns
ALTER TABLE public.crm_campaigns
  ADD COLUMN IF NOT EXISTS send_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS active_run_id     UUID
    REFERENCES public.crm_campaign_runs(id) ON DELETE SET NULL;

-- Index for efficient stale-job recovery scan
CREATE INDEX IF NOT EXISTS crm_campaigns_send_claim_idx
  ON public.crm_campaigns (status, send_heartbeat_at)
  WHERE status IN ('scheduled', 'running');

-- ---------------------------------------------------------------------------
-- 2. T9: Atomic campaign claim  (FOR UPDATE SKIP LOCKED)
-- ---------------------------------------------------------------------------
-- Returns one row if a claimable campaign was found; empty set otherwise.
-- Claimable = status='scheduled'  OR  status='running' with heartbeat >10 min
--             old (crashed job recovery).
-- When p_campaign_id IS NOT NULL also allows status='draft' (explicit user
-- trigger from the admin UI — "Send Now").
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
  -- Only managers and super-admins may kick off sends
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
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
    OR (p_campaign_id IS NOT NULL AND c.status = 'draft')  -- "Send Now" from UI
    OR (
      c.status = 'running'
      AND (c.send_heartbeat_at IS NULL OR c.send_heartbeat_at < now() - interval '10 minutes')
    )
  )
  ORDER BY c.scheduled_at ASC NULLS LAST, c.created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF NOT FOUND THEN
    RETURN;  -- nothing to process
  END IF;

  -- Recover or create campaign run
  IF v_campaign.status = 'running'
     AND v_campaign.active_run_id IS NOT NULL THEN
    -- Recovering a stale/crashed run — resume it
    v_run_id := v_campaign.active_run_id;
    v_is_new := false;
  ELSE
    -- New run
    INSERT INTO public.crm_campaign_runs (campaign_id)
    VALUES (v_campaign.id)
    RETURNING id INTO v_run_id;
    v_is_new := true;
  END IF;

  -- Atomically flip status → running and stamp heartbeat
  UPDATE public.crm_campaigns
  SET status            = 'running',
      started_at        = COALESCE(started_at, now()),
      send_heartbeat_at = now(),
      active_run_id     = v_run_id,
      updated_at        = now()
  WHERE id = v_campaign.id;

  -- Fetch segment rules (may be NULL if segment was deleted)
  SELECT s.rules_json INTO v_rules
  FROM public.crm_segments s
  WHERE s.id = v_campaign.segment_id;

  -- Return all data the EF needs in one round-trip
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

COMMENT ON FUNCTION public.crm_claim_campaign_for_send IS
  'T9 atomic double-send guard. FOR UPDATE SKIP LOCKED ensures concurrent invocations never claim the same campaign. Returns the claimed campaign + run metadata.';

-- ---------------------------------------------------------------------------
-- 3. T8: Get next unsent batch for a running campaign
-- ---------------------------------------------------------------------------
-- All logic is DB-side: evaluate rules, subtract the sent ledger, return LIMIT N.
-- Safe: crm_eval_segment_rules validates all field names + operators.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_get_unsent_batch(
  p_run_id    UUID,
  p_rules_json JSONB,
  p_batch_size INT DEFAULT 50
)
RETURNS TABLE(email TEXT, full_name TEXT)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT r.email, r.full_name
  FROM   public.crm_eval_segment_rules(p_rules_json) AS r
  WHERE  r.email NOT IN (
    SELECT contact_email
    FROM   public.crm_campaign_sent_ledger
    WHERE  campaign_run_id = p_run_id
  )
  LIMIT  p_batch_size;
$$;

COMMENT ON FUNCTION public.crm_get_unsent_batch IS
  'T8 resumable batch load. Evaluates segment rules then subtracts the sent ledger — safe to call after a crash/resume without re-sending.';

-- ---------------------------------------------------------------------------
-- 4. Count total segment members for a campaign run (set at run start)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_count_segment_members(
  p_rules_json JSONB
)
RETURNS BIGINT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT count(*) FROM public.crm_eval_segment_rules(p_rules_json);
$$;

-- ---------------------------------------------------------------------------
-- 5. Update send progress + heartbeat (called after each batch)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_update_send_progress(
  p_campaign_id UUID,
  p_run_id      UUID,
  p_sent_delta  INT
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.crm_campaigns
  SET    send_heartbeat_at = now(),
         updated_at        = now()
  WHERE  id = p_campaign_id;

  UPDATE public.crm_campaign_runs
  SET    sent_count = sent_count + p_sent_delta
  WHERE  id = p_run_id;
$$;

-- ---------------------------------------------------------------------------
-- 6. Mark campaign + run as completed
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_complete_campaign_run(
  p_campaign_id UUID,
  p_run_id      UUID
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.crm_campaigns
  SET    status            = 'completed',
         completed_at      = now(),
         send_heartbeat_at = now(),
         updated_at        = now()
  WHERE  id = p_campaign_id;

  UPDATE public.crm_campaign_runs
  SET    completed_at = now()
  WHERE  id = p_run_id;
$$;

-- ---------------------------------------------------------------------------
-- 7. Mark campaign as paused (after circuit-breaker trip or manual stop)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_pause_campaign(
  p_campaign_id UUID,
  p_reason      TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.crm_campaigns
  SET    status     = 'paused',
         updated_at = now()
  WHERE  id = p_campaign_id
  AND    status = 'running';

  UPDATE public.crm_campaign_runs
  SET    error_message = p_reason
  WHERE  campaign_id = p_campaign_id
  AND    completed_at IS NULL;
$$;

-- ---------------------------------------------------------------------------
-- 8. Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.crm_claim_campaign_for_send(UUID)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_get_unsent_batch(UUID, JSONB, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_count_segment_members(JSONB)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_update_send_progress(UUID, UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_complete_campaign_run(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_pause_campaign(UUID, TEXT)        TO authenticated;

-- ---------------------------------------------------------------------------
-- 9. RLS: manager-write + staff-read for campaign_runs and sent_ledger
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "crm_campaign_runs_staff_read"    ON public.crm_campaign_runs;
DROP POLICY IF EXISTS "crm_campaign_runs_manager_write" ON public.crm_campaign_runs;
DROP POLICY IF EXISTS "crm_sent_ledger_staff_read"      ON public.crm_campaign_sent_ledger;
DROP POLICY IF EXISTS "crm_sent_ledger_manager_write"   ON public.crm_campaign_sent_ledger;

CREATE POLICY "crm_campaign_runs_staff_read"
  ON public.crm_campaign_runs FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_campaign_runs_manager_write"
  ON public.crm_campaign_runs FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_sent_ledger_staff_read"
  ON public.crm_campaign_sent_ledger FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_staff')   OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_sent_ledger_manager_write"
  ON public.crm_campaign_sent_ledger FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );
