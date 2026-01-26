import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

// Role hierarchy for comparison
const roleHierarchy: Record<AppRole, number> = {
  customer: 0,
  branch_staff: 1,
  branch_manager: 2,
  super_admin: 3,
};

// Check if a role is at least a certain level
export const isAtLeast = (role: AppRole | null, minimumRole: AppRole): boolean => {
  if (!role) return false;
  return roleHierarchy[role] >= roleHierarchy[minimumRole];
};

// Check if user can manage (CRUD) products
export const canManageProducts = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_manager");
};

// Check if user can manage suppliers
export const canManageSuppliers = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_manager");
};

// Check if user can view reports
export const canViewReports = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_manager");
};

// Check if user can manage branches
export const canManageBranches = (role: AppRole | null): boolean => {
  return role === "super_admin";
};

// Check if user can manage users
export const canManageUsers = (role: AppRole | null): boolean => {
  return role === "super_admin";
};

// Check if user can manage settings
export const canManageSettings = (role: AppRole | null): boolean => {
  return role === "super_admin";
};

// Purchase Order permissions
export const canCreatePurchaseOrder = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_staff");
};

export const canApprovePurchaseOrder = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_manager");
};

export const canReceivePurchaseOrder = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_staff");
};

// Stock Transfer permissions
export const canCreateStockTransfer = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_staff");
};

export const canApproveStockTransfer = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_manager");
};

export const canCompleteStockTransfer = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_staff");
};

// Stock Adjustment permissions
export const canCreateStockAdjustment = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_staff");
};

export const canApproveStockAdjustment = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_manager");
};

// Check if current user can invite/assign a specific role
export const canInviteRole = (currentRole: AppRole | null, targetRole: AppRole): boolean => {
  if (!currentRole) return false;
  
  // Super admin can invite any role
  if (currentRole === "super_admin") return true;
  
  // Branch manager can only invite staff and customers
  if (currentRole === "branch_manager") {
    return targetRole === "branch_staff" || targetRole === "customer";
  }
  
  // Others cannot invite
  return false;
};

// Check if current user can change another user's role
export const canChangeUserRole = (
  currentRole: AppRole | null,
  targetCurrentRole: AppRole,
  targetNewRole: AppRole
): boolean => {
  if (!currentRole) return false;
  
  // Super admin can change any role to any role
  if (currentRole === "super_admin") return true;
  
  // Branch manager can only change staff/customer roles
  if (currentRole === "branch_manager") {
    const allowedRoles: AppRole[] = ["branch_staff", "customer"];
    return allowedRoles.includes(targetCurrentRole) && allowedRoles.includes(targetNewRole);
  }
  
  return false;
};

// Get roles that a user can invite/assign
export const getInvitableRoles = (currentRole: AppRole | null): AppRole[] => {
  if (!currentRole) return [];
  
  if (currentRole === "super_admin") {
    return ["customer", "branch_staff", "branch_manager", "super_admin"];
  }
  
  if (currentRole === "branch_manager") {
    return ["customer", "branch_staff"];
  }
  
  return [];
};

// Check if user has access to admin panel
export const hasAdminAccess = (role: AppRole | null): boolean => {
  return isAtLeast(role, "branch_staff");
};

// Get role display label
export const getRoleLabel = (role: AppRole): string => {
  const labels: Record<AppRole, string> = {
    customer: "Customer",
    branch_staff: "Branch Staff",
    branch_manager: "Branch Manager",
    super_admin: "Super Admin",
  };
  return labels[role];
};
