import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useInventoryStats, useLowStockAlerts } from "@/hooks/admin/useInventoryOverview";
import { usePurchaseOrders } from "@/hooks/admin/usePurchaseOrders";
import { useStockTransfers } from "@/hooks/admin/useStockTransfers";
import { useBranchAssignments } from "@/hooks/admin/useBranchContext";
import { useUserRole } from "@/hooks/useUserRole";
import { isAtLeast } from "@/lib/permissions";
import { StaffOnboardingWizard } from "@/components/admin/onboarding/StaffOnboardingWizard";
import {
  Package,
  AlertTriangle,
  Truck,
  ArrowLeftRight,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  loading,
  variant = "default",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  loading?: boolean;
  variant?: "default" | "warning" | "danger";
}) => {
  const variants = {
    default: "text-primary",
    warning: "text-amber-500",
    danger: "text-destructive",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${variants[variant]}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: lowStockItems, isLoading: alertsLoading } = useLowStockAlerts();
  const { data: pendingPOs } = usePurchaseOrders("submitted");
  const { data: pendingTransfers } = useStockTransfers("pending");
  const { data: branchAssignments, isLoading: assignmentsLoading } = useBranchAssignments();
  const { data: role, isLoading: roleLoading } = useUserRole();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check if staff user needs onboarding (no branch assignments)
  useEffect(() => {
    if (!assignmentsLoading && !roleLoading && role) {
      const isStaffOrManager = isAtLeast(role, "branch_staff") && role !== "super_admin";
      const noBranchAssigned = !branchAssignments || branchAssignments.length === 0;
      
      if (isStaffOrManager && noBranchAssigned) {
        setShowOnboarding(true);
      }
    }
  }, [branchAssignments, assignmentsLoading, role, roleLoading]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory management system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Stock Items"
            value={stats?.totalItems.toLocaleString() || 0}
            icon={Package}
            loading={statsLoading}
          />
          <StatCard
            title="Low Stock Alerts"
            value={stats?.lowStockCount || 0}
            icon={AlertTriangle}
            loading={statsLoading}
            variant={stats?.lowStockCount ? "warning" : "default"}
            description="Items below threshold"
          />
          <StatCard
            title="Products"
            value={stats?.productCount || 0}
            icon={TrendingUp}
            loading={statsLoading}
            description="Active products"
          />
          <StatCard
            title="Suppliers"
            value={stats?.supplierCount || 0}
            icon={Users}
            loading={statsLoading}
            description="Active suppliers"
          />
        </div>

        {/* Action Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Pending Purchase Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <Truck className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {pendingPOs && pendingPOs.length > 0 ? (
                <div className="space-y-2">
                  {pendingPOs.slice(0, 3).map((po) => (
                    <div
                      key={po.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono">{po.order_number}</span>
                      <Badge variant="secondary">{po.status}</Badge>
                    </div>
                  ))}
                  {pendingPOs.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{pendingPOs.length - 3} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pending purchase orders
                </p>
              )}
              <Button asChild variant="link" className="px-0 mt-2">
                <Link to="/admin/inventory/purchase-orders">View all →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pending Transfers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Pending Transfers</CardTitle>
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {pendingTransfers && pendingTransfers.length > 0 ? (
                <div className="space-y-2">
                  {pendingTransfers.slice(0, 3).map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="font-mono">{transfer.transfer_number}</span>
                      <Badge variant="outline">{transfer.status}</Badge>
                    </div>
                  ))}
                  {pendingTransfers.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{pendingTransfers.length - 3} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pending transfers
                </p>
              )}
              <Button asChild variant="link" className="px-0 mt-2">
                <Link to="/admin/inventory/transfers">View all →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : lowStockItems && lowStockItems.length > 0 ? (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate max-w-[150px]">
                        {item.product?.name}
                      </span>
                      <Badge variant="destructive">
                        {item.quantity_on_hand} left
                      </Badge>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{lowStockItems.length - 3} more items
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  All stock levels are healthy
                </p>
              )}
              <Button asChild variant="link" className="px-0 mt-2">
                <Link to="/admin/inventory">View inventory →</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/admin/inventory/purchase-orders?new=true">
                <Truck className="mr-2 h-4 w-4" />
                New Purchase Order
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/inventory/transfers?new=true">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                New Stock Transfer
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/inventory/adjustments?new=true">
                <Package className="mr-2 h-4 w-4" />
                Stock Adjustment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Staff Onboarding Wizard */}
      <StaffOnboardingWizard
        open={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      />
    </AdminLayout>
  );
};

export default AdminDashboard;
