import { useState, useEffect, useRef } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { hasAdminAccess } from "@/shared/lib/permissions";
import type { Database } from "@/integrations/supabase/types";
import { Loader2, MailCheck, CheckCircle2 } from "lucide-react";
import { track, trackError } from "@/shared/lib/telemetry";

type AppRole = Database["public"]["Enums"]["app_role"];

// Supabase is configured with an 8-digit email OTP (mailer_otp_length = 8).
const CODE_LENGTH = 8;
const RESEND_COOLDOWN = 60; // seconds

const VerifyEmail = () => {
  useSEO({ title: "Verify Your Email | M&H Eyewear", description: "Confirm your email to activate your M&H Eyewear account.", noindex: true });
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const { verifyEmailOtp, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // No email in the URL means the user landed here directly — send them to sign up.
  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Resend cooldown ticker.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const routeAfterVerify = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId) {
      navigate("/login");
      return;
    }
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    const role = roleData?.role as AppRole | null;
    navigate(hasAdminAccess(role) ? "/admin" : "/onboarding");
  };

  const handleVerify = async (submittedCode?: string) => {
    const value = (submittedCode ?? code).trim();
    if (value.length !== CODE_LENGTH) {
      setError(`Please enter the full ${CODE_LENGTH}-digit code from your email.`);
      return;
    }
    setError("");
    setIsVerifying(true);
    const { error: verifyError } = await verifyEmailOtp(email, value);
    setIsVerifying(false);

    if (verifyError) {
      const msg = verifyError.message?.toLowerCase() || "";
      // error-clarity: state the cause AND the fix, never a raw code.
      if (msg.includes("expired")) {
        setError("That code has expired. Tap “Resend code” below to get a fresh one.");
      } else if (msg.includes("invalid") || msg.includes("token")) {
        setError("That code doesn’t match. Check the latest email and re-enter it, or resend a new code.");
      } else {
        setError(verifyError.message || "We couldn’t verify that code. Please try again.");
      }
      void trackError("email.verify_failed", verifyError, { reason: msg.slice(0, 60) });
      setCode("");
      inputRef.current?.focus();
      return;
    }

    // success-feedback: confirm visually before moving on.
    setSucceeded(true);
    void track("email.verify_succeeded");
    toast({ title: "Email verified 🎉", description: "Your account is now active." });
    setTimeout(routeAfterVerify, 900);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsResending(true);
    const { error: resendError } = await resendConfirmation(email);
    setIsResending(false);
    if (resendError) {
      toast({ title: "Couldn’t resend", description: resendError.message, variant: "destructive" });
      void trackError("email.resend_failed", resendError);
      return;
    }
    void track("email.resend_succeeded");
    setCooldown(RESEND_COOLDOWN);
    setError("");
    toast({ title: "Code sent", description: `A new code is on its way to ${email}.` });
  };

  const handleCodeChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (error) setError("");
    // Auto-submit the moment a full code is entered/pasted/autofilled.
    if (digits.length === CODE_LENGTH) handleVerify(digits);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                {succeeded ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                ) : (
                  <MailCheck className="h-7 w-7 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl font-display">
                {succeeded ? "You’re all set" : "Check your email"}
              </CardTitle>
              <CardDescription>
                {succeeded ? (
                  "Taking you to your account…"
                ) : (
                  <>
                    We sent an {CODE_LENGTH}-digit code to{" "}
                    <span className="font-medium text-foreground">{email}</span>. Enter it below to
                    activate your account.
                  </>
                )}
              </CardDescription>
            </CardHeader>

            {!succeeded && (
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]*"
                    maxLength={CODE_LENGTH}
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                    disabled={isVerifying}
                    aria-label="Verification code"
                    aria-invalid={!!error}
                    placeholder={"•".repeat(CODE_LENGTH)}
                    className="w-full rounded-xl border bg-background px-4 py-4 text-center font-mono text-2xl tracking-[0.4em] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                  />
                  {error && (
                    <p role="alert" className="text-sm text-destructive">
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || code.length !== CODE_LENGTH}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify & continue"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn’t get it? Check spam, or{" "}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || isResending}
                    className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {isResending
                      ? "sending…"
                      : cooldown > 0
                      ? `resend code in ${cooldown}s`
                      : "resend code"}
                  </button>
                  .
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  You can also tap the <span className="font-medium">Verify My Email</span> button in
                  that email — it does the same thing.
                </p>
              </CardContent>
            )}
          </Card>

          <div className="mt-6 text-center text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-primary">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;
