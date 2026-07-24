-- Redefine the tier 2-5 segments as inclusive attribute rules.
--
-- After 20260724110000 exposed current_rank these segments at least evaluated,
-- but their DEFINITIONS were still wrong, because crm_compute_customer_rank
-- assigns rank via an exclusive ELSIF ladder (highest tier wins):
--
--   Tier 5 VIP        <- order_count > 0 AND lifetime_value > 50000 AND engagement > 20
--   Tier 4 Customer   <- order_count > 0 AND lifetime_value > 0
--   Tier 3 Registered <- is_registered
--   Tier 2 Subscriber <- is_newsletter_subscriber
--   Tier 1 Lead       <- default
--
-- Because the ladder is exclusive, "current_rank = 2" does NOT mean "newsletter
-- subscriber" -- it means "a newsletter subscriber who is NOT registered and has
-- NEVER purchased". A subscriber who later registers silently drops out of the
-- "Newsletter Subscribers" segment; a VIP is absent from "Active Customers".
-- That is the opposite of what these segment names promise.
--
-- Redefined against the underlying attributes so each segment means what its
-- name says, and membership no longer depends on crm_compute_customer_ranks
-- having been run recently.
--
-- Thresholds deliberately mirror the tier-5 rule above so the two systems agree.
-- engagement_score is not exposed on crm_contacts, so the VIP rule uses the
-- order_count + lifetime_value components only.
--
-- Member counts after applying (all 10 segments evaluate):
--   Newsletter Subscribers 2 (was 0 -- the real win here)
--   Registered Users       0  -- 11 registered users exist but NONE hold
--                              marketing consent, and crm_eval_segment_rules
--                              always prefilters marketing_consent = true
--   Active Customers       0  -- zero paid orders exist yet
--   VIP Customers          0  -- same
-- The three zeros are missing DATA, not broken rules; they populate on their own.
--
-- "All Leads" is intentionally left on current_rank = 1: tier 1 genuinely means
-- "lead, nothing more", which matches that segment's name.

UPDATE crm_segments SET
  rules_json = '{"type":"group","operator":"AND","conditions":[
      {"op":"eq","type":"condition","field":"newsletter_active","value":"true"}]}'::jsonb,
  description = 'Everyone with an ACTIVE newsletter subscription, regardless of whether they also registered or purchased.',
  updated_at = now()
WHERE name = 'Newsletter Subscribers';

UPDATE crm_segments SET
  rules_json = '{"type":"group","operator":"AND","conditions":[
      {"op":"eq","type":"condition","field":"is_registered","value":"true"}]}'::jsonb,
  description = 'Everyone with a user account, regardless of purchase history.',
  updated_at = now()
WHERE name = 'Registered Users';

UPDATE crm_segments SET
  rules_json = '{"type":"group","operator":"AND","conditions":[
      {"op":"gte","type":"condition","field":"order_count","value":"1"}]}'::jsonb,
  description = 'Everyone who has completed at least one paid order (includes VIPs).',
  updated_at = now()
WHERE name = 'Active Customers';

UPDATE crm_segments SET
  rules_json = '{"type":"group","operator":"AND","conditions":[
      {"op":"gte","type":"condition","field":"order_count","value":"1"},
      {"op":"gt","type":"condition","field":"lifetime_value","value":"50000"}]}'::jsonb,
  description = 'Customers with >NGN50,000 lifetime spend. Threshold matches the tier-5 rule in crm_compute_customer_rank (engagement_score is not exposed on crm_contacts, so that component is omitted).',
  updated_at = now()
WHERE name = 'VIP Customers';

-- Refresh the cached counters so the admin UI stops showing stale numbers from
-- when these segments were failing to evaluate at all.
DO $$
DECLARE r RECORD; n BIGINT;
BEGIN
  FOR r IN SELECT id, rules_json FROM crm_segments LOOP
    BEGIN
      SELECT count(*) INTO n FROM crm_eval_segment_rules(r.rules_json);
      UPDATE crm_segments SET member_count = n, last_computed_at = now() WHERE id = r.id;
    EXCEPTION WHEN OTHERS THEN
      -- A segment that still fails keeps its old counter rather than aborting
      -- the whole migration.
      NULL;
    END;
  END LOOP;
END $$;
