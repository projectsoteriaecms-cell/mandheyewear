import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { on } from "@/shared/lib/events";

/**
 * Reacts to auth.signup_completed without ever calling useAuth() —
 * decoupled from the auth module's internal hook, subscribed to its event instead.
 * Mount once at the app root (see App.tsx).
 */
export const useWelcomeNotification = () => {
  useEffect(() => {
    return on("auth.signup_completed", async ({ userId }) => {
      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        title: "Welcome to M&H Eyewear",
        message: "Your account is set up. Explore our collection or book an eye exam to get started.",
        type: "info",
        link: "/shop",
      });
      if (error) {
        console.error("[useWelcomeNotification] failed to create welcome notification:", error);
      }
    });
  }, []);
};
