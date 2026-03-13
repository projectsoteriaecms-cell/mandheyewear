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
import {
  Users,
  Shield,
  Mail,
  MoreHorizontal,
  Edit,
  Building2,
  UserCheck,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canChangeUserRole, isAtLeast } from "@/shared/lib/permissions";
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

interface UsersTableProps {
  users: any[];
  isLoading: boolean;
  currentUserRole: AppRole | null;
  branchAssignmentsByUser: Record<string, any[]>;
  onEditRole: (user: { id: string; email: string; role: AppRole }) => void;
  onVerifyUser: (userId: string) => void;
  onManageBranches: (user: { userId: string; email: string; name: string }) => void;
}

export const UsersTable = ({
  users,
  isLoading,
  currentUserRole,
  branchAssignmentsByUser,
  onEditRole,
  onVerifyUser,
  onManageBranches,
}: UsersTableProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        All Users ({users.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : users.length === 0 ? (
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
              {users.map((user) => {
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
                          <p className="font-medium">{profile?.full_name || "No name"}</p>
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
                                  assignment.is_primary ? "border-primary/50 bg-primary/5" : ""
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
                          <span className="text-xs text-muted-foreground italic">No branches assigned</span>
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
                                  onClick={() => onVerifyUser(user.user_id)}
                                  className="text-green-600"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Verify User
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => onEditRole({
                                id: user.user_id,
                                email: profile?.email || "",
                                role: user.role,
                              })}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            {isAtLeast(user.role, "branch_staff") && user.role !== "super_admin" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onManageBranches({
                                    userId: user.user_id,
                                    email: profile?.email || "",
                                    name: profile?.full_name || "",
                                  })}
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
);
