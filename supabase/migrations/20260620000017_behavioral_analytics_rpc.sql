-- Migration: Behavioral Analytics RPC Functions
-- Purpose: Functions for user journey, funnel, and behavioral analysis
-- Date: 2026-06-20

-- RPC: Track a user event (insert into user_events)
CREATE OR REPLACE FUNCTION public.crm_track_event(
  p_email TEXT,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::JSONB,
  p_source TEXT DEFAULT 'web'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_normalized_email TEXT;
BEGIN
  -- Normalize email
  v_normalized_email := LOWER(TRIM(p_email));

  -- Insert event
  INSERT INTO public.user_events (email, event_type, event_data, source)
  VALUES (
    v_normalized_email,
    p_event_type::public.event_type,
    p_event_data,
    p_source
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- RPC: Get user journey (events timeline for a contact)
CREATE OR REPLACE FUNCTION public.crm_get_user_journey(p_email TEXT)
RETURNS TABLE (
  event_type TEXT,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  days_ago INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ue.event_type::TEXT,
    ue.event_data,
    ue.created_at,
    (EXTRACT(EPOCH FROM (NOW() - ue.created_at)) / 86400)::INTEGER AS days_ago
  FROM public.user_events ue
  WHERE ue.email = LOWER(TRIM(p_email))
  ORDER BY ue.created_at DESC
  LIMIT 100;
END;
$$;

-- RPC: Get feature usage (event type distribution)
CREATE OR REPLACE FUNCTION public.crm_get_feature_usage()
RETURNS TABLE (
  feature_name TEXT,
  event_count BIGINT,
  unique_users BIGINT,
  last_30_days_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ue.event_type::TEXT,
    COUNT(*) AS event_count,
    COUNT(DISTINCT ue.email) AS unique_users,
    COUNT(*) FILTER (WHERE ue.created_at >= NOW() - INTERVAL '30 days') AS last_30_days_count
  FROM public.user_events ue
  GROUP BY ue.event_type
  ORDER BY event_count DESC;
END;
$$;

-- RPC: Get product affinity (which products appeal to which segments)
CREATE OR REPLACE FUNCTION public.crm_get_product_affinity()
RETURNS TABLE (
  product_id TEXT,
  product_views BIGINT,
  add_to_cart_count BIGINT,
  purchase_count BIGINT,
  view_to_cart_rate NUMERIC,
  cart_to_purchase_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH product_events AS (
    SELECT
      ue.event_data->>'product_id' AS product_id,
      ue.event_type::TEXT
    FROM public.user_events ue
    WHERE ue.event_data ? 'product_id'
  )
  SELECT
    pe.product_id,
    COUNT(*) FILTER (WHERE pe.event_type = 'viewed_product')::BIGINT AS product_views,
    COUNT(*) FILTER (WHERE pe.event_type = 'added_to_cart')::BIGINT AS add_to_cart_count,
    COUNT(*) FILTER (WHERE pe.event_type = 'completed_order')::BIGINT AS purchase_count,
    CASE
      WHEN COUNT(*) FILTER (WHERE pe.event_type = 'viewed_product') > 0
      THEN ROUND(
        COUNT(*) FILTER (WHERE pe.event_type = 'added_to_cart')::NUMERIC /
        COUNT(*) FILTER (WHERE pe.event_type = 'viewed_product'),
        2
      )
      ELSE 0
    END AS view_to_cart_rate,
    CASE
      WHEN COUNT(*) FILTER (WHERE pe.event_type = 'added_to_cart') > 0
      THEN ROUND(
        COUNT(*) FILTER (WHERE pe.event_type = 'completed_order')::NUMERIC /
        COUNT(*) FILTER (WHERE pe.event_type = 'added_to_cart'),
        2
      )
      ELSE 0
    END AS cart_to_purchase_rate
  FROM product_events pe
  GROUP BY pe.product_id
  ORDER BY product_views DESC;
END;
$$;

-- RPC: Get funnel analysis (VTO → Product View → Cart → Order)
CREATE OR REPLACE FUNCTION public.crm_get_funnel_analysis()
RETURNS TABLE (
  stage TEXT,
  unique_users BIGINT,
  pct_of_previous NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vto_users BIGINT;
  v_product_view_users BIGINT;
  v_add_to_cart_users BIGINT;
  v_purchase_users BIGINT;
BEGIN
  -- Count unique users at each stage
  SELECT COUNT(DISTINCT email) INTO v_vto_users
  FROM public.user_events
  WHERE event_type = 'used_vto';

  SELECT COUNT(DISTINCT email) INTO v_product_view_users
  FROM public.user_events
  WHERE event_type = 'viewed_product';

  SELECT COUNT(DISTINCT email) INTO v_add_to_cart_users
  FROM public.user_events
  WHERE event_type = 'added_to_cart';

  SELECT COUNT(DISTINCT email) INTO v_purchase_users
  FROM public.user_events
  WHERE event_type = 'completed_order';

  -- Return funnel stages
  RETURN QUERY
  SELECT 'Virtual Try-On (VTO)'::TEXT, v_vto_users::BIGINT, 100::NUMERIC
  UNION ALL
  SELECT 'Viewed Product'::TEXT, v_product_view_users::BIGINT,
    CASE WHEN v_vto_users > 0 THEN ROUND((v_product_view_users::NUMERIC / v_vto_users) * 100, 1) ELSE 0 END
  UNION ALL
  SELECT 'Added to Cart'::TEXT, v_add_to_cart_users::BIGINT,
    CASE WHEN v_product_view_users > 0 THEN ROUND((v_add_to_cart_users::NUMERIC / v_product_view_users) * 100, 1) ELSE 0 END
  UNION ALL
  SELECT 'Completed Purchase'::TEXT, v_purchase_users::BIGINT,
    CASE WHEN v_add_to_cart_users > 0 THEN ROUND((v_purchase_users::NUMERIC / v_add_to_cart_users) * 100, 1) ELSE 0 END;
END;
$$;

-- RPC: Get behavioral segments (high-intent, at-risk, etc)
CREATE OR REPLACE FUNCTION public.crm_get_behavioral_segments()
RETURNS TABLE (
  segment_name TEXT,
  user_count BIGINT,
  avg_ltv NUMERIC,
  engagement_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ubs.segment_name,
    COUNT(DISTINCT ubs.email)::BIGINT AS user_count,
    ROUND(AVG((cc.lifetime_value)::NUMERIC), 2) AS avg_ltv,
    ROUND(AVG(ubs.confidence_score), 2) AS engagement_score
  FROM public.user_behavioral_segments ubs
  LEFT JOIN public.crm_contacts cc ON ubs.email = cc.email
  GROUP BY ubs.segment_name
  ORDER BY user_count DESC;
END;
$$;

-- RPC: Get at-risk users (no engagement in last 30 days)
CREATE OR REPLACE FUNCTION public.crm_get_at_risk_users(p_days_threshold INT DEFAULT 30)
RETURNS TABLE (
  email TEXT,
  full_name TEXT,
  last_engagement_date TIMESTAMP WITH TIME ZONE,
  days_since_engagement INT,
  lifetime_value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH recent_events AS (
    SELECT
      ue.email,
      MAX(ue.created_at) AS last_event_date
    FROM public.user_events ue
    GROUP BY ue.email
  )
  SELECT
    re.email,
    cc.full_name,
    re.last_event_date,
    (EXTRACT(EPOCH FROM (NOW() - re.last_event_date)) / 86400)::INT AS days_since_engagement,
    cc.lifetime_value
  FROM recent_events re
  LEFT JOIN public.crm_contacts cc ON re.email = cc.email
  WHERE (EXTRACT(EPOCH FROM (NOW() - re.last_event_date)) / 86400)::INT >= p_days_threshold
  ORDER BY re.last_event_date ASC;
END;
$$;

-- RPC: Get VTO to purchase conversion (specialized funnel)
CREATE OR REPLACE FUNCTION public.crm_get_vto_conversion_analysis()
RETURNS TABLE (
  metric TEXT,
  value NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vto_users BIGINT;
  v_vto_to_purchase BIGINT;
  v_avg_days_to_purchase NUMERIC;
BEGIN
  -- VTO users
  SELECT COUNT(DISTINCT email) INTO v_vto_users
  FROM public.user_events
  WHERE event_type = 'used_vto';

  -- VTO users who purchased
  SELECT COUNT(DISTINCT email) INTO v_vto_to_purchase
  FROM (
    SELECT DISTINCT ue1.email
    FROM public.user_events ue1
    WHERE ue1.event_type = 'used_vto'
      AND EXISTS (
        SELECT 1 FROM public.user_events ue2
        WHERE ue2.email = ue1.email
          AND ue2.event_type = 'completed_order'
          AND ue2.created_at > ue1.created_at
      )
  ) t;

  -- Avg days from VTO to purchase
  SELECT AVG((ue2.created_at - ue1.created_at) / INTERVAL '1 day')
  INTO v_avg_days_to_purchase
  FROM public.user_events ue1
  JOIN public.user_events ue2 ON ue1.email = ue2.email
  WHERE ue1.event_type = 'used_vto'
    AND ue2.event_type = 'completed_order'
    AND ue2.created_at > ue1.created_at;

  -- Return metrics
  RETURN QUERY
  SELECT 'Total VTO Users'::TEXT, v_vto_users::NUMERIC
  UNION ALL
  SELECT 'VTO to Purchase Count'::TEXT, v_vto_to_purchase::NUMERIC
  UNION ALL
  SELECT 'VTO Conversion Rate (%)'::TEXT,
    CASE WHEN v_vto_users > 0 THEN ROUND((v_vto_to_purchase::NUMERIC / v_vto_users) * 100, 1) ELSE 0 END
  UNION ALL
  SELECT 'Avg Days VTO to Purchase'::TEXT, COALESCE(ROUND(v_avg_days_to_purchase, 1), 0);
END;
$$;
