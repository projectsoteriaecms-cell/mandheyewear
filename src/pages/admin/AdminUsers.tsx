import { useState } from "react";
import { AdminLayout, RoleGuard } from "@/shared/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  Mail,
  MoreHorizontal,
  Edit,
  Building2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { InviteUserDialog } from "@/components/admin/users/InviteUserDialog";
import { PendingInvitationsList } from "@/components/admin/users/PendingInvitationsList";
import { BranchAssignmentDialog } from "@/components/admin/users/BranchAssignmentDialog";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/shared/hooks/useAuth";
import { getInvitableRoles, canChangeUserRole, getRoleLabel, isAtLeast } from "@/lib/permissions";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  user: "User (Unverified)",
  customer: "Customer",
  branch_staff: "Branch Staff",
  branch_manager: "Branch Manager",
  admin: "Admin",
  super_admin: "Super Admin",
};

const roleBadgeVariants: Record<AppRole, "default" | "secondary" | "destructive" | "outline"> = {
  user: "outline",
  customer: "secondary",
  branch_staff: "default",
  branch_manager: "default",
  admin: "destructive",
  super_admin: "destructive",
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const { data: currentUserRole } = useUserRole();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<{ id: string; email: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("customer");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [branchAssignmentUser, setBranchAssignmentUser] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);

  // Get roles the current user can assign
  const assignableRoles = getInvitableRoles(currentUserRole ?? null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // First get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      // Then get all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");

      if (profilesError) throw profilesError;

      // Create a map for quick lookup
      const profilesMap = new Map(profilesData.map(p => [p.user_id, p]));

      // Combine the data
      return rolesData.map(role => ({
        ...role,
        profile: profilesMap.get(role.user_id) || null,
      }));
    },
  });

  // Fetch all branch assignments for staff users
  const { data: allBranchAssignments = [] } = useQuery({
    queryKey: ["all-branch-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_assignments")
        .select(`
          user_id,
          branch_id,
          is_primary,
          branch:branches(id, name)
        `);

      if (error) throw error;
      return data;
    },
  });

  // Group branch assignments by user_id for easy lookup
  const branchAssignmentsByUser = allBranchAssignments.reduce((acc, assignment) => {
    if (!acc[assignment.user_id]) {
      acc[assignment.user_id] = [];
    }
    acc[assignment.user_id].push(assignment);
    return acc;
  }, {} as Record<string, typeof allBranchAssignments>);

  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated successfully");
      setEditingUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  // Filter out super_admin from the list
  const visibleUsers = users.filter((user) => user.role !== "super_admin");

  const handleUpdateRole = () => {
    if (editingUser) {
      updateRole.mutate({ userId: editingUser.id, role: newRole });
    }
  };

  const handleVerifyUser = (userId: string) => {
    updateRole.mutate({ userId, role: "customer" });
  };

  // Check if current user is a manager (not super_admin)
  const isManager = currentUserRole === "branch_manager";
  const isSuperAdmin = currentUserRole === "super_admin";

  // For managers: filter to only show staff, customers, unverified users, AND themselves
  const managerVisibleUsers = isManager
    ? visibleUsers.filter((u) => 
        u.role === "branch_staff" || 
        u.role === "customer" || 
        u.role === "user" ||
        u.user_id === currentUser?.id // Include their own profile
      )
    : visibleUsers;

  // Recalculate stats based on what the user can see
  const visibleStaffCount = managerVisibleUsers.filter((u) => u.role === "branch_staff" || u.role === "branch_manager").length;
  const visibleCustomerCount = managerVisibleUsers.filter((u) => u.role === "customer").length;
  const visibleUnverifiedCount = managerVisibleUsers.filter((u) => u.role === "user").length;

  // Filter based on search and role filter
  const displayedUsers = managerVisibleUsers.filter((user) => {
    const profile = user.profile as any;
    const matchesSearch =
      (profile?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <RoleGuard allowedRoles={["super_admin", "branch_manager"]}>
      <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage user roles and permissions
            </p>
          </div>
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        </div>

        {/* Stats - Updated to show Staff, Verified Customers, Unverified Users */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{visibleStaffCount}</p>
              <p className="text-xs text-muted-foreground">Managers & Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Verified Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{visibleCustomerCount}</p>
              <p className="text-xs text-muted-foreground">Can purchase & book</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserX className="h-4 w-4" />
                Unverified Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{visibleUnverifiedCount}</p>
              <p className="text-xs text-muted-foreground">Browse only</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="branch_manager">Branch Managers</SelectItem>
                  <SelectItem value="branch_staff">Branch Staff</SelectItem>
                  <SelectItem value="customer">Customers (Verified)</SelectItem>
                  <SelectItem value="user">Users (Unverified)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({displayedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : displayedUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Branches</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUsers.map((user) => {
                      const profile = user.profile as any;
                      const userBranches = branchAssignmentsByUser[user.user_id] || [];
                      const isStaffOrManager = isAtLeast(user.role, "branch_staff") && user.role !== "super_admin";
                      const isUnverified = user.role === "user";
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                isUnverified ? "bg-muted" : "bg-primary/10"
                              }`}>
                                <Users className={`h-5 w-5 ${isUnverified ? "text-muted-foreground" : "text-primary"}`} />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {profile?.full_name || "No name"}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {profile?.email || "No email"}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={roleBadgeVariants[user.role]} className={isUnverified ? "border-dashed" : ""}>
                              <Shield className="mr-1 h-3 w-3" />
                              {roleLabels[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.role === "super_admin" ? (
                              <span className="text-xs text-muted-foreground italic">All branches</span>
                            ) : isStaffOrManager ? (
                              userBranches.length > 0 ? (
                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                  {userBranches.map((assignment: any) => (
                                    <Badge
                                      key={assignment.branch_id}
                                      variant="outline"
                                      className={`text-xs ${
                                        assignment.is_primary
                                          ? "border-primary/50 bg-primary/5"
                                          : ""
                                      }`}
                                    >
                                      <Building2 className="mr-1 h-2.5 w-2.5" />
                                      {assignment.branch?.name}
                                      {assignment.is_primary && (
                                        <span className="ml-1 text-primary">★</span>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">
                                  No branches assigned
                                </span>
                              )
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {canChangeUserRole(currentUserRole ?? null, user.role, user.role) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {isUnverified && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleVerifyUser(user.user_id)}
                                        className="text-green-600"
                                      >
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Verify User
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingUser({
                                        id: user.user_id,
                                        email: profile?.email || "",
                                        role: user.role,
                                      });
                                      setNewRole(user.role);
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Change Role
                                  </DropdownMenuItem>
                                  {isAtLeast(user.role, "branch_staff") && user.role !== "super_admin" && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setBranchAssignmentUser({
                                            userId: user.user_id,
                                            email: profile?.email || "",
                                            name: profile?.full_name || "",
                                          });
                                        }}
                                      >
                                        <Building2 className="mr-2 h-4 w-4" />
                                        Manage Branches
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        <PendingInvitationsList />
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Changing role for: <strong>{editingUser?.email}</strong>
            </p>
            <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assignableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleLabel(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateRole} 
                disabled={updateRole.isPending}
              >
                {updateRole.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />

      {/* Branch Assignment Dialog */}
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
