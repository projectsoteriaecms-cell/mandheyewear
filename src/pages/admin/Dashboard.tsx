import { AdminLayout } from "@/shared/components/admin";
import { Package, Warning, TrendUp, Users, Buildings, EnvelopeSimple, FileText, Image } from "@phosphor-icons/react";
import { useInventoryStats, useLowStockAlerts } from "@/modules/inventory";
import { usePurchaseOrders, useStockTransfers } from "@/modules/inventory";
import { useProductImageStats } from "@/modules/products";
import { useBranchAssignments } from "@/modules/branches";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { isAtLeast } from "@/shared/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  StatCard,
  PendingApprovalsCard,
  PendingTransfersCard,
  LowStockAlertsCard,
  QuickActionsCard,
} from "@/shared/components/admin/dashboard";
import { WelcomeBranchDialog } from "@/components/admin/onboarding/WelcomeBranchDialog";
import { Link } from "react-router-dom";

const NoBranchAssignmentCard = () => (
  <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
    <CardHeader className="text-center pb-2">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
        <Buildings className="h-8 w-8 text-amber-600 dark:text-amber-400" weight="duotone" />
      </div>
      <CardTitle className="text-xl text-amber-900 dark:text-amber-100">
        No Branch Assignment
      </CardTitle>
      <CardDescription className="text-amber-700 dark:text-amber-300">
        You haven't been assigned to a branch yet
      </CardDescription>
    </CardHeader>
    <CardContent className="text-center space-y-4">
      <p className="text-sm text-amber-600 dark:text-amber-400">
        Please contact your administrator to complete your account setup and get assigned to a branch.
      </p>
      <Button 
        variant="outline" 
        className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
        asChild
      >
        <a href="mailto:admin@soteriaeyeclinic.com">
          <EnvelopeSimple className="mr-2 h-4 w-4" />
          Contact Administrator
        </a>
      </Button>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useInventoryStats();
  const { data: lowStockItems, isLoading: alertsLoading } = useLowStockAlerts();
  const imageStats = useProductImageStats();
  const { data: pendingPOs } = usePurchaseOrders("submitted");
  const { data: pendingTransfers } = useStockTransfers("pending");
  const { data: branchAssignments, isLoading: assignmentsLoading } = useBranchAssignments();
  const { data: role, isLoading: roleLoading } = useUserRole();
  
  const isLoading = assignmentsLoading || roleLoading;
  const isSuperAdmin = role === "super_admin";
  const isStaffOrManager = role && isAtLeast(role, "branch_staff") && !isSuperAdmin;
  const noBranchAssigned = !branchAssignments || branchAssignments.length === 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory management system
          </p>
        </div>

        {/* Show "No Branch Assignment" for staff/managers without a branch */}
        {!isLoading && isStaffOrManager && noBranchAssigned ? (
          <div className="flex items-center justify-center py-12">
            <NoBranchAssignmentCard />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <StatCard
                title="Total Stock Items"
                value={stats?.totalItems.toLocaleString() || 0}
                icon={Package}
                loading={statsLoading}
              />
              <StatCard
                title="Low Stock Alerts"
                value={stats?.lowStockCount || 0}
                icon={Warning}
                loading={statsLoading}
                variant={stats?.lowStockCount ? "warning" : "default"}
                description="Items below threshold"
              />
              <StatCard
                title="Products"
                value={stats?.productCount || 0}
                icon={TrendUp}
                loading={statsLoading}
                description="Active products"
              />
              <StatCard
                title="With Images"
                value={imageStats.isLoading ? "..." : imageStats.withPrimary.toLocaleString()}
                icon={Image}
                loading={imageStats.isLoading}
                description={`${imageStats.complete} complete (6/6)`}
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
              <PendingApprovalsCard pendingPOs={pendingPOs} />
              <PendingTransfersCard pendingTransfers={pendingTransfers} />
              <LowStockAlertsCard lowStockItems={lowStockItems} loading={alertsLoading} />
            </div>

            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Delivery Report - Super Admin only */}
            {isSuperAdmin && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" weight="duotone" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Platform Delivery Report</CardTitle>
                      <CardDescription>Full stakeholder rundown of everything built on the platform</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button asChild>
                    <Link to="/admin/delivery-report">
                      <FileText className="mr-2 h-4 w-4" />
                      View &amp; Download
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      
      {/* Welcome Dialog for newly assigned staff */}
      <WelcomeBranchDialog />
    </AdminLayout>
  );
};

export default AdminDashboard;
