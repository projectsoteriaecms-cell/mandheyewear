import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  customer: "Customer",
  branch_staff: "Branch Staff",
  branch_manager: "Branch Manager",
  super_admin: "Super Admin",
};

const roleBadgeVariants: Record<AppRole, "default" | "secondary" | "destructive" | "outline"> = {
  customer: "outline",
  branch_staff: "secondary",
  branch_manager: "default",
  super_admin: "destructive",
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<{ id: string; email: string; role: AppRole } | null>(null);
  const [newRole, setNewRole] = useState<AppRole>("customer");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          role,
          created_at,
          profile:profiles!user_roles_user_id_fkey(full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

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

  const filteredUsers = users.filter((user) => {
    const profile = user.profile as any;
    const matchesSearch =
      (profile?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (profile?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleUpdateRole = () => {
    if (editingUser) {
      updateRole.mutate({ userId: editingUser.id, role: newRole });
    }
  };

  return (
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

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Super Admins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "super_admin").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "branch_staff" || u.role === "branch_manager").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === "customer").length}
              </p>
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="branch_manager">Branch Manager</SelectItem>
                  <SelectItem value="branch_staff">Branch Staff</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
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
              All Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
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
                      <TableHead>Joined</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => {
                      const profile = user.profile as any;
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
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
                            <Badge variant={roleBadgeVariants[user.role]}>
                              <Shield className="mr-1 h-3 w-3" />
                              {roleLabels[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
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
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="branch_staff">Branch Staff</SelectItem>
                <SelectItem value="branch_manager">Branch Manager</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={updateRole.isPending}>
                Update Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <InviteUserDialog 
        open={inviteDialogOpen} 
        onOpenChange={setInviteDialogOpen} 
      />
    </AdminLayout>
  );
};

export default AdminUsers;
