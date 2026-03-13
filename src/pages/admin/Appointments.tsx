import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import {
  useAdminAppointments,
  AppointmentStats,
  AppointmentFilters,
  AppointmentsTable,
} from "./appointments";

const AdminAppointments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");

  const { appointments, isLoading, branches, todayCount, upcomingCount, completedCount } = useAdminAppointments();

  const filteredAppointments = appointments.filter((apt) => {
    const profile = apt.profile as any;
    const matchesSearch =
      (profile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesBranch = branchFilter === "all" || apt.branch_id === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });

  return (
    <RoleGuard allowedRoles={["branch_staff", "branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Appointment History</h1>
            <p className="text-muted-foreground">View all appointments across all branches</p>
          </div>

          <AppointmentStats todayCount={todayCount} upcomingCount={upcomingCount} completedCount={completedCount} />
          <AppointmentFilters
            searchQuery={searchQuery} onSearchChange={setSearchQuery}
            branchFilter={branchFilter} onBranchFilterChange={setBranchFilter}
            statusFilter={statusFilter} onStatusFilterChange={setStatusFilter}
            branches={branches}
          />
          <AppointmentsTable appointments={filteredAppointments} isLoading={isLoading} />
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default AdminAppointments;
