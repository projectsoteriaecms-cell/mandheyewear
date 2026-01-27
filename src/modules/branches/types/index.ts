// Branches module types
import type { Tables } from "@/integrations/supabase/types";

export type Branch = Tables<"branches">;

export interface BranchAssignment {
  id: string;
  branch_id: string;
  is_primary: boolean;
  branch?: {
    id: string;
    name: string;
    city: string;
  };
}

export interface BranchContext {
  role: string | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  primaryBranchId: string | null;
  assignedBranchIds: string[];
  assignments: BranchAssignment[];
  hasBranchAccess: (branchId: string) => boolean;
  getBranchFilter: () => string | null;
  getBranchFilters: () => string[] | null;
}
