import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

// Most-privileged first. A user can hold several roles (e.g. branch_manager
// *and* branch_staff); the admin list shows one row per person using their
// highest role, otherwise the same person appears once per role row.
const ROLE_RANK: AppRole[] = [
  "super_admin",
  "admin",
  "branch_manager",
  "branch_staff",
  "customer",
  "user",
];

const rankOf = (role: AppRole) => {
  const i = ROLE_RANK.indexOf(role);
  return i === -1 ? ROLE_RANK.length : i;
};

export const useAdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");

      if (profilesError) throw profilesError;

      const profilesMap = new Map(profilesData.map(p => [p.user_id, p]));

      // Collapse to one entry per user, keeping their highest-ranked role.
      const byUser = new Map<string, typeof rolesData[number]>();
      for (const row of rolesData) {
        const existing = byUser.get(row.user_id);
        if (!existing || rankOf(row.role as AppRole) < rankOf(existing.role as AppRole)) {
          byUser.set(row.user_id, row);
        }
      }

      return Array.from(byUser.values()).map(role => ({
        ...role,
        profile: profilesMap.get(role.user_id) || null,
      }));
    },
  });

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
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  return { users, isLoading, branchAssignmentsByUser, updateRole };
};
