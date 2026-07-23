import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { PUBLIC_PRODUCT_COLUMNS } from "@/modules/products";

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

      // product:products (*) fails outright -- the products table uses
      // column-level grants (cost_price, supplier_id, etc. are staff-only),
      // and a wildcard select requires a grant on EVERY column. That threw on
      // every call, so cartQuery/orders data silently fell back to an empty
      // array with no visible error -- orders existed in the DB the whole
      // time, this page just couldn't read them back.
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (${PUBLIC_PRODUCT_COLUMNS})
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
