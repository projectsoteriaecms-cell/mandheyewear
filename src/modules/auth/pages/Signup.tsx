import { useState, useEffect } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";
import { GoogleLogo } from "@phosphor-icons/react";
import type { AppRole } from "../hooks/useUserRole";

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

const Signup = () => {
  useSEO({ title: "Create Account | M&H Eyewear", description: "Join M&H Eyewear for premium eye care and designer eyewear.", noindex: true });
  const [searchParams] = useSearchParams();
  const invitedEmail = searchParams.get("email");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(invitedEmail || "");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const { trackCompleteRegistration } = useMetaPixel();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      setIsGoogleLoading(false);
      toast({ title: "Google Sign In Failed", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (invitedEmail) setEmail(invitedEmail);
  }, [invitedEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    if (!PHONE_REGEX.test(phoneNumber.trim())) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number (e.g. +234 802 000 0000).", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (!dataConsent) {
      setConsentError("Please consent to data processing to create your account.");
      toast({
        title: "Consent Required",
        description: "We need your consent under the Nigeria Data Protection Act to create your account.",
        variant: "destructive",
      });
      return;
    }
    setConsentError("");

    setIsLoading(true);
    const { error } = await signUp(email, password, fullName, phoneNumber.trim());
    setIsLoading(false);

    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      return;
    }

    trackCompleteRegistration();

    const STAFF_ROLES: AppRole[] = ["branch_staff", "branch_manager", "admin", "super_admin"];
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    if (userId) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleData?.role && STAFF_ROLES.includes(roleData.role as AppRole)) {
        toast({ title: "Welcome!", description: "Redirecting to admin portal." });
        navigate("/admin");
      } else {
        toast({ title: "Account Created!", description: "Let's personalize your experience." });
        navigate("/onboarding");
      }
    } else {
      // No session yet means email confirmation is required. Send the user
      // straight to the verify screen (pre-filled with their email) instead of
      // leaving them on the form to guess what to do next.
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Benefits strip — shown only to regular sign-ups (not invited team members) */}
          {!invitedEmail && (
            <div className="mb-5 flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">✦ Free virtual try-on</span>
              <span className="flex items-center gap-1.5">✦ Personalised style picks</span>
              <span className="flex items-center gap-1.5">✦ Order tracking & history</span>
            </div>
          )}
          <Card data-tour="signup-form">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">
                {invitedEmail ? "Complete Your Registration" : "Create Account"}
              </CardTitle>
              <CardDescription>
                {invitedEmail
                  ? "You've been invited to join the team. Complete your registration below."
                  : "Join us for premium eye care and designer eyewear"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Google sign-up — only for regular (non-invited) users */}
              {!invitedEmail && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleLogo weight="bold" className="mr-2 h-4 w-4" />
                    )}
                    Continue with Google
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
                    </div>
                  </div>
                </>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || !!invitedEmail}
                    readOnly={!!invitedEmail}
                    required
                    className={invitedEmail ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+234 802 000 0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>

                <DataProtectionConsent
                  consent={dataConsent}
                  onConsentChange={(v) => { setDataConsent(v); if (v) setConsentError(""); }}
                  marketing={marketingConsent}
                  onMarketingChange={setMarketingConsent}
                  disabled={isLoading}
                  error={consentError}
                  idPrefix="signup"
                />

                <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Signup;
