-- T4: Replace the blanket USING(false) CRM policies with role-based SELECT
-- policies so branch_staff/manager/super_admin can read via JWT.
-- Writes remain service-role-only (no authenticated write policy = denied).

-- ── Drop old placeholder policies ─────────────────────────────────────────────

DROP POLICY IF EXISTS "crm_segments_admin_only"           ON public.crm_segments;
DROP POLICY IF EXISTS "crm_campaigns_admin_only"          ON public.crm_campaigns;
DROP POLICY IF EXISTS "crm_campaign_runs_admin_only"      ON public.crm_campaign_runs;
DROP POLICY IF EXISTS "crm_sent_ledger_admin_only"        ON public.crm_campaign_sent_ledger;
DROP POLICY IF EXISTS "crm_email_events_admin_only"       ON public.crm_email_events;

-- ── Role-based SELECT policies ────────────────────────────────────────────────

CREATE POLICY "crm_segments_staff_read"
  ON public.crm_segments FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_campaigns_staff_read"
  ON public.crm_campaigns FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- super_admin and branch_manager can create/edit campaigns
CREATE POLICY "crm_campaigns_manager_write"
  ON public.crm_campaigns FOR ALL
  USING (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_campaign_runs_staff_read"
  ON public.crm_campaign_runs FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_sent_ledger_staff_read"
  ON public.crm_campaign_sent_ledger FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "crm_email_events_staff_read"
  ON public.crm_email_events FOR SELECT
  USING (
    public.has_role(auth.uid(), 'branch_staff') OR
    public.has_role(auth.uid(), 'branch_manager') OR
    public.has_role(auth.uid(), 'super_admin')
  );

-- ── crm_rls_preflight() ───────────────────────────────────────────────────────
-- Returns { ok, reason, message, role?, uid } so the frontend can show a
-- specific, actionable error instead of a cryptic Postgres message.
-- Runs as the calling user (SECURITY INVOKER) so the role check is real.
CREATE OR REPLACE FUNCTION public.crm_rls_preflight()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
AS $$
DECLARE
  v_uid       UUID    := auth.uid();
  v_is_staff  BOOLEAN := false;
  v_is_mgr    BOOLEAN := false;
  v_is_admin  BOOLEAN := false;
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
  v_is_admin := public.has_role(v_uid, 'super_admin');

  IF NOT (v_is_staff OR v_is_mgr OR v_is_admin) THEN
    RETURN jsonb_build_object(
      'ok',      false,
      'reason',  'insufficient_role',
      'message', 'CRM access requires branch staff, manager, or super admin role. '
                 'Contact your administrator to have your role updated.',
      'uid',     v_uid
    );
  END IF;

  RETURN jsonb_build_object(
    'ok',     true,
    'reason', 'authorized',
    'role',   CASE
                WHEN v_is_admin THEN 'super_admin'
                WHEN v_is_mgr   THEN 'branch_manager'
                ELSE                 'branch_staff'
              END,
    'uid',    v_uid
  );
END;
$$;
