import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendQuotaStatus {
  todayDate:   string;
  todaySent:   number;
  quotaLimit:  number;
  warmupDay:   number;
  pctUsed:     number;
  globalKill:  boolean;
  isLoading:   boolean;
  isError:     boolean;
}

// ── useSendQuotaStatus ────────────────────────────────────────────────────────

/**
 * T15: Returns today's send quota status + warm-up day number.
 * Refreshes every 60 s so the admin dashboard stays current.
 */
export function useSendQuotaStatus(): SendQuotaStatus {
  const query = useQuery({
    queryKey:        ["crm_send_quota_status"],
    staleTime:       60_000,
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc("crm_get_send_quota_status")
        .single();
      if (error) throw error;
      return data as {
        today_date:  string;
        today_sent:  number;
        quota_limit: number;
        warmup_day:  number;
        pct_used:    number;
        global_kill: boolean;
      };
    },
  });

  const row = query.data;
  return {
    todayDate:  row?.today_date  ?? new Date().toISOString().slice(0, 10),
    todaySent:  row?.today_sent  ?? 0,
    quotaLimit: row?.quota_limit ?? 50,
    warmupDay:  row?.warmup_day  ?? 1,
    pctUsed:    Number(row?.pct_used ?? 0),
    globalKill: row?.global_kill ?? false,
    isLoading:  query.isLoading,
    isError:    query.isError,
  };
}

// ── usePauseCampaign ──────────────────────────────────────────────────────────

/**
 * T15: Per-campaign kill switch — sets campaign status to 'paused'.
 * The send-campaign-batch EF checks status before every batch and aborts.
 */
export function usePauseCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .update({ status: "paused" })
        .eq("id", campaignId)
        .in("status", ["running", "scheduled"]);
      if (error) throw error;
    },
    onSuccess: (_data, campaignId) => {
      toast.warning("Campaign paused — in-flight batch may complete before stopping.");
      qc.invalidateQueries({ queryKey: ["campaign_send_status", campaignId] });
      qc.invalidateQueries({ queryKey: ["campaign", campaignId] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to pause: ${err.message}`);
    },
  });
}

// ── useResumeCampaign ─────────────────────────────────────────────────────────

/**
 * T15: Resumes a paused campaign by setting status back to 'scheduled'.
 * The next send-campaign-batch invocation will pick it up via heartbeat recovery.
 */
export function useResumeCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .update({ status: "scheduled" })
        .eq("id", campaignId)
        .eq("status", "paused");
      if (error) throw error;
    },
    onSuccess: (_data, campaignId) => {
      toast.success("Campaign rescheduled — will resume on next send cycle.");
      qc.invalidateQueries({ queryKey: ["campaign_send_status", campaignId] });
      qc.invalidateQueries({ queryKey: ["campaign", campaignId] });
    },
    onError: (err: Error) => {
      toast.error(`Failed to resume: ${err.message}`);
    },
  });
}

// ── useGlobalKillSwitch ───────────────────────────────────────────────────────

/**
 * T15: Emergency stop — flips the global CRM bulk-send kill switch.
 * Requires super_admin role (enforced by crm_set_global_kill_switch SECURITY DEFINER).
 *
 * @param active true = halt ALL bulk sends, false = re-enable
 */
export function useGlobalKillSwitch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (active: boolean) => {
      const { error } = await supabase
        .rpc("crm_set_global_kill_switch", { p_active: active });
      if (error) throw error;
      return active;
    },
    onSuccess: (active) => {
      if (active) {
        toast.error("Global kill switch ACTIVATED — all bulk sends halted.");
      } else {
        toast.success("Global kill switch deactivated — bulk sends re-enabled.");
      }
      qc.invalidateQueries({ queryKey: ["crm_send_quota_status"] });
    },
    onError: (err: Error) => {
      toast.error(`Kill switch failed: ${err.message}`);
    },
  });
}
