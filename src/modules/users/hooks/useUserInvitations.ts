import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { UserInvitation } from "../types";

export const useUserInvitations = () => {
  return useQuery({
    queryKey: ["user-invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserInvitation[];
    },
  });
};
