import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UserJourneyEvent {
  event_type: string;
  event_data: Record<string, any>;
  created_at: string;
  days_ago: number;
}

export interface FeatureUsage {
  feature_name: string;
  event_count: number;
  unique_users: number;
  last_30_days_count: number;
}

export interface ProductAffinity {
  product_id: string;
  product_views: number;
  add_to_cart_count: number;
  purchase_count: number;
  view_to_cart_rate: number;
  cart_to_purchase_rate: number;
}

export interface FunnelStage {
  stage: string;
  unique_users: number;
  pct_of_previous: number;
}

export interface BehavioralSegment {
  segment_name: string;
  user_count: number;
  avg_ltv: number;
  engagement_score: number;
}

export interface AtRiskUser {
  email: string;
  full_name: string;
  last_engagement_date: string;
  days_since_engagement: number;
  lifetime_value: number;
}

export interface VtoConversionMetric {
  metric: string;
  value: number;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Get user's event journey (timeline) */
export function useUserJourney(email: string | null) {
  return useQuery({
    queryKey: ["user_journey", email],
    enabled: !!email,
    staleTime: 2 * 60_000,
    queryFn: async (): Promise<UserJourneyEvent[]> => {
      if (!email) return [];
      const { data, error } = await supabase.rpc("crm_get_user_journey" as any, {
        p_email: email,
      } as any);
      if (error) throw error;
      return (data ?? []) as unknown as UserJourneyEvent[];
    },
  });
}

/** Get feature usage (event type distribution) */
export function useFeatureUsage() {
  return useQuery({
    queryKey: ["feature_usage"],
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<FeatureUsage[]> => {
      const { data, error } = await supabase.rpc("crm_get_feature_usage" as any);
      if (error) throw error;
      return (data ?? []) as unknown as FeatureUsage[];
    },
  });
}

/** Get product affinity (which products convert) */
export function useProductAffinity() {
  return useQuery({
    queryKey: ["product_affinity"],
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<ProductAffinity[]> => {
      const { data, error } = await supabase.rpc("crm_get_product_affinity" as any);
      if (error) throw error;
      return (data ?? []) as unknown as ProductAffinity[];
    },
  });
}

/** Get funnel analysis (VTO → Product → Cart → Purchase) */
export function useFunnelAnalysis() {
  return useQuery({
    queryKey: ["funnel_analysis"],
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<FunnelStage[]> => {
      const { data, error } = await supabase.rpc("crm_get_funnel_analysis" as any);
      if (error) throw error;
      return (data ?? []) as unknown as FunnelStage[];
    },
  });
}

/** Get behavioral segments (high-intent, at-risk, etc) */
export function useBehavioralSegments() {
  return useQuery({
    queryKey: ["behavioral_segments"],
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<BehavioralSegment[]> => {
      const { data, error } = await supabase.rpc("crm_get_behavioral_segments" as any);
      if (error) throw error;
      return (data ?? []) as unknown as BehavioralSegment[];
    },
  });
}

/** Get at-risk users (inactive 30+ days) */
export function useAtRiskUsers(daysThreshold = 30) {
  return useQuery({
    queryKey: ["at_risk_users", daysThreshold],
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<AtRiskUser[]> => {
      const { data, error } = await supabase.rpc("crm_get_at_risk_users" as any, {
        p_days_threshold: daysThreshold,
      } as any);
      if (error) throw error;
      return (data ?? []) as unknown as AtRiskUser[];
    },
  });
}

/** Get VTO-specific conversion analysis */
export function useVtoConversionAnalysis() {
  return useQuery({
    queryKey: ["vto_conversion_analysis"],
    staleTime: 30 * 60_000,
    queryFn: async (): Promise<VtoConversionMetric[]> => {
      const { data, error } = await supabase.rpc(
        "crm_get_vto_conversion_analysis" as any
      );
      if (error) throw error;
      return (data ?? []) as unknown as VtoConversionMetric[];
    },
  });
}

/** Track a user event */
export function useTrackEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      email: string;
      event_type: string;
      event_data?: Record<string, any>;
      source?: string;
    }) => {
      const { error } = await supabase.rpc("crm_track_event" as any, {
        p_email: params.email,
        p_event_type: params.event_type,
        p_event_data: params.event_data ?? {},
        p_source: params.source ?? "web",
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate related queries
      qc.invalidateQueries({ queryKey: ["feature_usage"] });
      qc.invalidateQueries({ queryKey: ["product_affinity"] });
      qc.invalidateQueries({ queryKey: ["funnel_analysis"] });
      qc.invalidateQueries({ queryKey: ["behavioral_segments"] });
    },
    onError: (err) => {
      toast.error(`Failed to track event: ${(err as any).message}`);
    },
  });
}

/** Compute all behavioral segments (admin operation) */
export function useComputeBehavioralSegments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc(
        "crm_compute_behavioral_segments" as any
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Behavioral segments computed!");
      qc.invalidateQueries({ queryKey: ["behavioral_segments"] });
      qc.invalidateQueries({ queryKey: ["at_risk_users"] });
    },
    onError: (err) => {
      toast.error(`Failed to compute segments: ${(err as any).message}`);
    },
  });
}

/** Update segment for a single user (fast) */
export function useUpdateUserSegment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.rpc("crm_update_user_segment" as any, {
        p_email: email,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["behavioral_segments"] });
    },
    onError: (err) => {
      toast.error(`Failed to update segment: ${(err as any).message}`);
    },
  });
}
