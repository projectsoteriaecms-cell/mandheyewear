import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/modules/auth";
import type { BranchAssignment } from "../types";

export const useBranchAssignments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["branch-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("branch_assignments")
        .select(`
          id,
          branch_id,
          is_primary,
          branch:branches(id, name, city)
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data as unknown as BranchAssignment[];
    },
    enabled: !!user?.id,
  });
};

export const useBranchContext = () => {
  const { data: role, isLoading: roleLoading } = useUserRole();
  const { data: assignments, isLoading: assignmentsLoading } = useBranchAssignments();

  const isLoading = roleLoading || assignmentsLoading;

  // Super admin has access to all branches
  const isSuperAdmin = role === "super_admin";

  // Get primary branch ID for staff/managers
  const primaryBranchId = assignments?.find((a) => a.is_primary)?.branch_id || 
                          assignments?.[0]?.branch_id || 
                          null;

  // Get all assigned branch IDs
  const assignedBranchIds = assignments?.map((a) => a.branch_id) || [];

  // Check if user has access to a specific branch
  const hasBranchAccess = (branchId: string): boolean => {
    if (isSuperAdmin) return true;
    return assignedBranchIds.includes(branchId);
  };

  // Get branch filter for queries
  // Returns null for super admin (no filter needed)
  // Returns branch ID for scoped users
  const getBranchFilter = (): string | null => {
    if (isSuperAdmin) return null;
    return primaryBranchId;
  };

  // For managers who may have multiple branches
  const getBranchFilters = (): string[] | null => {
    if (isSuperAdmin) return null;
    return assignedBranchIds.length > 0 ? assignedBranchIds : null;
  };

  return {
    role,
    isLoading,
    isSuperAdmin,
    primaryBranchId,
    assignedBranchIds,
    assignments: assignments || [],
    hasBranchAccess,
    getBranchFilter,
    getBranchFilters,
  };
};
