import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InventoryTransaction } from "../types";

export const useInventoryTransactions = (branchId?: string) => {
  return useQuery({
    queryKey: ["inventory-transactions", branchId],
    queryFn: async () => {
      let query = supabase
        .from("inventory_transactions")
        .select(`
          *,
          product:products(id, name, sku),
          branch:branches(id, name)
        `)
        .order("created_at", { ascending: false })
        .limit(500);

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as InventoryTransaction[];
    },
  });
};
