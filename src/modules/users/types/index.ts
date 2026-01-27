// Users module types
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface UserInvitation {
  id: string;
  email: string;
  role: AppRole;
  invitation_token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

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

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole | null;
  created_at: string;
  branch_assignments?: BranchAssignment[];
}
