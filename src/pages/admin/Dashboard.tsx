import { useState, useEffect } from "react";
import { AdminLayout } from "@/shared/components/admin";
import { Package, Warning, TrendUp, Users } from "@phosphor-icons/react";
import { useInventoryStats, useLowStockAlerts } from "@/modules/inventory";
import { usePurchaseOrders, useStockTransfers } from "@/modules/inventory";
import { useBranchAssignments } from "@/modules/branches";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { isAtLeast } from "@/shared/lib/permissions";
import { StaffOnboardingWizard } from "@/components/admin/onboarding/StaffOnboardingWizard";
import {
  StatCard,
  PendingApprovalsCard,
  PendingTransfersCard,
  LowStockAlertsCard,
  QuickActionsCard,
} from "@/shared/components/admin/dashboard";

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
