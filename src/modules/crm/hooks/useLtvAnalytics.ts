import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LtvSummary {
  total_contacts:    number;
  converted_count:   number;
  conversion_rate:   number;
  total_revenue:     number;
  avg_ltv_converted: number;
  median_ltv:        number;
  p90_ltv:           number;
}

export interface LtvChannelRow {
  channel:          string;
  contact_count:    number;
  converted_count:  number;
  conversion_rate:  number;
  avg_ltv:          number;
  total_revenue:    number;
}

export interface RevenueMonthRow {
  month:         string;  // YYYY-MM-DD
  revenue:       number;
  order_count:   number;
  new_customers: number;
}

export interface CohortGridRow {
  cohort_month:  string;  // YYYY-MM-DD
  months_after:  number;
  cohort_size:   number;
  active_count:  number;
  retention_pct: number;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function useLtvSummary() {
  return useQuery({
    queryKey: ["crm_ltv_summary"],
    queryFn: async (): Promise<LtvSummary | null> => {
      const { data, error } = await supabase.rpc("crm_ltv_summary");
      if (error) throw error;
      return ((data as LtvSummary[] | null)?.[0]) ?? null;
    },
    staleTime: 5 * 60_000,
  });
}

export function useLtvByChannel() {
  return useQuery({
    queryKey: ["crm_ltv_by_channel"],
    queryFn: async (): Promise<LtvChannelRow[]> => {
      const { data, error } = await supabase.rpc("crm_ltv_by_channel");
      if (error) throw error;
      return (data ?? []) as LtvChannelRow[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useMonthlyRevenueTrend(months = 12) {
  return useQuery({
    queryKey: ["crm_monthly_revenue_trend", months],
    queryFn: async (): Promise<RevenueMonthRow[]> => {
      const { data, error } = await supabase.rpc(
        "crm_monthly_revenue_trend",
        { p_months: months },
      );
      if (error) throw error;
      return (data ?? []) as RevenueMonthRow[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useCohortGrid(months = 6) {
  return useQuery({
    queryKey: ["crm_cohort_grid", months],
    queryFn: async (): Promise<CohortGridRow[]> => {
      const { data, error } = await supabase.rpc("crm_cohort_grid", {
        p_months: months,
      });
      if (error) throw error;
      return (data ?? []) as CohortGridRow[];
    },
    staleTime: 10 * 60_000,
  });
}
