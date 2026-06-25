import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDuplicateCampaign() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // Fetch the original campaign
      const { data: original, error: fetchError } = await supabase
        .from("crm_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (fetchError || !original) throw new Error("Campaign not found");

      // Create a copy
      const { data: duplicate, error: insertError } = await supabase
        .from("crm_campaigns")
        .insert({
          name: `${original.name} (Copy)`,
          subject_line: original.subject_line,
          segment_id: original.segment_id,
          template_id: original.template_id,
          status: "draft",
        })
        .select()
        .single();

      if (insertError || !duplicate) throw new Error("Failed to duplicate campaign");

      return duplicate;
    },

    onSuccess: () => {
      toast.success("Campaign duplicated successfully!");
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to duplicate campaign";
      toast.error(message);
    },
  });
}

export function useArchiveCampaigns() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .update({ is_archived: true })
        .in("id", campaignIds);

      if (error) throw error;
    },

    onSuccess: (_, campaignIds) => {
      toast.success(`${campaignIds.length} campaign(s) archived`);
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to archive campaigns";
      toast.error(message);
    },
  });
}

export function useUnarchiveCampaigns() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .update({ is_archived: false })
        .in("id", campaignIds);

      if (error) throw error;
    },

    onSuccess: (_, campaignIds) => {
      toast.success(`${campaignIds.length} campaign(s) restored`);
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to restore campaigns";
      toast.error(message);
    },
  });
}

export function useDeleteCampaignsBulk() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .delete()
        .in("id", campaignIds);

      if (error) throw error;
    },

    onSuccess: (_, campaignIds) => {
      toast.success(`${campaignIds.length} campaign(s) deleted`);
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },

    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to delete campaigns";
      toast.error(message);
    },
  });
}
