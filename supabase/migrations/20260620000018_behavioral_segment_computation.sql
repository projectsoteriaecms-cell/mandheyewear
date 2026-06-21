-- Migration: Behavioral Segment Computation
-- Purpose: Auto-compute user behavioral segments based on event patterns
-- Date: 2026-06-20

-- RPC: Compute behavioral segments for all users
CREATE OR REPLACE FUNCTION public.crm_compute_behavioral_segments()
RETURNS TABLE (
  email TEXT,
  segment_name TEXT,
  confidence_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Clear previous segments
  DELETE FROM public.user_behavioral_segments;

  -- HIGH_INTENT: Used VTO + viewed products + opened emails + no purchase yet
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'high_intent',
    0.95::NUMERIC,
    'Used VTO, viewed products, engaged with emails'
  FROM public.crm_contacts cc
  WHERE EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'used_vto'
  )
  AND EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'viewed_product'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'completed_order'
  );

  -- ENGAGED_BUYER: Multiple purchases, repeat customer
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'engaged_buyer',
    0.95::NUMERIC,
    'Repeat customer with multiple purchases'
  FROM public.crm_contacts cc
  WHERE (
    SELECT COUNT(*) FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'completed_order'
  ) >= 2;

  -- VIP: High LTV (top 10% spenders)
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'vip',
    0.9::NUMERIC,
    'High lifetime value customer'
  FROM public.crm_contacts cc
  WHERE cc.lifetime_value >= (
    SELECT PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY lifetime_value)
    FROM public.crm_contacts
  )
  AND cc.lifetime_value > 0;

  -- WINDOW_SHOPPER: Viewed products but never purchased
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'window_shopper',
    0.85::NUMERIC,
    'Viewed products but no purchase'
  FROM public.crm_contacts cc
  WHERE EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'viewed_product'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'completed_order'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_behavioral_segments ubs
    WHERE ubs.email = cc.email
  );

  -- AT_RISK: No engagement in 60+ days, has purchased before
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'at_risk',
    0.9::NUMERIC,
    'Previously purchased but inactive for 60+ days'
  FROM public.crm_contacts cc
  WHERE EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'completed_order'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email
      AND ue.created_at >= NOW() - INTERVAL '60 days'
  );

  -- NEWSLETTER_SUBSCRIBER: Only email engagement, no product events
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'newsletter_subscriber',
    0.8::NUMERIC,
    'Engaged with emails only, no product interaction'
  FROM public.crm_contacts cc
  WHERE cc.is_newsletter_subscriber = TRUE
  AND EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND (ue.event_type = 'opened_email' OR ue.event_type = 'clicked_email')
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type IN ('viewed_product', 'used_vto', 'completed_order')
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_behavioral_segments ubs
    WHERE ubs.email = cc.email
  );

  -- DORMANT: No events in 90+ days
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'dormant',
    0.95::NUMERIC,
    'No activity for 90+ days'
  FROM public.crm_contacts cc
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email
      AND ue.created_at >= NOW() - INTERVAL '90 days'
  )
  AND EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_behavioral_segments ubs
    WHERE ubs.email = cc.email
  );

  -- NEW: Has activity in last 7 days, no purchases yet
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'new',
    0.9::NUMERIC,
    'New user with recent activity'
  FROM public.crm_contacts cc
  WHERE EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email
      AND ue.created_at >= NOW() - INTERVAL '7 days'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'completed_order'
  )
  AND NOT EXISTS (
    SELECT 1 FROM public.user_behavioral_segments ubs
    WHERE ubs.email = cc.email
  );

  -- CHAMPION: Purchased multiple times + high LTV + referred others (if available)
  INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
  SELECT DISTINCT
    cc.email,
    'champion',
    1.0::NUMERIC,
    'Loyal advocate - repeat purchaser with high LTV'
  FROM public.crm_contacts cc
  WHERE (
    SELECT COUNT(*) FROM public.user_events ue
    WHERE ue.email = cc.email AND ue.event_type = 'completed_order'
  ) >= 3
  AND cc.lifetime_value >= 5000;  -- Adjust threshold based on your business

  RETURN QUERY
  SELECT ubs.email, ubs.segment_name, ubs.confidence_score
  FROM public.user_behavioral_segments ubs
  ORDER BY ubs.email;
END;
$$;

-- RPC: Update segments for a single user (fast, targeted)
CREATE OR REPLACE FUNCTION public.crm_update_user_segment(p_email TEXT)
RETURNS TABLE (
  email TEXT,
  segment_name TEXT,
  confidence_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email TEXT := LOWER(TRIM(p_email));
BEGIN
  -- Delete existing segments for this user
  DELETE FROM public.user_behavioral_segments WHERE email = v_email;

  -- Determine primary segment (most specific/recent behavior)
  -- HIGH_INTENT
  IF EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = v_email AND ue.event_type = 'used_vto'
  ) AND EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = v_email AND ue.event_type = 'viewed_product'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = v_email AND ue.event_type = 'completed_order'
  ) THEN
    INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
    VALUES (v_email, 'high_intent', 0.95, 'VTO + product views + no purchase yet');
  -- ENGAGED_BUYER
  ELSIF (
    SELECT COUNT(*) FROM public.user_events ue
    WHERE ue.email = v_email AND ue.event_type = 'completed_order'
  ) >= 2 THEN
    INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
    VALUES (v_email, 'engaged_buyer', 0.95, 'Multiple purchases');
  -- AT_RISK
  ELSIF (
    SELECT COUNT(*) FROM public.user_events ue
    WHERE ue.email = v_email AND ue.event_type = 'completed_order'
  ) >= 1 AND NOT EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = v_email
      AND ue.created_at >= NOW() - INTERVAL '60 days'
  ) THEN
    INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
    VALUES (v_email, 'at_risk', 0.9, 'Inactive 60+ days');
  -- WINDOW_SHOPPER
  ELSIF EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = v_email AND ue.event_type = 'viewed_product'
  ) THEN
    INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
    VALUES (v_email, 'window_shopper', 0.85, 'Product views, no purchase');
  -- NEW
  ELSIF EXISTS (
    SELECT 1 FROM public.user_events ue
    WHERE ue.email = v_email
      AND ue.created_at >= NOW() - INTERVAL '7 days'
  ) THEN
    INSERT INTO public.user_behavioral_segments (email, segment_name, confidence_score, reason)
    VALUES (v_email, 'new', 0.9, 'Recent activity');
  END IF;

  RETURN QUERY
  SELECT ubs.email, ubs.segment_name, ubs.confidence_score
  FROM public.user_behavioral_segments ubs
  WHERE ubs.email = v_email;
END;
$$;
