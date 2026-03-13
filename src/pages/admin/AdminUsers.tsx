import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { InviteUserDialog } from "@/modules/users/components/InviteUserDialog";
import { PendingInvitationsList } from "@/modules/users/components/PendingInvitationsList";
import { BranchAssignmentDialog } from "@/modules/users/components/BranchAssignmentDialog";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { getInvitableRoles, isAtLeast } from "@/shared/lib/permissions";
import type { Database } from "@/integrations/supabase/types";
import {
  useAdminUsers,
  UserStatsCards,
  UsersFilterBar,
  UsersTable,
  EditRoleDialog,
} from "./users";

type AppRole = Database["public"]["Enums"]["app_role"];

const AdminUsers = () => {
  const { data: currentUserRole } = useUserRole();
  const { user: currentUser } = useAuth();
  const { users, isLoading, branchAssignmentsByUser, updateRole } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<{ id: string; email: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("customer");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [branchAssignmentUser, setBranchAssignmentUser] = useState<{
    userId: string; email: string; name: string;
  } | null>(null);

  const assignableRoles = getInvitableRoles(currentUserRole ?? null);

  const visibleUsers = users.filter((user) => user.role !== "super_admin");

  const isManager = currentUserRole === "branch_manager";
  const isAdmin = currentUserRole === "admin";

  const managerVisibleUsers = isManager
    ? visibleUsers.filter((u) => u.role === "branch_staff" || u.role === "customer" || u.role === "user" || u.user_id === currentUser?.id)
    : isAdmin
    ? visibleUsers.filter((u) => u.role === "branch_staff" || u.role === "branch_manager" || u.role === "customer" || u.role === "user" || u.user_id === currentUser?.id)
    : visibleUsers;

  const staffCount = managerVisibleUsers.filter((u) => u.role === "branch_staff" || u.role === "branch_manager" || u.role === "admin").length;
  const customerCount = managerVisibleUsers.filter((u) => u.role === "customer").length;
  const unverifiedCount = managerVisibleUsers.filter((u) => u.role === "user").length;

  const displayedUsers = managerVisibleUsers.filter((user) => {
    const profile = user.profile as any;
    const matchesSearch =
      (profile?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUpdateRole = () => {
    if (editingUser) {
      updateRole.mutate({ userId: editingUser.id, role: newRole }, {
        onSuccess: () => setEditingUser(null),
      });
    }
  };

  return (
    <RoleGuard allowedRoles={["super_admin", "admin", "branch_manager"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>

          <UserStatsCards staffCount={staffCount} customerCount={customerCount} unverifiedCount={unverifiedCount} />
          <UsersFilterBar searchQuery={searchQuery} onSearchChange={setSearchQuery} roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} />

          <UsersTable
            users={displayedUsers}
            isLoading={isLoading}
            currentUserRole={currentUserRole ?? null}
            branchAssignmentsByUser={branchAssignmentsByUser}
            onEditRole={(user) => { setEditingUser(user); setNewRole(user.role); }}
            onVerifyUser={(userId) => updateRole.mutate({ userId, role: "customer" })}
            onManageBranches={setBranchAssignmentUser}
          />

          <PendingInvitationsList />
        </div>

        <EditRoleDialog
          editingUser={editingUser}
          newRole={newRole}
          onNewRoleChange={setNewRole}
          assignableRoles={assignableRoles}
          isPending={updateRole.isPending}
          onSave={handleUpdateRole}
          onClose={() => setEditingUser(null)}
        />

        <InviteUserDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />

        {branchAssignmentUser && (
          <BranchAssignmentDialog
            open={!!branchAssignmentUser}
            onOpenChange={() => setBranchAssignmentUser(null)}
            userId={branchAssignmentUser.userId}
            userEmail={branchAssignmentUser.email}
            userName={branchAssignmentUser.name || branchAssignmentUser.email}
          />
        )}
      </AdminLayout>
    </RoleGuard>
  );
};

export default AdminUsers;
