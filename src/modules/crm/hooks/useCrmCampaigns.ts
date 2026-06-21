import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { classifySbError } from "@/lib/supabase-errors";
import { toast } from "sonner";
import type { CampaignStatus } from "./useCampaignSend";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CrmCampaign {
  id:            string;
  name:          string;
  subject_line:  string | null;
  preview_text:  string | null;
  template_id:   string | null;
  segment_id:    string | null;
  segment_name:  string | null;
  status:        CampaignStatus;
  scheduled_at:  string | null;
  started_at:    string | null;
  completed_at:  string | null;
  created_at:    string;
  updated_at:    string;
}

export interface CampaignInput {
  name:         string;
  subject_line?: string | null;
  preview_text?: string | null;
  template_id?:  string | null;
  segment_id:    string;
}

// ── useCrmCampaigns — list (with segment name) ─────────────────────────────────

export function useCrmCampaigns() {
  return useQuery({
    queryKey: ["crm_campaigns"],
    staleTime: 30_000,
    refetchInterval: (query) => {
      // Poll while any campaign is mid-send so status chips stay live.
      const rows = query.state.data as CrmCampaign[] | undefined;
      return rows?.some((c) => c.status === "running") ? 5_000 : 30_000;
    },
    queryFn: async (): Promise<CrmCampaign[]> => {
      const { data, error } = await supabase
        .from("crm_campaigns")
        .select(
          "id, name, subject_line, preview_text, template_id, segment_id, status, scheduled_at, started_at, completed_at, created_at, updated_at, crm_segments(name)",
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id:           row.id,
        name:         row.name,
        subject_line: row.subject_line,
        preview_text: row.preview_text,
        template_id:  row.template_id,
        segment_id:   row.segment_id,
        segment_name: row.crm_segments?.name ?? null,
        status:       row.status,
        scheduled_at: row.scheduled_at,
        started_at:   row.started_at,
        completed_at: row.completed_at,
        created_at:   row.created_at,
        updated_at:   row.updated_at,
      })) as unknown as CrmCampaign[];
    },
  });
}

// ── useCreateCampaign ───────────────────────────────────────────────────────────

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation<CrmCampaign, Error, CampaignInput>({
    mutationFn: async (input) => {
      const { data, error } = await supabase
        .from("crm_campaigns")
        .insert({
          name:         input.name,
          subject_line: input.subject_line ?? null,
          preview_text: input.preview_text ?? null,
          template_id:  input.template_id ?? null,
          segment_id:   input.segment_id,
          status:       "draft",
        })
        .select()
        .single();
      if (error) throw error;
      return data as unknown as CrmCampaign;
    },
    onSuccess: () => {
      toast.success("Campaign created as draft.");
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },
    onError: (err) => toast.error(classifySbError(err).detail),
  });
}

// ── useUpdateCampaign (draft only — guarded by status in UI) ────────────────────

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string } & Partial<CampaignInput>>({
    mutationFn: async ({ id, ...patch }) => {
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined)         update.name = patch.name;
      if (patch.subject_line !== undefined) update.subject_line = patch.subject_line;
      if (patch.preview_text !== undefined) update.preview_text = patch.preview_text;
      if (patch.template_id !== undefined)  update.template_id = patch.template_id;
      if (patch.segment_id !== undefined)   update.segment_id = patch.segment_id;

      // Only editable while still a draft — prevents editing a sent campaign.
      const { error } = await supabase
        .from("crm_campaigns")
        .update(update)
        .eq("id", id)
        .eq("status", "draft");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Campaign updated.");
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },
    onError: (err) => toast.error(classifySbError(err).detail),
  });
}

// ── useDeleteCampaign (draft only) ──────────────────────────────────────────────

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from("crm_campaigns")
        .delete()
        .eq("id", id)
        .eq("status", "draft");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Draft campaign deleted.");
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },
    onError: (err) => toast.error(classifySbError(err).detail),
  });
}
