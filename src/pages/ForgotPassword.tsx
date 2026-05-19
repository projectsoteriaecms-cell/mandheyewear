import { useState } from "react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MailCheck, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  useSEO({
    title: "Reset Password | Soteria Eye Clinic",
    description: "Reset your Soteria Eye Clinic account password.",
    noindex: true,
  });

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsLoading(false);

    if (error) {
      // Still show success to avoid account enumeration, but log
      console.error(error);
    }
    setSent(true);
    toast({
      title: "Check your email",
      description: "If an account exists for that email, a reset link has been sent.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-display">
                {sent ? "Check your email" : "Forgot password?"}
              </CardTitle>
              <CardDescription>
                {sent
                  ? "We've sent a password reset link to your inbox."
                  : "Enter your email and we'll send you a link to reset your password."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <MailCheck className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Didn't receive it? Check your spam folder or{" "}
                    <button
                      type="button"
                      onClick={() => setSent(false)}
                      className="text-primary font-medium hover:underline"
                    >
                      try again
                    </button>
                    .
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to sign in
                    </Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                  <div className="text-center text-sm">
                    <Link to="/login" className="text-muted-foreground hover:text-foreground inline-flex items-center">
                      <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                      Back to sign in
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
