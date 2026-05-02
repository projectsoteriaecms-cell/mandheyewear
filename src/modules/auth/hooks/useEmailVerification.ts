import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "@/shared/hooks/use-toast";

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = "email_verification_resent_at";

const readCooldown = () => {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return 0;
  const sentAt = Number(raw);
  if (!Number.isFinite(sentAt)) return 0;
  const remaining = Math.ceil((sentAt + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
  return remaining > 0 ? remaining : 0;
};

export const useEmailVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => readCooldown());

  // Tick down the cooldown every second when active
  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldownSeconds(readCooldown());
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  const isVerified = Boolean(user?.email_confirmed_at);
  const email = user?.email ?? null;
  const verifiedAt = user?.email_confirmed_at ?? null;

  const resend = useCallback(async () => {
    if (!email) {
      toast({
        title: "No email on file",
        description: "We can't find an email address for your account.",
        variant: "destructive",
      });
      return { error: new Error("no_email") };
    }

    if (cooldownSeconds > 0) {
      return { error: new Error("cooldown") };
    }

    setIsResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setIsResending(false);

    if (error) {
      // If the email is already confirmed, refresh session so UI self-hides
      if (error.message?.toLowerCase().includes("already confirmed")) {
        await supabase.auth.refreshSession();
        toast({
          title: "Already verified",
          description: "Your email is already confirmed. Welcome aboard!",
        });
        return { error: null };
      }

      toast({
        title: "Couldn't resend email",
        description: error.message ?? "Please try again in a moment.",
        variant: "destructive",
      });
      return { error };
    }

    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setCooldownSeconds(COOLDOWN_SECONDS);
    toast({
      title: "Confirmation email sent",
      description: `We've sent a fresh link to ${email}. Check your inbox (and spam folder).`,
    });
    return { error: null };
  }, [email, cooldownSeconds, toast]);

  const updateEmail = useCallback(
    async (newEmail: string) => {
      const trimmed = newEmail.trim();
      if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        toast({
          title: "Invalid email",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return { error: new Error("invalid_email") };
      }
      if (trimmed.toLowerCase() === email?.toLowerCase()) {
        toast({
          title: "Same email",
          description: "That's the email already on your account.",
        });
        return { error: new Error("same_email") };
      }

      const { error } = await supabase.auth.updateUser(
        { email: trimmed },
        { emailRedirectTo: window.location.origin },
      );

      if (error) {
        toast({
          title: "Couldn't update email",
          description: error.message ?? "Please try again.",
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Confirmation sent",
        description: `Check ${trimmed} for a verification link to confirm the change.`,
      });
      return { error: null };
    },
    [email, toast],
  );

  return {
    isVerified,
    email,
    verifiedAt,
    resend,
    updateEmail,
    isResending,
    cooldownSeconds,
  };
};
