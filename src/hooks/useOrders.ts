import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

export interface OrderWithItems extends Order {
  order_items: (OrderItem & {
    product: Tables<"products"> | null;
  })[];
}

export const useOrders = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["orders", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as OrderWithItems[];
    },
    enabled: !!userId,
  });
};
