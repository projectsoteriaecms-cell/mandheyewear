import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { classifySbError } from "@/lib/supabase-errors";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface WhatsAppChannelConfig {
  enabled:       boolean;
  body:          string | null;
  contentSid:    string | null;
  sentCount:     number;
  failedCount:   number;
  completedAt:   string | null;
  heartbeatAt:   string | null;
}

export interface WhatsAppTriggerResult {
  ok: boolean;
  sent?: number;
  failed?: number;
  campaign_id?: string;
  skipped?: boolean;
  whatsappDisabled?: boolean;
  globalKillActive?: boolean;
  message?: string;
  error?: string;
}

// ── useWhatsAppChannel — read config + live counters ───────────────────────────

export function useWhatsAppChannel(campaignId: string | null) {
  return useQuery({
    queryKey: ["crm_whatsapp_channel", campaignId],
    enabled:  !!campaignId,
    staleTime: 0,
    refetchInterval: (query) => {
      // Poll faster while a send appears to be in flight (no completion stamp yet
      // but a recent heartbeat).
      const d = query.state.data as WhatsAppChannelConfig | undefined;
      if (d?.enabled && !d.completedAt && d.heartbeatAt) return 3_000;
      return 30_000;
    },
    queryFn: async (): Promise<WhatsAppChannelConfig> => {
      const { data, error } = await supabase
        .from("crm_campaigns")
        .select(
          "whatsapp_enabled, whatsapp_body, whatsapp_content_sid, whatsapp_sent_count, whatsapp_failed_count, whatsapp_completed_at, whatsapp_heartbeat_at",
        )
        .eq("id", campaignId!)
        .single();
      if (error) throw error;
      return {
        enabled:     data.whatsapp_enabled       ?? false,
        body:        data.whatsapp_body          ?? null,
        contentSid:  data.whatsapp_content_sid   ?? null,
        sentCount:   data.whatsapp_sent_count    ?? 0,
        failedCount: data.whatsapp_failed_count  ?? 0,
        completedAt: data.whatsapp_completed_at  ?? null,
        heartbeatAt: data.whatsapp_heartbeat_at  ?? null,
      };
    },
  });
}

// ── useUpdateWhatsAppChannel — opt in/out + set body/template ───────────────────

export interface WhatsAppChannelUpdate {
  campaignId:  string;
  enabled?:    boolean;
  body?:       string | null;
  contentSid?: string | null;
}

export function useUpdateWhatsAppChannel() {
  const qc = useQueryClient();

  return useMutation<void, Error, WhatsAppChannelUpdate>({
    mutationFn: async ({ campaignId, enabled, body, contentSid }) => {
      const patch: Record<string, unknown> = {};
      if (enabled !== undefined)    patch.whatsapp_enabled     = enabled;
      if (body !== undefined)       patch.whatsapp_body        = body;
      if (contentSid !== undefined) patch.whatsapp_content_sid = contentSid;
      if (Object.keys(patch).length === 0) return;

      const { error } = await supabase
        .from("crm_campaigns")
        .update(patch)
        .eq("id", campaignId);
      if (error) throw error;
    },

    onSuccess: (_, { campaignId }) => {
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_channel", campaignId] });
      qc.invalidateQueries({ queryKey: ["campaign", campaignId] });
    },

    onError: (err) => {
      toast.error(classifySbError(err).detail);
    },
  });
}

// ── useTriggerWhatsAppSend — invoke the Edge Function ──────────────────────────

export function useTriggerWhatsAppSend() {
  const qc = useQueryClient();

  return useMutation<WhatsAppTriggerResult, Error, string>({
    mutationFn: async (campaignId: string) => {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-campaign-whatsapp`,
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
        throw new Error(body?.error ?? `WhatsApp send failed (${res.status})`);
      }
      return body as WhatsAppTriggerResult;
    },

    onSuccess: (result, campaignId) => {
      if (result.whatsappDisabled) {
        toast.warning(
          result.message ??
            "WhatsApp is enabled on this campaign, but Twilio isn't configured on the server.",
        );
      } else if (result.skipped) {
        toast.info(result.message ?? "WhatsApp channel is not enabled for this campaign.");
      } else if (result.ok) {
        toast.success(
          `WhatsApp sent — ${result.sent ?? 0} delivered` +
            (result.failed ? `, ${result.failed} failed.` : "."),
        );
      }
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_channel", campaignId] });
    },

    onError: (err) => {
      const classified = classifySbError(err);
      toast.error(classified.isTransient
        ? "Connection issue — please try again."
        : classified.detail,
      );
    },
  });
}
