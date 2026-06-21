import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CampaignPreview {
  totalCount: number;
  sampleEmails: string[];
  isLoading: boolean;
  isError: boolean;
  /** Refetch to get a fresh live count */
  refresh: () => void;
}

/**
 * T14: Live-data segment preview.
 *
 * Calls crm_preview_campaign_recipients() which evaluates segment rules
 * against the live crm_contacts VIEW — never the stale member_count cache.
 *
 * Use in the campaign editor to show "This campaign will reach N contacts"
 * before the admin clicks Send.
 *
 * @param campaignId  UUID of the campaign. Pass null to skip fetching.
 * @param sampleLimit Max sample emails to return for display (default 5).
 */
export function useCampaignPreview(
  campaignId: string | null,
  sampleLimit = 5,
): CampaignPreview {
  const query = useQuery({
    queryKey:  ["campaign_preview", campaignId, sampleLimit],
    enabled:   !!campaignId,
    staleTime: 30_000,   // 30 s — preview is fresh enough for editing
    queryFn:   async () => {
      const { data, error } = await supabase
        .rpc("crm_preview_campaign_recipients", {
          p_campaign_id:  campaignId!,
          p_sample_limit: sampleLimit,
        })
        .single();

      if (error) throw error;
      return data as { total_count: number; sample_emails: string[] | null };
    },
  });

  const row = query.data;

  return {
    totalCount:   row?.total_count   ?? 0,
    sampleEmails: row?.sample_emails ?? [],
    isLoading:    query.isLoading,
    isError:      query.isError,
    refresh:      query.refetch,
  };
}
