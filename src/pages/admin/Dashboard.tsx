import { AdminLayout } from "@/shared/layouts/admin";
import { Package, Warning, TrendUp, Users, Buildings, EnvelopeSimple, FileText, Image, Storefront, ArrowsClockwise, Cube, MapPin, Eyeglasses, Drop, FirstAid } from "@phosphor-icons/react";
import { useInventoryStats, useLowStockAlerts } from "@/modules/inventory";
import { usePurchaseOrders, useStockTransfers } from "@/modules/inventory";
import { useProductImageStats } from "@/modules/products";
import { useBranchAssignments, WelcomeBranchDialog } from "@/modules/branches";

import { isAtLeast } from "@/shared/lib/permissions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  StatCard,
  PendingApprovalsCard,
  PendingTransfersCard,
  LowStockAlertsCard,
  QuickActionsCard,
} from "@/shared/layouts/admin/dashboard";

import { Link } from "react-router-dom";
import { useUserRole } from "@/modules/auth";

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

const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
      <Icon className="h-5 w-5 text-primary" weight="duotone" />
    </div>
    <div>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
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

        {!isLoading && isStaffOrManager && noBranchAssigned ? (
          <div className="flex items-center justify-center py-12">
            <NoBranchAssignmentCard />
          </div>
        ) : (
          <>
            {/* Section A: M&H E-Commerce */}
            <div>
              <SectionHeader
                icon={Storefront}
                title="M&H E-Commerce"
                description="Online storefront inventory for the M&H Fashion catalog"
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Frames"
                  value={stats?.mh.byType.frames.toLocaleString() || "0"}
                  icon={Eyeglasses}
                  loading={statsLoading}
                  description="Frame units in M&H"
                />
                <StatCard
                  title="Lenses"
                  value={stats?.mh.byType.lenses.toLocaleString() || "0"}
                  icon={Drop}
                  loading={statsLoading}
                  description="Lens units in M&H"
                />
                <StatCard
                  title="Contact Lenses"
                  value={stats?.mh.byType.contactLenses.toLocaleString() || "0"}
                  icon={Drop}
                  loading={statsLoading}
                  description="Contact lens units in M&H"
                />
                <StatCard
                  title="Accessories"
                  value={stats?.mh.byType.accessories.toLocaleString() || "0"}
                  icon={FirstAid}
                  loading={statsLoading}
                  description="Solutions, cleanser & other"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-4">
                <StatCard
                  title="Total M&H Units"
                  value={stats?.mh.stockUnits.toLocaleString() || "0"}
                  icon={Package}
                  loading={statsLoading}
                  description="All item types combined"
                />
                <StatCard
                  title="Featured Online"
                  value={stats?.mh.featuredOnline || 0}
                  icon={TrendUp}
                  loading={statsLoading}
                  description={`${stats?.mh.featuredOnline || 0} of ${stats?.mh.productCount || 0} with images`}
                />
                <StatCard
                  title="Low Stock"
                  value={stats?.mh.lowStock || 0}
                  icon={Warning}
                  loading={statsLoading}
                  variant={stats?.mh.lowStock ? "warning" : "default"}
                  description="M&H items below threshold"
                />
                <StatCard
                  title="With Images"
                  value={imageStats.error ? "⚠" : imageStats.isLoading ? "..." : imageStats.withPrimary.toLocaleString()}
                  icon={Image}
                  loading={imageStats.isLoading}
                  variant={imageStats.error ? "warning" : "default"}
                  description={imageStats.error ? "Failed to load stats" : `${imageStats.complete} complete (6/6)`}
                />
              </div>
            </div>

            {/* Section B: Soteria Medical */}
            <div>
              <SectionHeader
                icon={Buildings}
                title="Soteria Medical"
                description="Soteria branch inventory — excess stock available for sourcing"
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Soteria Stock Units"
                  value={stats?.central.stockUnits.toLocaleString() || "0"}
                  icon={Cube}
                  loading={statsLoading}
                  description="Units across Soteria branches"
                />
                <StatCard
                  title="Soteria Products"
                  value={stats?.central.productCount.toLocaleString() || "0"}
                  icon={Package}
                  loading={statsLoading}
                  description="Unique products in Soteria branches"
                />
                <StatCard
                  title="Branches"
                  value={stats?.central.branchCount || 0}
                  icon={MapPin}
                  loading={statsLoading}
                  description="Active Soteria locations"
                />
                <StatCard
                  title="Available for Sourcing"
                  value={stats?.central.availableForSourcing || 0}
                  icon={ArrowsClockwise}
                  loading={statsLoading}
                  variant={stats?.central.availableForSourcing ? "warning" : "default"}
                  description="Out at M&H, in stock elsewhere"
                />
              </div>
            </div>

            {/* Section C: Combined Totals */}
            <div>
              <SectionHeader
                icon={Package}
                title="Combined Totals"
                description="Aggregated inventory across all branches and brand lines"
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Stock (All)"
                  value={stats?.totalItems.toLocaleString() || "0"}
                  icon={Package}
                  loading={statsLoading}
                  description="Combined across all branches"
                />
                <StatCard
                  title="Total Products (All)"
                  value={stats?.totalProductCount.toLocaleString() || "0"}
                  icon={Cube}
                  loading={statsLoading}
                  description="All active products in system"
                />
                <StatCard
                  title="Active Suppliers"
                  value={stats?.supplierCount || 0}
                  icon={Users}
                  loading={statsLoading}
                />
                <StatCard
                  title="Out of Stock (M&H)"
                  value={stats?.mh.outOfStock || 0}
                  icon={Warning}
                  loading={statsLoading}
                  variant={stats?.mh.outOfStock ? "danger" : "default"}
                  description="M&H products with zero stock"
                />
              </div>
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
      
      <WelcomeBranchDialog />
    </AdminLayout>
  );
};

export default AdminDashboard;
