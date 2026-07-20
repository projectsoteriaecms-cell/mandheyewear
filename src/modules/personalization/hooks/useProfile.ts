import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: existing, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      // Self-heal the profile from the signed-in session. The email always
      // lives on the auth user, and full_name/phone_number were saved into
      // user metadata at signup. This backfills anything the signup DB trigger
      // failed to persist, so the profile can never render blank for the
      // account that's actually logged in.
      const { data: sessionData } = await supabase.auth.getSession();
      const authUser = sessionData?.session?.user;

      // A different user is being viewed (e.g. staff/admin) — just return the
      // stored row without touching it.
      if (!authUser || authUser.id !== userId) {
        return (existing ?? null) as Profile | null;
      }

      const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;
      const filled = {
        user_id: userId,
        email: existing?.email ?? authUser.email ?? null,
        full_name:
          existing?.full_name ?? (meta.full_name as string | undefined) ?? null,
        phone_number:
          existing?.phone_number ??
          (meta.phone_number as string | undefined) ??
          null,
      };

      const needsWrite =
        !existing ||
        existing.email !== filled.email ||
        existing.full_name !== filled.full_name ||
        existing.phone_number !== filled.phone_number;

      if (!needsWrite) {
        return existing as Profile;
      }

      const { data: upserted, error: upsertError } = await supabase
        .from("profiles")
        .upsert(filled, { onConflict: "user_id" })
        .select()
        .single();

      if (upsertError) {
        // Persisting failed (e.g. RLS) — still surface the session values in
        // memory so the profile screen isn't blank for the current user.
        return { ...(existing ?? {}), ...filled } as Profile;
      }

      return upserted as Profile;
    },
    enabled: !!userId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: TablesUpdate<"profiles">;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["profile", variables.userId] });
    },
  });
};
