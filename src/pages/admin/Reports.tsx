import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, Users, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  useReportsData,
  SalesChart,
  InventoryTrendChart,
  CategoryPieChart,
  QuickInsights,
} from "./reports";

const Reports = () => {
  const { stats, isLoading, categoryData, monthlySalesData, inventoryTrendData } = useReportsData();

  const statCards = [
    { title: "Total Revenue", value: stats ? `₦${stats.totalRevenue.toLocaleString()}` : "—", icon: DollarSign, trend: "+12.5%", trendUp: true },
    { title: "Total Orders", value: stats?.totalOrders || 0, icon: ShoppingCart, trend: "+8.2%", trendUp: true },
    { title: "Active Products", value: stats?.totalProducts || 0, icon: Package, trend: "+3", trendUp: true },
    { title: "Total Users", value: stats?.totalUsers || 0, icon: Users, trend: "+15", trendUp: true },
    { title: "Total Stock Units", value: stats?.totalStock.toLocaleString() || 0, icon: Package, trend: "-2.1%", trendUp: false },
  ];

  return (
    <RoleGuard allowedRoles={["branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Overview of business performance and metrics</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading
              ? [...Array(5)].map((_, i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                ))
              : statCards.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                      <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        {stat.trendUp ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
                        <span className={stat.trendUp ? "text-green-600" : "text-red-600"}>{stat.trend}</span>
                        <span>from last month</span>
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <SalesChart data={monthlySalesData} />
            <InventoryTrendChart data={inventoryTrendData} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <CategoryPieChart data={categoryData || []} />
            <QuickInsights stats={stats} />
          </div>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default Reports;
