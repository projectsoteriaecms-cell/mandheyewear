import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CampaignStatus } from "./useCampaignSend";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface EmailBlock {
  id:   string;
  type: 'hero' | 'text' | 'button' | 'divider' | 'spacer' | 'columns2';
  data: Record<string, string>;
}

export interface CrmCampaign {
  id:               string;
  name:             string;
  subject_line:     string | null;
  subject_line_b:   string | null;
  ab_enabled:       boolean;
  preview_text:     string | null;
  template_id:      string | null;
  segment_id:       string | null;
  segment_name:     string | null;
  status:           CampaignStatus;
  is_archived:      boolean;
  body_blocks:      EmailBlock[];
  body_html:        string | null;
  scheduled_at:     string | null;
  started_at:       string | null;
  completed_at:     string | null;
  created_at:       string;
  updated_at:       string;
}

export interface CampaignInput {
  name:            string;
  subject_line?:   string | null;
  subject_line_b?: string | null;
  ab_enabled?:     boolean;
  preview_text?:   string | null;
  template_id?:    string | null;
  segment_id:      string;
  body_blocks?:    EmailBlock[];
  body_html?:      string | null;
}

// ── useGetCampaign — single campaign by id ────────────────────────────────────

export function useGetCampaign(id: string | null) {
  return useQuery({
    queryKey: ["crm_campaign", id],
    enabled: !!id,
    staleTime: 15_000,
    queryFn: async (): Promise<CrmCampaign> => {
      const { data, error } = await supabase
        .from("crm_campaigns")
        .select(
          "id, name, subject_line, subject_line_b, ab_enabled, preview_text, template_id, segment_id, status, is_archived, body_blocks, body_html, scheduled_at, started_at, completed_at, created_at, updated_at, crm_segments(name)",
        )
        .eq("id", id!)
        .single();
      if (error) throw error;
      const row = data as any;
      return {
        id:             row.id,
        name:           row.name,
        subject_line:   row.subject_line,
        subject_line_b: row.subject_line_b,
        ab_enabled:     row.ab_enabled ?? false,
        preview_text:   row.preview_text,
        template_id:    row.template_id,
        segment_id:     row.segment_id,
        segment_name:   row.crm_segments?.name ?? null,
        status:         row.status,
        is_archived:    row.is_archived ?? false,
        body_blocks:    row.body_blocks ?? [],
        body_html:      row.body_html,
        scheduled_at:   row.scheduled_at,
        started_at:     row.started_at,
        completed_at:   row.completed_at,
        created_at:     row.created_at,
        updated_at:     row.updated_at,
      } as CrmCampaign;
    },
  });
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
          "id, name, subject_line, subject_line_b, ab_enabled, preview_text, template_id, segment_id, status, is_archived, body_blocks, body_html, scheduled_at, started_at, completed_at, created_at, updated_at, crm_segments(name)",
        )
        .order("updated_at", { ascending: false });
      if (error) throw error;

      return (data ?? []).map((row: any) => ({
        id:             row.id,
        name:           row.name,
        subject_line:   row.subject_line,
        subject_line_b: row.subject_line_b,
        ab_enabled:     row.ab_enabled ?? false,
        preview_text:   row.preview_text,
        template_id:    row.template_id,
        segment_id:     row.segment_id,
        segment_name:   row.crm_segments?.name ?? null,
        status:         row.status,
        is_archived:    row.is_archived ?? false,
        body_blocks:    row.body_blocks ?? [],
        body_html:      row.body_html,
        scheduled_at:   row.scheduled_at,
        started_at:     row.started_at,
        completed_at:   row.completed_at,
        created_at:     row.created_at,
        updated_at:     row.updated_at,
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
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to create campaign"),
  });
}

// ── useUpdateCampaign (draft only — guarded by status in UI) ────────────────────

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string } & Partial<CampaignInput>>({
    mutationFn: async ({ id, ...patch }) => {
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.name !== undefined)            update.name = patch.name;
      if (patch.subject_line !== undefined)    update.subject_line = patch.subject_line;
      if (patch.subject_line_b !== undefined)  update.subject_line_b = patch.subject_line_b;
      if (patch.ab_enabled !== undefined)      update.ab_enabled = patch.ab_enabled;
      if (patch.preview_text !== undefined)    update.preview_text = patch.preview_text;
      if (patch.template_id !== undefined)     update.template_id = patch.template_id;
      if (patch.segment_id !== undefined)      update.segment_id = patch.segment_id;
      if (patch.body_blocks !== undefined)     update.body_blocks = patch.body_blocks;
      if (patch.body_html !== undefined)       update.body_html = patch.body_html;

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
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update campaign"),
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
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to delete campaign"),
  });
}

// ── useTestSendCampaign ────────────────────────────────────────────────────────

export interface TestSendOptions {
  campaignId: string;
  testEmail: string;
  sendNow: boolean;
  scheduledAt?: string;
}

export function useTestSendCampaign() {
  const qc = useQueryClient();
  return useMutation<void, Error, TestSendOptions>({
    mutationFn: async ({ campaignId, testEmail, sendNow, scheduledAt }) => {
      if (sendNow) {
        // Send immediately via Edge Function
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-test-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              campaign_id: campaignId,
              test_email: testEmail,
            }),
          }
        );

        const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

        if (!res.ok) {
          throw new Error(body?.error ?? `Failed to send test email (${res.status})`);
        }
      } else {
        // Schedule for later
        if (!scheduledAt) throw new Error("Scheduled time is required");

        const { error } = await supabase
          .from("campaign_test_queue")
          .insert({
            campaign_id: campaignId,
            test_email: testEmail,
            scheduled_at: scheduledAt,
            created_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: (_, { testEmail, sendNow }) => {
      if (sendNow) {
        toast.success(`Test email sent to ${testEmail}`);
      } else {
        toast.success(`Test email scheduled to ${testEmail}`);
      }
      qc.invalidateQueries({ queryKey: ["crm_campaigns"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to send test email"),
  });
}
