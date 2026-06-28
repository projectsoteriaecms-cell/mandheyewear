-- =============================================================================
-- CRM Campaign Events Time-Series
--
-- crm_campaign_events_timeseries(p_campaign_id, p_bucket)
--   Returns hourly (or daily) bucketed counts of opens / clicks / bounces /
--   unsubscribes for a given campaign, ordered by bucket start time.
--   Used to render the engagement-over-time chart in the campaign detail modal.
--
-- p_bucket: 'hour' (default) or 'day'
-- =============================================================================

CREATE OR REPLACE FUNCTION public.crm_campaign_events_timeseries(
  p_campaign_id UUID,
  p_bucket      TEXT DEFAULT 'hour'
)
RETURNS TABLE(
  bucket_start TIMESTAMPTZ,
  opens        BIGINT,
  clicks       BIGINT,
  bounces      BIGINT,
  unsubscribes BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT
    date_trunc(p_bucket, e.occurred_at)                           AS bucket_start,
    COUNT(*) FILTER (WHERE e.event_type = 'opened')               AS opens,
    COUNT(*) FILTER (WHERE e.event_type = 'clicked')              AS clicks,
    COUNT(*) FILTER (WHERE e.event_type = 'bounced')              AS bounces,
    COUNT(*) FILTER (WHERE e.event_type = 'unsubscribed')         AS unsubscribes
  FROM   public.crm_email_events e
  WHERE  e.campaign_id = p_campaign_id
    AND  e.event_type  IN ('opened', 'clicked', 'bounced', 'unsubscribed')
  GROUP  BY 1
  ORDER  BY 1;
$$;

COMMENT ON FUNCTION public.crm_campaign_events_timeseries(UUID, TEXT) IS
  'Bucketed (hour/day) engagement time-series for a campaign. Used by the analytics chart in the admin UI.';

GRANT EXECUTE ON FUNCTION public.crm_campaign_events_timeseries(UUID, TEXT)
  TO authenticated;
