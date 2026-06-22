import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ──────────────────────────────────────────────────────────────────

export interface ConsentAuditEntry {
  id: string;
  email: string;
  consent_type: "marketing" | "newsletter";
  old_value: boolean | null;
  new_value: boolean;
  reason: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface SuppressionAuditEntry {
  id: string;
  email: string;
  suppressed_type: "email" | "sms" | "all";
  reason: string;
  source: string | null;
  suppressed_at: string;
  auto_unsuppress_at: string | null;
}

export interface CampaignSendAuditEntry {
  id: string;
  campaign_id: string;
  recipient_email: string;
  subject_line: string | null;
  had_marketing_consent: boolean;
  sent_at: string;
  opened_at: string | null;
  bounced_at: string | null;
}

export interface ContactAccessLogEntry {
  id: string;
  email: string;
  action: "view" | "export" | "edit" | "delete";
  reason: string | null;
  accessed_at: string;
}

export interface GdprExportData {
  success: boolean;
  exported_at: string;
  contact_data: {
    email: string;
    full_name: string | null;
    phone: string | null;
    lifetime_value: number;
    [key: string]: any;
  };
  consent_history: any[];
  suppression_history: any[];
  campaign_sends: any[];
  access_logs: any[];
}

// ── useConsentHistory — fetch consent changes for a contact ────────────────

export function useConsentHistory(email?: string) {
  return useQuery({
    queryKey: ["consent_audit_log", email],
    enabled: !!email,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ConsentAuditEntry[]> => {
      if (!email) return [];

      const { data, error } = await supabase
        .from("consent_audit_log")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ConsentAuditEntry[];
    },
  });
}

// ── useSuppressionHistory — fetch opt-outs for a contact ───────────────────

export function useSuppressionHistory(email?: string) {
  return useQuery({
    queryKey: ["suppression_audit_log", email],
    enabled: !!email,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<SuppressionAuditEntry[]> => {
      if (!email) return [];

      const { data, error } = await supabase
        .from("suppression_audit_log")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .order("suppressed_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as SuppressionAuditEntry[];
    },
  });
}

// ── useCampaignSendHistory — fetch sends to a contact ─────────────────────

export function useCampaignSendHistory(email?: string) {
  return useQuery({
    queryKey: ["campaign_send_audit", email],
    enabled: !!email,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<CampaignSendAuditEntry[]> => {
      if (!email) return [];

      const { data, error } = await supabase
        .from("campaign_send_audit")
        .select("*")
        .eq("recipient_email", email.toLowerCase().trim())
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CampaignSendAuditEntry[];
    },
  });
}

// ── useAccessLog — fetch who accessed this contact's data ──────────────────

export function useAccessLog(email?: string) {
  return useQuery({
    queryKey: ["contact_data_access_log", email],
    enabled: !!email,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<ContactAccessLogEntry[]> => {
      if (!email) return [];

      const { data, error } = await supabase
        .from("contact_data_access_log")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .order("accessed_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ContactAccessLogEntry[];
    },
  });
}

// ── useLogConsentChange — log a consent change ───────────────────────────

export function useLogConsentChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      consentType,
      newValue,
      reason,
    }: {
      email: string;
      consentType: "marketing" | "newsletter";
      newValue: boolean;
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc("crm_log_consent_change", {
        p_email: email,
        p_consent_type: consentType,
        p_new_value: newValue,
        p_reason: reason || null,
      });

      if (error) throw error;
      return data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["consent_audit_log", variables.email] });
    },
  });
}

// ── useSuppressEmail — suppress an email address ────────────────────────

export function useSuppressEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      reason,
      autoUnsuppressDays,
    }: {
      email: string;
      reason?: string;
      autoUnsuppressDays?: number;
    }) => {
      const { data, error } = await supabase.rpc("crm_suppress_email", {
        p_email: email,
        p_reason: reason || "user_request",
        p_auto_unsuppress_days: autoUnsuppressDays || 180,
      });

      if (error) throw error;
      return data;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["suppression_audit_log", variables.email] });
      queryClient.invalidateQueries({ queryKey: ["crm_contacts"] });
    },
  });
}

// ── useGdprExport — export all personal data for a contact ────────────────

export function useGdprExport() {
  return useMutation({
    mutationFn: async (email: string): Promise<GdprExportData> => {
      const { data, error } = await supabase.rpc("gdpr_export_contact_data", {
        p_email: email,
      });

      if (error) throw error;
      return data as GdprExportData;
    },
  });
}

// ── useGdprDelete — right to be forgotten ────────────────────────────────

export function useGdprDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc("gdpr_delete_contact", {
        p_email: email,
      });

      if (error) throw error;
      return data;
    },

    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: ["crm_contacts"] });
      queryClient.invalidateQueries({ queryKey: ["consent_audit_log", email] });
      queryClient.invalidateQueries({ queryKey: ["suppression_audit_log", email] });
    },
  });
}
