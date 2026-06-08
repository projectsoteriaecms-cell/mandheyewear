// Lovable OAuth replaced with native Supabase OAuth.
// This file is kept so existing imports don't break.
import { supabase } from "../supabase/client";

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: "google" | "apple",
      opts?: { redirect_uri?: string }
    ) => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri || window.location.origin,
        },
      });
      if (error) return { error };
      return { data, redirected: true };
    },
  },
};
