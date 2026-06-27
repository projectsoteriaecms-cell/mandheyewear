import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AbStats {
  ok:           boolean;
  reason?:      string;
  ab_winner:    'a' | 'b' | null;
  sent_a:       number;
  sent_b:       number;
  opens_a:      number;
  opens_b:      number;
  open_rate_a:  number;
  open_rate_b:  number;
}

export function useAbStats(campaignId: string | null) {
  return useQuery<AbStats>({
    queryKey: ["ab_stats", campaignId],
    enabled: !!campaignId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("crm_get_ab_stats", {
        p_campaign_id: campaignId!,
      });
      if (error) throw error;
      return data as unknown as AbStats;
    },
  });
}

export function useResolveAbWinner() {
  const qc = useQueryClient();

  return useMutation<AbStats, Error, string>({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase.rpc("crm_resolve_ab_winner", {
        p_campaign_id: campaignId,
      });
      if (error) throw error;
      return data as unknown as AbStats;
    },
    onSuccess: (result, campaignId) => {
      if (result.ab_winner) {
        toast.success(`Winner resolved: Subject ${result.ab_winner.toUpperCase()} (${result.ab_winner === 'a' ? result.open_rate_a : result.open_rate_b}% open rate)`);
      } else {
        toast.info("No data yet — send some emails first.");
      }
      qc.invalidateQueries({ queryKey: ["ab_stats", campaignId] });
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
      qc.invalidateQueries({ queryKey: ["crm_campaign", campaignId] });
    },
    onError: (err) => {
      toast.error(err.message ?? "Failed to resolve winner");
    },
  });
}
