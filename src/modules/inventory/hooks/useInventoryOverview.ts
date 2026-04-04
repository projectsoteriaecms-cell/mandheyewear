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
      // Fetch inventory joined with branches to split by is_mh_location
      const { data: inventory, error: invError } = await supabase
        .from("inventory")
        .select("quantity_on_hand, low_stock_threshold, product_id, branch_id, branch:branches(is_mh_location)");

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

      const { count: mhProductCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion");

      const { count: mhFeaturedCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .eq("brand_line", "m_and_h_fashion")
        .not("image_url", "is", null);

      const { count: totalProductCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      const { count: centralBranchCount } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true)
        .neq("is_mh_location", true);

      const items = (inventory || []) as unknown as Array<{
        quantity_on_hand: number;
        low_stock_threshold: number | null;
        product_id: string;
        branch_id: string;
        branch: { is_mh_location: boolean | null };
      }>;

      const mhItems = items.filter(i => i.branch?.is_mh_location === true);
      const centralItems = items.filter(i => i.branch?.is_mh_location !== true);

      const totalItems = items.reduce((sum, i) => sum + (i.quantity_on_hand || 0), 0);
      const lowStockCount = items.filter(i => i.quantity_on_hand <= (i.low_stock_threshold || 5)).length;
      const outOfStockCount = items.filter(i => i.quantity_on_hand === 0).length;

      // M&H stats
      const mhStockUnits = mhItems.reduce((sum, i) => sum + (i.quantity_on_hand || 0), 0);
      const mhLowStock = mhItems.filter(i => i.quantity_on_hand > 0 && i.quantity_on_hand <= (i.low_stock_threshold || 5)).length;
      const mhOutOfStock = mhItems.filter(i => i.quantity_on_hand === 0).length;

      // Central stats
      const centralStockUnits = centralItems.reduce((sum, i) => sum + (i.quantity_on_hand || 0), 0);
      const centralUniqueProducts = new Set(centralItems.map(i => i.product_id)).size;

      // Available for sourcing: products with 0 at M&H but >0 at central
      const mhZeroProducts = new Set(mhItems.filter(i => i.quantity_on_hand === 0).map(i => i.product_id));
      const centralPositive = new Set(centralItems.filter(i => i.quantity_on_hand > 0).map(i => i.product_id));
      const availableForSourcing = [...mhZeroProducts].filter(pid => centralPositive.has(pid)).length;

      return {
        totalItems,
        lowStockCount,
        outOfStockCount,
        productCount: productCount || 0,
        totalProductCount: totalProductCount || 0,
        supplierCount: supplierCount || 0,
        mh: {
          stockUnits: mhStockUnits,
          productCount: mhProductCount || 0,
          featuredOnline: mhFeaturedCount || 0,
          lowStock: mhLowStock,
          outOfStock: mhOutOfStock,
        },
        central: {
          stockUnits: centralStockUnits,
          productCount: centralUniqueProducts,
          availableForSourcing,
          branchCount: centralBranchCount || 0,
        },
      };
    },
  });
};
