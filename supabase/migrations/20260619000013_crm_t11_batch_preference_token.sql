-- =============================================================================
-- T11: N+1 fix — extend crm_get_unsent_batch to return preference_token
--
-- Before this change, the EF would need one crm_ensure_preference_token() call
-- per recipient to build preference-centre URLs → N+1 round trips.
-- Fix: LEFT JOIN crm_preference_tokens inside the batch query so all recipient
-- data (email, full_name, preference_token) arrives in a single DB call.
-- Contacts with no token row get NULL; the EF falls back to a plain
-- mailto-style unsubscribe link in that case.
--
-- DROP first because Postgres won't allow CREATE OR REPLACE to change the
-- return type signature (new column: preference_token UUID).
-- =============================================================================

DROP FUNCTION IF EXISTS public.crm_get_unsent_batch(UUID, JSONB, INT);

CREATE FUNCTION public.crm_get_unsent_batch(
  p_run_id     UUID,
  p_rules_json JSONB,
  p_batch_size INT DEFAULT 50
)
RETURNS TABLE(email TEXT, full_name TEXT, preference_token UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    r.email,
    r.full_name,
    pt.token AS preference_token
  FROM   public.crm_eval_segment_rules(p_rules_json) AS r
  LEFT JOIN public.crm_preference_tokens pt ON pt.email = r.email
  WHERE  r.email NOT IN (
    SELECT contact_email
    FROM   public.crm_campaign_sent_ledger
    WHERE  campaign_run_id = p_run_id
  )
  LIMIT  p_batch_size;
$$;

COMMENT ON FUNCTION public.crm_get_unsent_batch(UUID, JSONB, INT) IS
  'T8 resumable batch load. Evaluates segment rules, subtracts the sent ledger, '
  'and LEFT JOINs preference tokens (T11 N+1 fix) — all in one query.';
