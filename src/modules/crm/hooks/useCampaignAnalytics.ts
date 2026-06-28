import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignAnalytics {
  totalSent: number;
  totalRecipients: number;
  sentPercentage: number;
  estimatedOpenRate: number;
  estimatedClickRate: number;
  sentCount: number;
}

export function useCampaignAnalytics(campaignId: string | null) {
  return useQuery<CampaignAnalytics>({
    queryKey: ['campaign_analytics', campaignId],
    enabled: !!campaignId,
    staleTime: 60000,
    refetchInterval: 30000,
    queryFn: async () => {
      if (!campaignId) throw new Error('Campaign ID required');

      const { data: campaign, error: campaignError } = await supabase
        .from('crm_campaigns')
        .select('status, started_at, completed_at')
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        throw new Error('Campaign not found');
      }

      const { data: run, error: runError } = await supabase
        .from('crm_campaign_runs')
        .select('total_recipients, sent_count, opened_count, clicked_count, completed_at')
        .eq('campaign_id', campaignId)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (runError) throw runError;

      const totalRecipients = run?.total_recipients ?? 0;
      const sentCount = run?.sent_count ?? 0;
      const openedCount = run?.opened_count ?? 0;
      const clickedCount = run?.clicked_count ?? 0;

      const sentPercentage = totalRecipients > 0 ? Math.round((sentCount / totalRecipients) * 100) : 0;
      const openRate = sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0;
      const clickRate = sentCount > 0 ? Math.round((clickedCount / sentCount) * 100) : 0;

      return {
        totalSent: sentCount,
        totalRecipients,
        sentPercentage,
        estimatedOpenRate: openRate,
        estimatedClickRate: clickRate,
        sentCount,
      };
    },
  });
}

export function useCampaignMetrics(campaignId: string | null) {
  const analytics = useCampaignAnalytics(campaignId);

  return {
    isLoading: analytics.isLoading,
    data: analytics.data,
    error: analytics.error,
  };
}

// ── Time-series ───────────────────────────────────────────────────────────────

export interface TimeSeriesBucket {
  bucket_start: string;   // ISO timestamp
  opens:        number;
  clicks:       number;
  bounces:      number;
  unsubscribes: number;
}

export function useCampaignTimeSeries(
  campaignId: string | null,
  bucket: 'hour' | 'day' = 'hour',
) {
  return useQuery<TimeSeriesBucket[]>({
    queryKey: ['campaign_timeseries', campaignId, bucket],
    enabled: !!campaignId,
    staleTime: 5 * 60_000,
    refetchInterval: 2 * 60_000,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase.rpc(
        'crm_campaign_events_timeseries',
        { p_campaign_id: campaignId, p_bucket: bucket },
      );
      if (error) throw error;
      return (data ?? []) as TimeSeriesBucket[];
    },
  });
}
