-- =============================================================================
-- A/B winner selection
--
-- 1. crm_campaign_sent_ledger.ab_variant — records which subject line variant
--    ('a' or 'b') each contact received.  NULL for non-A/B campaigns.
--
-- 2. crm_campaigns.ab_winner — set when admin resolves the winner ('a' or 'b').
--
-- 3. crm_get_ab_stats(campaign_id) — read-only; returns per-variant sent counts
--    and unique opener counts, plus open rates. Used to render the A/B results
--    panel without committing a winner.
--
-- 4. crm_resolve_ab_winner(campaign_id) — same stats + writes ab_winner to the
--    campaign row.  Idempotent (can be called multiple times; overwrites winner).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Schema additions
-- ---------------------------------------------------------------------------

ALTER TABLE public.crm_campaign_sent_ledger
  ADD COLUMN IF NOT EXISTS ab_variant TEXT
    CHECK (ab_variant IN ('a', 'b'));

COMMENT ON COLUMN public.crm_campaign_sent_ledger.ab_variant IS
  'A/B subject line variant received by this contact. NULL for non-A/B campaigns.';

ALTER TABLE public.crm_campaigns
  ADD COLUMN IF NOT EXISTS ab_winner TEXT
    CHECK (ab_winner IN ('a', 'b'));

COMMENT ON COLUMN public.crm_campaigns.ab_winner IS
  'Winning A/B variant after resolution. NULL until crm_resolve_ab_winner() is called.';

-- ---------------------------------------------------------------------------
-- 2. crm_get_ab_stats — read-only stats (STABLE, no writes)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_get_ab_stats(p_campaign_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
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
$$;

COMMENT ON FUNCTION public.crm_get_ab_stats(UUID) IS
  'Read-only A/B stats. Returns per-variant sent counts and unique openers. Does not write ab_winner.';

-- ---------------------------------------------------------------------------
-- 3. crm_resolve_ab_winner — same stats + writes ab_winner
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_resolve_ab_winner(p_campaign_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ab_enabled BOOLEAN;
  v_sent_a     BIGINT := 0;
  v_sent_b     BIGINT := 0;
  v_opens_a    BIGINT := 0;
  v_opens_b    BIGINT := 0;
  v_winner     TEXT;
BEGIN
  -- Manager or above may resolve
  IF NOT (
    public.has_role(auth.uid(), 'branch_manager') OR
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
$$;

COMMENT ON FUNCTION public.crm_resolve_ab_winner(UUID) IS
  'Counts opens per A/B variant, picks higher open-rate as winner (A wins ties), writes ab_winner to crm_campaigns.';

-- ---------------------------------------------------------------------------
-- 4. Grants
-- ---------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.crm_get_ab_stats(UUID)     TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_resolve_ab_winner(UUID) TO authenticated;
