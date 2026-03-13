import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReportsData = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["reports-stats"],
    queryFn: async () => {
      const [products, orders, users, inventory] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total_amount, created_at"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("inventory").select("quantity_on_hand, product_id"),
      ]);

      const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const totalStock = inventory.data?.reduce((sum, i) => sum + (i.quantity_on_hand || 0), 0) || 0;

      return {
        totalProducts: products.count || 0,
        totalOrders: orders.data?.length || 0,
        totalUsers: users.count || 0,
        totalRevenue,
        totalStock,
        orders: orders.data || [],
        inventory: inventory.data || [],
      };
    },
  });

  const { data: categoryData } = useQuery({
    queryKey: ["reports-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("item_type")
        .not("item_type", "is", null);

      const counts: Record<string, number> = {};
      data?.forEach((p) => {
        if (p.item_type) counts[p.item_type] = (counts[p.item_type] || 0) + 1;
      });

      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    },
  });

  const monthlySalesData = stats?.orders ? (() => {
    const months: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    stats.orders.forEach((order) => {
      const date = new Date(order.created_at);
      const key = monthNames[date.getMonth()];
      months[key] = (months[key] || 0) + Number(order.total_amount);
    });
    return monthNames.map((month) => ({ month, sales: months[month] || 0 }));
  })() : [];

  const inventoryTrendData = [
    { month: "Jan", stock: 1200 },
    { month: "Feb", stock: 1350 },
    { month: "Mar", stock: 1100 },
    { month: "Apr", stock: 1450 },
    { month: "May", stock: 1300 },
    { month: "Jun", stock: stats?.totalStock || 1400 },
  ];

  return { stats, isLoading, categoryData, monthlySalesData, inventoryTrendData };
};
