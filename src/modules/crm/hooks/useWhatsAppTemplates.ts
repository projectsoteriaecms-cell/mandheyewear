import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WhatsAppTemplate {
  id: string;
  name: string;
  description: string | null;
  twilio_content_sid: string;
  body_preview: string;
  variables: string[];
  cost_per_message: number;
  active: boolean;
  approval_state: "pending" | "approved" | "rejected";
  approval_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWhatsAppTemplateInput {
  name: string;
  description?: string;
  twilio_content_sid: string;
  body_preview: string;
  variables?: string[];
  cost_per_message?: number;
}

export interface UpdateWhatsAppTemplateInput {
  id: string;
  name?: string;
  description?: string;
  twilio_content_sid?: string;
  body_preview?: string;
  variables?: string[];
  cost_per_message?: number;
  active?: boolean;
}

// Get all active WhatsApp templates
export function useWhatsAppTemplates() {
  return useQuery({
    queryKey: ["crm_whatsapp_templates"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<WhatsAppTemplate[]> => {
      const { data, error } = await supabase
        .from("crm_whatsapp_templates")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as WhatsAppTemplate[];
    },
  });
}

// Get all WhatsApp templates (including inactive)
export function useAllWhatsAppTemplates() {
  return useQuery({
    queryKey: ["crm_whatsapp_templates_all"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<WhatsAppTemplate[]> => {
      const { data, error } = await supabase
        .from("crm_whatsapp_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as WhatsAppTemplate[];
    },
  });
}

// Create a new WhatsApp template
export function useCreateWhatsAppTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWhatsAppTemplateInput) => {
      const { data, error } = await supabase
        .from("crm_whatsapp_templates")
        .insert({
          name: input.name,
          description: input.description || null,
          twilio_content_sid: input.twilio_content_sid,
          body_preview: input.body_preview,
          variables: input.variables ?? [],
          cost_per_message: input.cost_per_message ?? 0.0039,
        })
        .select()
        .single();

      if (error) throw error;
      return data as WhatsAppTemplate;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates"] });
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates_all"] });
      toast.success("Template created");
    },

    onError: (err) => {
      toast.error(String(err));
    },
  });
}

// Update a WhatsApp template
export function useUpdateWhatsAppTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWhatsAppTemplateInput) => {
      const { id, ...updates } = input;
      const patch: Record<string, any> = {};

      if (updates.name !== undefined) patch.name = updates.name;
      if (updates.description !== undefined) patch.description = updates.description;
      if (updates.twilio_content_sid !== undefined) patch.twilio_content_sid = updates.twilio_content_sid;
      if (updates.body_preview !== undefined) patch.body_preview = updates.body_preview;
      if (updates.variables !== undefined) patch.variables = updates.variables;
      if (updates.cost_per_message !== undefined) patch.cost_per_message = updates.cost_per_message;
      if (updates.active !== undefined) patch.active = updates.active;

      if (Object.keys(patch).length === 0) return;

      const { error } = await supabase
        .from("crm_whatsapp_templates")
        .update(patch)
        .eq("id", id);

      if (error) throw error;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates"] });
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates_all"] });
      toast.success("Template updated");
    },

    onError: (err) => {
      toast.error(String(err));
    },
  });
}

// Deactivate a template (soft delete)
export function useDeactivateWhatsAppTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from("crm_whatsapp_templates")
        .update({ active: false })
        .eq("id", templateId);

      if (error) throw error;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates"] });
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates_all"] });
      toast.success("Template deactivated");
    },

    onError: (err) => {
      toast.error(String(err));
    },
  });
}

// Approve a template
export function useApproveWhatsAppTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, notes }: { templateId: string; notes?: string }) => {
      const { error } = await supabase.rpc("crm_approve_whatsapp_template", {
        p_template_id: templateId,
        p_notes: notes || null,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates"] });
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates_all"] });
      toast.success("Template approved");
    },

    onError: (err) => {
      toast.error(String(err));
    },
  });
}

// Reject a template
export function useRejectWhatsAppTemplate() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, notes }: { templateId: string; notes?: string }) => {
      const { error } = await supabase.rpc("crm_reject_whatsapp_template", {
        p_template_id: templateId,
        p_notes: notes || null,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates"] });
      qc.invalidateQueries({ queryKey: ["crm_whatsapp_templates_all"] });
      toast.success("Template rejected");
    },

    onError: (err) => {
      toast.error(String(err));
    },
  });
}
