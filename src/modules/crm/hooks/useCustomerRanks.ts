import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerRank {
  id: string;
  email: string;
  current_rank: number;
  rank_label: string;
  engagement_score: number;
  last_engagement_at: string | null;
  is_dormant: boolean;
  promoted_at: string | null;
  demoted_at: string | null;
  reason: string | null;
  computed_at: string;
  updated_at: string;
}

export interface RankHistoryEntry {
  id: string;
  email: string;
  old_rank: number | null;
  new_rank: number;
  reason: string | null;
  engagement_score: number | null;
  lifetime_value: number | null;
  try_on_count: number | null;
  order_count: number | null;
  changed_at: string;
}

export const RANK_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Lead", color: "text-gray-600 bg-gray-50 dark:bg-gray-900/20" },
  2: { label: "Subscriber", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
  3: { label: "Registered", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
  4: { label: "Customer", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
  5: { label: "VIP", color: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20" },
};

// ── useCustomerRank — fetch rank for a single customer ──────────────────

export function useCustomerRank(email?: string) {
  return useQuery({
    queryKey: ["crm_customer_rank", email],
    enabled: !!email,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<CustomerRank | null> => {
      if (!email) return null;

      const { data, error } = await supabase
        .from("crm_customer_ranks")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .single();

      if (error?.code === "PGRST116") return null; // Not found
      if (error) throw error;

      return data as CustomerRank;
    },
  });
}

// ── useCustomerRanks — fetch paginated rank list ──────────────────────────

export interface UseCustomerRanksParams {
  page?: number;
  pageSize?: number;
  sortBy?: "rank" | "engagement" | "updated";
  sortDir?: "asc" | "desc";
}

export function useCustomerRanks({
  page = 0,
  pageSize = 25,
  sortBy = "rank",
  sortDir = "desc",
}: UseCustomerRanksParams = {}) {
  return useQuery({
    queryKey: ["crm_customer_ranks", { page, pageSize, sortBy, sortDir }],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      let q = supabase
        .from("crm_customer_ranks")
        .select("*", { count: "exact" });

      // Sort
      const sortColumn = {
        rank: "current_rank",
        engagement: "engagement_score",
        updated: "updated_at",
      }[sortBy];

      q = q.order(sortColumn, { ascending: sortDir === "asc" });

      // Paginate
      const from = page * pageSize;
      const to = from + pageSize - 1;
      q = q.range(from, to);

      const { data, error, count } = await q;
      if (error) throw error;

      return {
        rows: (data ?? []) as CustomerRank[],
        total: count ?? 0,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
      };
    },
  });
}

// ── useRankHistory — fetch rank changes for a contact ──────────────────────

export function useRankHistory(email?: string) {
  return useQuery({
    queryKey: ["crm_rank_history", email],
    enabled: !!email,
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<RankHistoryEntry[]> => {
      if (!email) return [];

      const { data, error } = await supabase
        .from("crm_rank_history")
        .select("*")
        .eq("email", email.toLowerCase().trim())
        .order("changed_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as RankHistoryEntry[];
    },
  });
}

// ── useComputeAllRanks — trigger bulk rank computation ──────────────────────

export function useComputeAllRanks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{ success: boolean; message: string; count_updated: number; count_changed: number }> => {
      const { data, error } = await supabase.rpc("crm_compute_customer_ranks");
      if (error) throw error;
      return data as any;
    },

    onSuccess: () => {
      // Invalidate all rank-related queries
      queryClient.invalidateQueries({ queryKey: ["crm_customer_rank"] });
      queryClient.invalidateQueries({ queryKey: ["crm_customer_ranks"] });
      queryClient.invalidateQueries({ queryKey: ["crm_rank_history"] });
    },
  });
}
