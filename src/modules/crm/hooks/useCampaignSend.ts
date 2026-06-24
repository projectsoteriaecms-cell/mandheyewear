import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "completed";

export interface CampaignSendProgress {
  /** Current campaign status from crm_campaigns */
  status: CampaignStatus | null;
  /** Latest run row (null if no run started yet) */
  runId: string | null;
  sentCount: number;
  totalRecipients: number;
  /** 0–100 */
  percentDone: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  isLoading: boolean;
}

export interface TriggerResult {
  ok: boolean;
  sent?: number;
  campaign_id?: string;
  run_id?: string;
  circuitOpen?: boolean;
  message?: string;
  error?: string;
}

// ── useTriggerCampaignSend ────────────────────────────────────────────────────

export interface CampaignSendOptions {
  campaignId: string;
  sendNow: boolean;
  scheduledAt?: string;
}

/**
 * Triggers the send-campaign-batch Edge Function for a specific campaign.
 * Supports both immediate send and scheduled send.
 *
 * On success: invalidates the campaign query so status updates immediately.
 * On circuit-open: shows a specific toast rather than a generic error.
 */
export function useTriggerCampaignSend() {
  const qc = useQueryClient();

  return useMutation<TriggerResult, Error, CampaignSendOptions>({
    mutationFn: async ({ campaignId, sendNow, scheduledAt }) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (sendNow) {
        // Send immediately
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-campaign-batch`,
          {
            method: "POST",
            headers: {
              "Content-Type":  "application/json",
              "Authorization": `Bearer ${token}`,
              "apikey":        import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ campaign_id: campaignId }),
          },
        );

        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

        if (!res.ok) {
          throw new Error(body?.error ?? `Campaign send failed (${res.status})`);
        }

        return body as TriggerResult;
      } else {
        // Schedule for later
        if (!scheduledAt) throw new Error("Scheduled time is required");

        const { error } = await supabase
          .from("crm_campaigns")
          .update({ scheduled_at: scheduledAt, status: "scheduled" })
          .eq("id", campaignId)
          .eq("status", "draft");

        if (error) throw error;

        return { ok: true, sent: 0, campaign_id: campaignId };
      }
    },

    onSuccess: (result, { campaignId, sendNow }) => {
      if (sendNow) {
        if (result.circuitOpen) {
          toast.warning(
            result.message ??
              "Email delivery is temporarily paused. Campaign will resume automatically in 30 minutes.",
          );
        } else if (result.ok) {
          toast.success(
            `Campaign sent — ${result.sent ?? 0} emails delivered.`,
          );
        }
      } else {
        toast.success("Campaign scheduled successfully.");
      }
      // Refresh campaign status + run data
      qc.invalidateQueries({ queryKey: ["campaign", campaignId] });
      qc.invalidateQueries({ queryKey: ["campaign_run", campaignId] });
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to send campaign";
      toast.error(message);
    },
  });
}

// ── useCampaignSendStatus ─────────────────────────────────────────────────────

/**
 * Polls the campaign status + latest run metrics.
 * Refetch interval: 3 s while running, 30 s otherwise.
 */
export function useCampaignSendStatus(
  campaignId: string | null,
): CampaignSendProgress {
  // Campaign status
  const campaignQ = useQuery({
    queryKey:  ["campaign", campaignId],
    enabled:   !!campaignId,
    staleTime: 0,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status as CampaignStatus | undefined;
      return status === "running" ? 3_000 : 30_000;
    },
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_campaigns")
        .select("id, status, started_at, completed_at")
        .eq("id", campaignId!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Latest run for this campaign
  const runQ = useQuery({
    queryKey:  ["campaign_run", campaignId],
    enabled:   !!campaignId,
    staleTime: 0,
    refetchInterval: (query) => {
      const completed = !!(query.state.data as any)?.completed_at;
      return completed ? 30_000 : 3_000;
    },
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crm_campaign_runs")
        .select("id, total_recipients, sent_count, started_at, completed_at, error_message")
        .eq("campaign_id", campaignId!)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const campaign = campaignQ.data as any;
  const run      = runQ.data      as any;

  const sent  = run?.sent_count       ?? 0;
  const total = run?.total_recipients ?? 0;

  return {
    status:          campaign?.status        ?? null,
    runId:           run?.id                 ?? null,
    sentCount:       sent,
    totalRecipients: total,
    percentDone:     total > 0 ? Math.round((sent / total) * 100) : 0,
    startedAt:       run?.started_at         ?? null,
    completedAt:     run?.completed_at       ?? null,
    errorMessage:    run?.error_message      ?? null,
    isLoading:       campaignQ.isLoading || runQ.isLoading,
  };
}

// ── useScheduleCampaign ───────────────────────────────────────────────────────

/**
 * Sets a campaign's status to 'scheduled' (queued for background processing).
 * The send-campaign-batch EF will pick it up on next invocation.
 */
export function useScheduleCampaign() {
  const qc = useQueryClient();

  return useMutation<void, Error, { campaignId: string; scheduledAt?: string }>({
    mutationFn: async ({ campaignId, scheduledAt }) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .update({
          status:       "scheduled",
          scheduled_at: scheduledAt ?? new Date().toISOString(),
        })
        .eq("id", campaignId)
        .eq("status", "draft"); // only draft → scheduled

      if (error) throw error;
    },

    onSuccess: (_, { campaignId }) => {
      toast.success("Campaign scheduled.");
      qc.invalidateQueries({ queryKey: ["campaign", campaignId] });
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed");
    },
  });
}
