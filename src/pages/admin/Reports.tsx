import { AdminLayout } from "@/components/admin/AdminLayout";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Reports = () => {
  // Fetch summary stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["reports-stats"],
    queryFn: async () => {
      const [products, orders, users, inventory] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total_amount"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("inventory").select("quantity_on_hand"),
      ]);

      const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
      const totalStock = inventory.data?.reduce((sum, i) => sum + (i.quantity_on_hand || 0), 0) || 0;

      return {
        totalProducts: products.count || 0,
        totalOrders: orders.data?.length || 0,
        totalUsers: users.count || 0,
        totalRevenue,
        totalStock,
      };
    },
  });

  const statCards = [
    {
      title: "Total Revenue",
      value: stats ? `₦${stats.totalRevenue.toLocaleString()}` : "—",
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Active Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      trend: "+3",
      trendUp: true,
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      trend: "+15",
      trendUp: true,
    },
    {
      title: "Total Stock Units",
      value: stats?.totalStock.toLocaleString() || 0,
      icon: Package,
      trend: "-2.1%",
      trendUp: false,
    },
  ];

  return (
    <RoleGuard allowedRoles={["branch_manager", "super_admin"]}>
      <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Overview of business performance and metrics
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {isLoading
            ? [...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      {stat.trendUp ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <span className={stat.trendUp ? "text-green-600" : "text-red-600"}>
                        {stat.trend}
                      </span>
                      <span>from last month</span>
                    </p>
                  </CardContent>
                </Card>
              ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Sales Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Sales chart coming soon</p>
                  <p className="text-sm">Connect analytics for detailed reports</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Inventory Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-muted/50 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Inventory trends coming soon</p>
                  <p className="text-sm">Track stock levels over time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Average Order Value</p>
                <p className="text-xl font-bold mt-1">
                  ₦{stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Stock per Product</p>
                <p className="text-xl font-bold mt-1">
                  {stats?.totalProducts ? Math.round(stats.totalStock / stats.totalProducts) : 0} units
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Orders per User</p>
                <p className="text-xl font-bold mt-1">
                  {stats?.totalUsers ? (stats.totalOrders / stats.totalUsers).toFixed(1) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default Reports;
