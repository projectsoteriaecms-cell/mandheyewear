import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { RoleGuard } from "./RoleGuard";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar hidden on mobile, visible on md+ */}
        <div className="hidden md:flex">
          <AdminSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
};
