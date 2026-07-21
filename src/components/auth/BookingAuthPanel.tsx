import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useToast } from "@/shared/hooks/use-toast";
import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";
import { useAuth } from "@/modules/auth";

const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

export const BookingAuthPanel = () => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  // Sign in state
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // Sign up state
  const [suFullName, setSuFullName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPhone, setSuPhone] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suLoading, setSuLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [consentError, setConsentError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siEmail || !siPassword) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setSiLoading(true);
    const { error } = await signIn(siEmail, siPassword);
    setSiLoading(false);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You're signed in." });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suFullName || !suEmail || !suPhone || !suPassword || !suConfirm) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (!PHONE_REGEX.test(suPhone.trim())) {
      toast({ title: "Invalid phone number", description: "Please enter a valid phone number (e.g. +234 802 000 0000).", variant: "destructive" });
      return;
    }
    if (suPassword !== suConfirm) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (suPassword.length < 6) {
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

    setSuLoading(true);
    const { error } = await signUp(suEmail, suPassword, suFullName, suPhone.trim());
    setSuLoading(false);
    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created!", description: "You can now book your appointment." });
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Create Account</TabsTrigger>
      </TabsList>

      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="si-email">Email</Label>
            <Input id="si-email" type="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} disabled={siLoading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="si-password">Password</Label>
            <Input id="si-password" type="password" value={siPassword} onChange={(e) => setSiPassword(e.target.value)} disabled={siLoading} required />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={siLoading}>
            {siLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign In"}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="su-name">Full Name</Label>
            <Input id="su-name" value={suFullName} onChange={(e) => setSuFullName(e.target.value)} disabled={suLoading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-email">Email</Label>
            <Input id="su-email" type="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} disabled={suLoading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-phone">Phone Number</Label>
            <Input id="su-phone" type="tel" placeholder="+234 802 000 0000" value={suPhone} onChange={(e) => setSuPhone(e.target.value)} disabled={suLoading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-password">Password</Label>
            <div className="relative">
              <Input id="su-password" type={showPassword ? "text" : "password"} value={suPassword} onChange={(e) => setSuPassword(e.target.value)} disabled={suLoading} required />
              <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-confirm">Confirm Password</Label>
            <Input id="su-confirm" type={showPassword ? "text" : "password"} value={suConfirm} onChange={(e) => setSuConfirm(e.target.value)} disabled={suLoading} required />
          </div>

          <DataProtectionConsent
            consent={dataConsent}
            onConsentChange={(v) => { setDataConsent(v); if (v) setConsentError(""); }}
            marketing={marketingConsent}
            onMarketingChange={setMarketingConsent}
            disabled={suLoading}
            error={consentError}
            idPrefix="booking-signup"
          />

          <Button type="submit" variant="hero" className="w-full" disabled={suLoading}>
            {suLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create Account"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default BookingAuthPanel;
