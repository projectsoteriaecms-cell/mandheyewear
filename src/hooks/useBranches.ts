import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Branch = Tables<"branches">;

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
