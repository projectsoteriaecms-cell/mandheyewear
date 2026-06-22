-- ============================================================================
-- Customer Ranking System (Phase B)
-- ============================================================================
-- Tracks customer progression through 5 tiers based on engagement + revenue.
-- Tier system:
--   1. Lead      — Just email captured
--   2. Subscriber — Opted into newsletter
--   3. Registered — Account created
--   4. Customer  — Made ≥1 purchase (LTV > 0)
--   5. VIP       — High engagement + LTV > 50,000 NGN
--
-- Auto-computed daily. Ranks can move up (more engagement) or down (dormancy >90d).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- crm_customer_ranks
-- Stores current rank + history of rank changes for each contact.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_customer_ranks (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 TEXT NOT NULL UNIQUE,
  current_rank          INT NOT NULL DEFAULT 1 CHECK (current_rank BETWEEN 1 AND 5),
  rank_label            TEXT NOT NULL DEFAULT 'Lead',
  engagement_score      NUMERIC(8,2) NOT NULL DEFAULT 0,
  last_engagement_at    TIMESTAMP WITH TIME ZONE,
  is_dormant            BOOLEAN NOT NULL DEFAULT FALSE,
  promoted_at           TIMESTAMP WITH TIME ZONE,
  demoted_at            TIMESTAMP WITH TIME ZONE,
  reason                TEXT,
  computed_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS crm_customer_ranks_email_idx ON public.crm_customer_ranks(email);
CREATE INDEX IF NOT EXISTS crm_customer_ranks_current_rank_idx ON public.crm_customer_ranks(current_rank);
CREATE INDEX IF NOT EXISTS crm_customer_ranks_computed_at_idx ON public.crm_customer_ranks(computed_at DESC);

COMMENT ON TABLE public.crm_customer_ranks IS
  'Customer ranking system. Stores current rank (1-5) and engagement metrics. Updated daily by crm_compute_customer_ranks().';
COMMENT ON COLUMN public.crm_customer_ranks.current_rank IS
  '1=Lead, 2=Subscriber, 3=Registered, 4=Customer, 5=VIP';
COMMENT ON COLUMN public.crm_customer_ranks.engagement_score IS
  'Composite score: try_on_count + (order_count × 2) + recency_bonus. Higher = more engaged.';
COMMENT ON COLUMN public.crm_customer_ranks.is_dormant IS
  'TRUE if no activity in last 90 days. Triggers potential rank demotion.';

-- ---------------------------------------------------------------------------
-- crm_rank_history
-- Audit trail: every rank change (promotion/demotion).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_rank_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL,
  old_rank          INT,
  new_rank          INT NOT NULL,
  reason            TEXT,
  engagement_score  NUMERIC(8,2),
  lifetime_value    NUMERIC(12,2),
  try_on_count      INT,
  order_count       INT,
  changed_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT rank_history_valid_ranks CHECK (old_rank IS NULL OR old_rank BETWEEN 1 AND 5),
  CONSTRAINT rank_history_new_rank_check CHECK (new_rank BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS crm_rank_history_email_idx ON public.crm_rank_history(email);
CREATE INDEX IF NOT EXISTS crm_rank_history_changed_at_idx ON public.crm_rank_history(changed_at DESC);

COMMENT ON TABLE public.crm_rank_history IS
  'Audit trail of all rank changes. Used for analytics and understanding customer journey.';

-- ---------------------------------------------------------------------------
-- Helper: get_rank_label(rank_number)
-- Maps rank integer to display label.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_rank_label(p_rank INT)
RETURNS TEXT
IMMUTABLE
LANGUAGE sql
AS $$
  SELECT CASE p_rank
    WHEN 1 THEN 'Lead'
    WHEN 2 THEN 'Subscriber'
    WHEN 3 THEN 'Registered'
    WHEN 4 THEN 'Customer'
    WHEN 5 THEN 'VIP'
    ELSE 'Unknown'
  END;
$$;

-- ---------------------------------------------------------------------------
-- crm_compute_customer_engagement(email)
-- Calculates engagement score for a single contact.
-- Returns: { engagement_score, try_on_count, order_count, last_activity_at, is_dormant }
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_compute_customer_engagement(p_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_try_on_count INT;
  v_order_count INT;
  v_lifetime_value NUMERIC;
  v_last_activity TIMESTAMP WITH TIME ZONE;
  v_engagement_score NUMERIC;
  v_is_dormant BOOLEAN;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  -- Fetch metrics from crm_contacts view
  SELECT
    COALESCE(cc.try_on_count, 0),
    COALESCE(cc.order_count, 0),
    COALESCE(cc.lifetime_value, 0),
    cc.last_activity_at
  INTO v_try_on_count, v_order_count, v_lifetime_value, v_last_activity
  FROM public.crm_contacts cc
  WHERE cc.email = v_email_normalized;

  -- If contact doesn't exist in crm_contacts yet, return zeros
  IF v_try_on_count IS NULL THEN
    v_try_on_count := 0;
  END IF;
  IF v_order_count IS NULL THEN
    v_order_count := 0;
  END IF;
  IF v_lifetime_value IS NULL THEN
    v_lifetime_value := 0;
  END IF;

  -- Engagement score = try_on_count + (order_count × 2) + recency bonus
  v_engagement_score := v_try_on_count + (v_order_count * 2);

  -- Recency bonus: +10 if active in last 30 days, +5 if last 90 days
  IF v_last_activity IS NOT NULL THEN
    IF v_last_activity > now() - interval '30 days' THEN
      v_engagement_score := v_engagement_score + 10;
    ELSIF v_last_activity > now() - interval '90 days' THEN
      v_engagement_score := v_engagement_score + 5;
    END IF;
  END IF;

  -- Dormancy check
  v_is_dormant := (v_last_activity IS NULL OR v_last_activity < now() - interval '90 days');

  RETURN jsonb_build_object(
    'engagement_score', v_engagement_score,
    'try_on_count', v_try_on_count,
    'order_count', v_order_count,
    'lifetime_value', v_lifetime_value,
    'last_activity_at', v_last_activity,
    'is_dormant', v_is_dormant
  );
END;
$$;

COMMENT ON FUNCTION public.crm_compute_customer_engagement IS
  'Calculate engagement score and metrics for a contact. Used by rank computation.';

-- ---------------------------------------------------------------------------
-- crm_compute_customer_rank(email)
-- Determines rank tier based on metrics.
-- Logic:
--   Rank 5 (VIP):       order_count > 0 AND lifetime_value > 50000 AND engagement_score > 20
--   Rank 4 (Customer):  order_count > 0 AND lifetime_value > 0
--   Rank 3 (Registered): is_registered = true
--   Rank 2 (Subscriber): is_newsletter_subscriber = true
--   Rank 1 (Lead):      default
-- Returns: { rank, label, reason }
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_compute_customer_rank(p_email TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_normalized TEXT;
  v_cc crm_contacts%ROWTYPE;
  v_engagement jsonb;
  v_new_rank INT;
  v_reason TEXT;
BEGIN
  v_email_normalized := LOWER(TRIM(p_email));

  -- Fetch contact from view
  SELECT * INTO v_cc FROM public.crm_contacts WHERE email = v_email_normalized;
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'rank', 1,
      'label', 'Lead',
      'reason', 'Contact not found'
    );
  END IF;

  -- Get engagement metrics
  v_engagement := public.crm_compute_customer_engagement(v_email_normalized);

  -- Determine rank (check highest tier first)
  -- Tier 5: VIP — high-value, highly engaged customer
  IF v_cc.order_count > 0
     AND v_cc.lifetime_value > 50000
     AND (v_engagement->>'engagement_score')::NUMERIC > 20
  THEN
    v_new_rank := 5;
    v_reason := format(
      'VIP: %s orders, ₦%s LTV, engagement=%s',
      v_cc.order_count,
      v_cc.lifetime_value,
      v_engagement->>'engagement_score'
    );
  -- Tier 4: Customer — made purchase
  ELSIF v_cc.order_count > 0 AND v_cc.lifetime_value > 0 THEN
    v_new_rank := 4;
    v_reason := format(
      'Customer: %s orders, ₦%s LTV',
      v_cc.order_count,
      v_cc.lifetime_value
    );
  -- Tier 3: Registered — has account
  ELSIF v_cc.is_registered THEN
    v_new_rank := 3;
    v_reason := 'Registered user account';
  -- Tier 2: Subscriber — newsletter opt-in
  ELSIF v_cc.is_newsletter_subscriber THEN
    v_new_rank := 2;
    v_reason := 'Newsletter subscriber';
  -- Tier 1: Lead — default
  ELSE
    v_new_rank := 1;
    v_reason := 'Lead: email captured';
  END IF;

  RETURN jsonb_build_object(
    'rank', v_new_rank,
    'label', public.get_rank_label(v_new_rank),
    'reason', v_reason,
    'engagement_score', (v_engagement->>'engagement_score')::NUMERIC,
    'is_dormant', (v_engagement->>'is_dormant')::BOOLEAN
  );
END;
$$;

COMMENT ON FUNCTION public.crm_compute_customer_rank IS
  'Determine rank tier for a customer based on order count, LTV, and engagement.';

-- ---------------------------------------------------------------------------
-- crm_compute_customer_ranks()
-- Bulk rank computation: updates all contacts in crm_customer_ranks.
-- Idempotent — safe to call frequently (e.g., daily job).
-- Logs rank changes to crm_rank_history.
-- Returns: count of ranks updated + count of rank changes
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_compute_customer_ranks()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count_updated INT := 0;
  v_count_changed INT := 0;
  v_email TEXT;
  v_rank_info jsonb;
  v_old_rank INT;
  v_new_rank INT;
  v_engagement jsonb;
BEGIN
  -- Iterate over all contacts in crm_contacts view
  FOR v_email IN
    SELECT DISTINCT email FROM public.crm_contacts
    ORDER BY email
  LOOP
    -- Compute rank for this contact
    v_rank_info := public.crm_compute_customer_rank(v_email);
    v_new_rank := (v_rank_info->>'rank')::INT;
    v_engagement := public.crm_compute_customer_engagement(v_email);

    -- Fetch existing rank (if any)
    SELECT current_rank INTO v_old_rank
    FROM public.crm_customer_ranks
    WHERE email = v_email;

    -- Insert or update crm_customer_ranks
    INSERT INTO public.crm_customer_ranks (
      email, current_rank, rank_label, engagement_score, is_dormant,
      reason, computed_at
    )
    VALUES (
      v_email,
      v_new_rank,
      v_rank_info->>'label',
      (v_engagement->>'engagement_score')::NUMERIC,
      (v_engagement->>'is_dormant')::BOOLEAN,
      v_rank_info->>'reason',
      now()
    )
    ON CONFLICT (email) DO UPDATE SET
      current_rank = EXCLUDED.current_rank,
      rank_label = EXCLUDED.rank_label,
      engagement_score = EXCLUDED.engagement_score,
      is_dormant = EXCLUDED.is_dormant,
      reason = EXCLUDED.reason,
      computed_at = EXCLUDED.computed_at,
      promoted_at = CASE
        WHEN EXCLUDED.current_rank > crm_customer_ranks.current_rank THEN now()
        ELSE crm_customer_ranks.promoted_at
      END,
      demoted_at = CASE
        WHEN EXCLUDED.current_rank < crm_customer_ranks.current_rank THEN now()
        ELSE crm_customer_ranks.demoted_at
      END;

    v_count_updated := v_count_updated + 1;

    -- Log rank change to history
    IF v_old_rank IS DISTINCT FROM v_new_rank THEN
      INSERT INTO public.crm_rank_history (
        email, old_rank, new_rank, reason,
        engagement_score, lifetime_value,
        try_on_count, order_count
      )
      SELECT
        v_email,
        v_old_rank,
        v_new_rank,
        v_rank_info->>'reason',
        (v_engagement->>'engagement_score')::NUMERIC,
        (v_engagement->>'lifetime_value')::NUMERIC,
        (v_engagement->>'try_on_count')::INT,
        (v_engagement->>'order_count')::INT;

      v_count_changed := v_count_changed + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', TRUE,
    'count_updated', v_count_updated,
    'count_changed', v_count_changed,
    'message', format('Computed ranks for %s contacts; %s rank changes', v_count_updated, v_count_changed)
  );
END;
$$;

COMMENT ON FUNCTION public.crm_compute_customer_ranks IS
  'Bulk compute and update customer ranks. Idempotent. Call daily or after major activity.';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.crm_compute_customer_engagement(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_compute_customer_rank(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_compute_customer_ranks() TO authenticated;
GRANT SELECT ON public.crm_customer_ranks TO authenticated;
GRANT SELECT ON public.crm_rank_history TO authenticated;
