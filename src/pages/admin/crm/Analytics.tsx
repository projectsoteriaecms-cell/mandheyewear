import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { CrmAccessGate, LtvDashboard, PreferenceCenterStats } from "@/modules/crm";
import { CrmTabs } from "./CrmTabs";

const CrmAnalytics = () => {
  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "branch_manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">CRM Analytics</h1>
            <p className="text-muted-foreground">
              Lifetime value, cohort retention, and email preference health.
            </p>
          </div>

          <CrmTabs />

          <CrmAccessGate>
            <div className="space-y-6">
              <LtvDashboard />
              <PreferenceCenterStats />
            </div>
          </CrmAccessGate>
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default CrmAnalytics;
