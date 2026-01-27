import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { InventoryItem, InventoryStats } from "../types";

export const useInventoryOverview = (branchId?: string, lowStockOnly?: boolean) => {
  return useQuery({
    queryKey: ["inventory-overview", branchId, lowStockOnly],
    queryFn: async () => {
      let query = supabase
        .from("inventory")
        .select(`
          *,
          product:products(id, name, sku, price, cost_price, item_type, reorder_level, image_url),
          branch:branches(id, name, city)
        `)
        .order("quantity_on_hand", { ascending: true });

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;

      if (error) throw error;

      let items = data as unknown as InventoryItem[];

      // Filter for low stock if requested
      if (lowStockOnly) {
        items = items.filter(
          (item) => item.quantity_on_hand <= (item.low_stock_threshold || 5)
        );
      }

      return items;
    },
  });
};

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ["low-stock-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(`
          *,
          product:products(id, name, sku, price, item_type, reorder_level),
          branch:branches(id, name, city)
        `)
        .order("quantity_on_hand", { ascending: true });

      if (error) throw error;

      const items = data as unknown as InventoryItem[];
      
      return items.filter(
        (item) => item.quantity_on_hand <= (item.low_stock_threshold || 5)
      );
    },
  });
};

export const useInventoryStats = (): ReturnType<typeof useQuery<InventoryStats>> => {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      const { data: inventory, error: invError } = await supabase
        .from("inventory")
        .select("quantity_on_hand, low_stock_threshold");

      if (invError) throw invError;

      const { count: productCount, error: prodError } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (prodError) throw prodError;

      const { count: supplierCount, error: supError } = await supabase
        .from("suppliers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (supError) throw supError;

      const totalItems = inventory?.reduce(
        (sum, item) => sum + (item.quantity_on_hand || 0),
        0
      ) || 0;

      const lowStockCount = inventory?.filter(
        (item) => item.quantity_on_hand <= (item.low_stock_threshold || 5)
      ).length || 0;

      const outOfStockCount = inventory?.filter(
        (item) => item.quantity_on_hand === 0
      ).length || 0;

      return {
        totalItems,
        lowStockCount,
        outOfStockCount,
        productCount: productCount || 0,
        supplierCount: supplierCount || 0,
      };
    },
  });
};
