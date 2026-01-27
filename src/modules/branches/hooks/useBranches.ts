import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Branch } from "../types";

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("is_active", true)
        .order("is_head_office", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Branch[];
    },
  });
};

export const useBranch = (branchId: string) => {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("id", branchId)
        .maybeSingle();

      if (error) throw error;
      return data as Branch | null;
    },
    enabled: !!branchId,
  });
};

export const useAllBranches = (includeInactive = false) => {
  return useQuery({
    queryKey: ["branches", "all", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("branches")
        .select("*")
        .order("is_head_office", { ascending: false })
        .order("name", { ascending: true });

      if (!includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Branch[];
    },
  });
};
