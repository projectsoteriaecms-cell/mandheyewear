import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PreferenceStat {
  category_id:        string;
  category_label:     string;
  sort_order:         number;
  opted_in_count:     number;
  opted_out_count:    number;
  total_eligible:     number;
  unsubscribed_total: number;
}

export interface ContactPreferenceRow {
  category_id: string;
  opted_in:    boolean;
  updated_at:  string;
}

// ── Preference stats (admin dashboard) ───────────────────────────────────────

export function useEmailPreferenceStats() {
  return useQuery({
    queryKey: ["crm_preference_stats"],
    queryFn: async (): Promise<PreferenceStat[]> => {
      const { data, error } = await supabase.rpc("crm_get_preference_stats");
      if (error) throw error;
      return (data ?? []) as PreferenceStat[];
    },
    staleTime: 5 * 60_000,
  });
}

// ── Per-contact preferences (admin contact view) ──────────────────────────────

export function useContactPreferences(email: string | undefined) {
  return useQuery({
    queryKey: ["crm_contact_prefs", email],
    enabled: !!email,
    queryFn: async (): Promise<ContactPreferenceRow[]> => {
      const { data, error } = await supabase
        .from("crm_email_preferences")
        .select("category_id, opted_in, updated_at")
        .eq("email", email!.toLowerCase().trim())
        .order("category_id");
      if (error) throw error;
      return (data ?? []) as ContactPreferenceRow[];
    },
    staleTime: 60_000,
  });
}

// ── Preference link (embed in campaign emails) ────────────────────────────────

const PREFERENCE_EF_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-preference-page`;

export function useContactPreferenceLink(email: string | undefined) {
  return useQuery({
    queryKey: ["crm_preference_link", email],
    enabled: !!email,
    queryFn: async (): Promise<string> => {
      const normalised = email!.toLowerCase().trim();
      const { data, error } = await supabase.rpc(
        "crm_ensure_preference_token",
        { p_email: normalised },
      );
      if (error) throw error;
      const token = data as string;
      return `${PREFERENCE_EF_URL}?e=${encodeURIComponent(normalised)}&t=${token}`;
    },
    staleTime: 30 * 60_000,
  });
}

// ── Token rotation ────────────────────────────────────────────────────────────

export function useRotatePreferenceToken() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (email: string): Promise<string> => {
      const { data, error } = await supabase.rpc("crm_rotate_preference_token", {
        p_email: email.toLowerCase().trim(),
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (_data, email) => {
      qc.invalidateQueries({ queryKey: ["crm_preference_link", email] });
    },
  });
}
