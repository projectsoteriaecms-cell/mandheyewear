-- =============================================================================
-- T19: LTV + cohort retention analytics
-- (ROUND casts fixed: lifetime_value is double precision in crm_contacts view)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. crm_ltv_summary()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_ltv_summary()
RETURNS TABLE(
  total_contacts    BIGINT,
  converted_count   BIGINT,
  conversion_rate   NUMERIC,
  total_revenue     NUMERIC,
  avg_ltv_converted NUMERIC,
  median_ltv        NUMERIC,
  p90_ltv           NUMERIC
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT
    COUNT(*) AS total_contacts,
    COUNT(*) FILTER (WHERE lifetime_value > 0) AS converted_count,
    ROUND(
      (100.0 * COUNT(*) FILTER (WHERE lifetime_value > 0) / NULLIF(COUNT(*), 0))::NUMERIC, 1
    ) AS conversion_rate,
    ROUND(COALESCE(SUM(lifetime_value), 0)::NUMERIC, 2) AS total_revenue,
    ROUND(AVG(lifetime_value) FILTER (WHERE lifetime_value > 0)::NUMERIC, 2) AS avg_ltv_converted,
    ROUND(
      (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY lifetime_value)
       FILTER (WHERE lifetime_value > 0))::NUMERIC, 2
    ) AS median_ltv,
    ROUND(
      (PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY lifetime_value)
       FILTER (WHERE lifetime_value > 0))::NUMERIC, 2
    ) AS p90_ltv
  FROM public.crm_contacts
  WHERE NOT is_suppressed;
$$;

-- ---------------------------------------------------------------------------
-- 2. crm_ltv_by_channel()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_ltv_by_channel()
RETURNS TABLE(
  channel           TEXT,
  contact_count     BIGINT,
  converted_count   BIGINT,
  conversion_rate   NUMERIC,
  avg_ltv           NUMERIC,
  total_revenue     NUMERIC
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT
    CASE
      WHEN is_vto_lead                                                        THEN 'Virtual Try-On'
      WHEN is_newsletter_subscriber AND NOT is_vto_lead                       THEN 'Newsletter'
      WHEN is_registered AND NOT is_vto_lead AND NOT is_newsletter_subscriber THEN 'Direct / Registered'
      ELSE 'Other'
    END AS channel,
    COUNT(*) AS contact_count,
    COUNT(*) FILTER (WHERE lifetime_value > 0) AS converted_count,
    ROUND(
      (100.0 * COUNT(*) FILTER (WHERE lifetime_value > 0) / NULLIF(COUNT(*), 0))::NUMERIC, 1
    ) AS conversion_rate,
    ROUND(AVG(lifetime_value) FILTER (WHERE lifetime_value > 0)::NUMERIC, 2) AS avg_ltv,
    ROUND(COALESCE(SUM(lifetime_value), 0)::NUMERIC, 2) AS total_revenue
  FROM public.crm_contacts
  WHERE NOT is_suppressed
  GROUP BY 1
  ORDER BY total_revenue DESC NULLS LAST;
$$;

-- ---------------------------------------------------------------------------
-- 3. crm_monthly_revenue_trend(p_months)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_monthly_revenue_trend(
  p_months INT DEFAULT 12
)
RETURNS TABLE(
  month          DATE,
  revenue        NUMERIC,
  order_count    BIGINT,
  new_customers  BIGINT
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  WITH window_start AS (
    SELECT DATE_TRUNC('month', CURRENT_DATE - (p_months - 1 || ' months')::INTERVAL)::DATE AS d
  ),
  months AS (
    SELECT (DATE_TRUNC('month', CURRENT_DATE) - (gs || ' months')::INTERVAL)::DATE AS month
    FROM generate_series(0, p_months - 1) AS gs
  ),
  paid_orders AS (
    SELECT
      o.user_id,
      DATE_TRUNC('month', o.created_at)::DATE AS order_month,
      o.total_amount
    FROM public.orders o
    WHERE o.payment_status = 'paid'
      AND o.created_at >= (SELECT d FROM window_start)
  ),
  monthly_rev AS (
    SELECT order_month AS month, SUM(total_amount)::NUMERIC AS revenue, COUNT(*) AS order_count
    FROM paid_orders
    GROUP BY order_month
  ),
  first_purchase AS (
    SELECT user_id, DATE_TRUNC('month', MIN(created_at))::DATE AS first_month
    FROM public.orders
    WHERE payment_status = 'paid'
    GROUP BY user_id
  ),
  new_by_month AS (
    SELECT first_month AS month, COUNT(*) AS new_customers
    FROM first_purchase
    WHERE first_month >= (SELECT d FROM window_start)
    GROUP BY first_month
  )
  SELECT
    m.month,
    COALESCE(mr.revenue,       0) AS revenue,
    COALESCE(mr.order_count,   0) AS order_count,
    COALESCE(nb.new_customers, 0) AS new_customers
  FROM months m
  LEFT JOIN monthly_rev  mr ON mr.month = m.month
  LEFT JOIN new_by_month nb ON nb.month = m.month
  ORDER BY m.month;
$$;

-- ---------------------------------------------------------------------------
-- 4. crm_cohort_grid(p_months)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.crm_cohort_grid(
  p_months INT DEFAULT 6
)
RETURNS TABLE(
  cohort_month  DATE,
  months_after  INT,
  cohort_size   BIGINT,
  active_count  BIGINT,
  retention_pct NUMERIC
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  WITH first_purchase AS (
    SELECT user_id, DATE_TRUNC('month', MIN(created_at))::DATE AS cohort_month
    FROM public.orders
    WHERE payment_status = 'paid'
    GROUP BY user_id
    HAVING DATE_TRUNC('month', MIN(created_at)) >=
           DATE_TRUNC('month', CURRENT_DATE - '18 months'::INTERVAL)
  ),
  cohort_sizes AS (
    SELECT cohort_month, COUNT(*) AS sz FROM first_purchase GROUP BY cohort_month
  ),
  monthly_activity AS (
    SELECT DISTINCT user_id, DATE_TRUNC('month', created_at)::DATE AS active_month
    FROM public.orders
    WHERE payment_status = 'paid'
  ),
  grid AS (
    SELECT
      fp.cohort_month,
      (
        EXTRACT(year  FROM age(ma.active_month::TIMESTAMPTZ, fp.cohort_month::TIMESTAMPTZ)) * 12 +
        EXTRACT(month FROM age(ma.active_month::TIMESTAMPTZ, fp.cohort_month::TIMESTAMPTZ))
      )::INT AS months_after,
      COUNT(DISTINCT fp.user_id) AS active_count
    FROM first_purchase fp
    JOIN monthly_activity ma ON ma.user_id = fp.user_id
      AND ma.active_month >= fp.cohort_month
      AND ma.active_month <= (fp.cohort_month + (p_months || ' months')::INTERVAL)::DATE
    GROUP BY fp.cohort_month, months_after
  )
  SELECT
    g.cohort_month,
    g.months_after,
    cs.sz AS cohort_size,
    g.active_count,
    ROUND((100.0 * g.active_count / NULLIF(cs.sz, 0))::NUMERIC, 1) AS retention_pct
  FROM grid g
  JOIN cohort_sizes cs ON cs.cohort_month = g.cohort_month
  ORDER BY g.cohort_month DESC, g.months_after;
$$;

GRANT EXECUTE ON FUNCTION public.crm_ltv_summary()                TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_ltv_by_channel()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_monthly_revenue_trend(INT)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.crm_cohort_grid(INT)             TO authenticated;
