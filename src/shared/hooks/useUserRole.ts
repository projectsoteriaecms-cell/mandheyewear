import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data?.role as AppRole | null;
    },
    enabled: !!user?.id,
  });
};

export const useIsStaff = () => {
  const { data: role, isLoading } = useUserRole();
  const staffRoles: AppRole[] = ["branch_staff", "branch_manager", "super_admin"];
  return {
    isStaff: role ? staffRoles.includes(role) : false,
    isLoading,
  };
};

export const useIsManager = () => {
  const { data: role, isLoading } = useUserRole();
  const managerRoles: AppRole[] = ["branch_manager", "super_admin"];
  return {
    isManager: role ? managerRoles.includes(role) : false,
    isLoading,
  };
};

export const useIsSuperAdmin = () => {
  const { data: role, isLoading } = useUserRole();
  return {
    isSuperAdmin: role === "super_admin",
    isLoading,
  };
};
