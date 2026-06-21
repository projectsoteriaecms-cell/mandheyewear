import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TriggerType =
  | "inactive_days"
  | "no_purchase_days"
  | "vto_no_convert_days"
  | "newsletter_no_engage_days";

export interface ReengagementTrigger {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  threshold_days: number;
  template_subject: string | null;
  is_active: boolean;
  last_run_at: string | null;
  last_contact_count: number;
  last_campaign_id: string | null;
  last_campaign_name: string | null;
  last_campaign_status: string | null;
  created_at: string;
}

export interface FireTriggerResult {
  campaign_id: string | null;
  contact_count: number;
}

const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  inactive_days:             "Inactive customers",
  no_purchase_days:          "No purchase",
  vto_no_convert_days:       "VTO non-converter",
  newsletter_no_engage_days: "Newsletter non-engager",
};

export function triggerTypeLabel(type: TriggerType): string {
  return TRIGGER_TYPE_LABELS[type] ?? type;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useReengagementTriggers() {
  return useQuery({
    queryKey: ["crm_reengagement_triggers"],
    queryFn: async (): Promise<ReengagementTrigger[]> => {
      const { data, error } = await supabase.rpc("crm_list_triggers");
      if (error) throw error;
      return (data ?? []) as ReengagementTrigger[];
    },
    staleTime: 60_000,
  });
}

export function useFireTrigger() {
  const qc = useQueryClient();

  const mutate = useMutation({
    mutationFn: async (triggerId: string): Promise<FireTriggerResult> => {
      const { data, error } = await supabase.rpc(
        "crm_fire_reengagement_trigger",
        { p_trigger_id: triggerId },
      );
      if (error) throw error;
      const row = (data as FireTriggerResult[] | null)?.[0];
      if (!row) throw new Error("No result returned from trigger function");
      return row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_reengagement_triggers"] });
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },
  });

  const fire = useCallback(
    (triggerId: string) => mutate.mutateAsync(triggerId),
    [mutate],
  );

  return {
    fire,
    isPending:  mutate.isPending,
    error:      mutate.error,
    lastResult: mutate.data ?? null,
    reset:      mutate.reset,
  };
}

export function useToggleTrigger() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => {
      const { error } = await supabase
        .from("crm_reengagement_triggers")
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_reengagement_triggers"] });
    },
  });
}

export function useUpdateTrigger() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<
        Pick<
          ReengagementTrigger,
          | "name"
          | "description"
          | "threshold_days"
          | "template_subject"
          | "is_active"
        >
      >;
    }) => {
      const { error } = await supabase
        .from("crm_reengagement_triggers")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_reengagement_triggers"] });
    },
  });
}
