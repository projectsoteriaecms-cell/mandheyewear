import { useState } from "react";
import { Sparkles, Camera, Zap, Smartphone, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { DataProtectionConsent } from "@/components/legal/DataProtectionConsent";
import { toast } from "sonner";

interface LiveARComingSoonProps {
  onSwitchToPhoto: () => void;
}

const features = [
  { icon: Zap, title: "Instant preview", description: "Frames track your face in real time" },
  { icon: CheckCircle2, title: "True-to-life fit", description: "Accurate sizing using face measurements" },
  { icon: Smartphone, title: "Works on mobile", description: "Just point your phone — no app needed" },
];

export const LiveARComingSoon = ({ onSwitchToPhoto }: LiveARComingSoonProps) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !consent) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("brevo-sync", {
        body: {
          brand_line: "m_and_h_fashion",
          email,
          source: "live_ar_waitlist",
          consent_marketing: true,
          attributes: { WAITLIST: "live_ar" },
          event: { type: "live_ar_waitlist_joined" },
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("You're on the list — we'll email you the moment Live AR launches.");
    } catch (err) {
      console.error("Live AR waitlist error:", err);
      toast.error("Couldn't add you right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border">
      <div className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background p-8 sm:p-12 text-center">
        <div className="inline-flex p-4 rounded-full bg-accent/15 mb-5">
          <Sparkles className="h-10 w-10 text-accent" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-3">
          Live AR Try-On is almost here
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-2">
          See frames track your face in real time — move your head, tilt, smile, and watch them fit naturally.
        </p>
        <p className="text-xs text-muted-foreground/80 italic">
          Currently in development — Photo Mode works great today.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/30">
                <Icon className="h-6 w-6 text-accent mb-2" />
                <p className="font-medium text-sm text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
              </div>
            );
          })}
        </div>

        {submitted ? (
          <div className="text-center p-6 rounded-lg bg-accent/10 border border-accent/20">
            <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-medium text-foreground">You're on the list</p>
            <p className="text-sm text-muted-foreground mt-1">
              We'll email <strong>{email}</strong> the moment Live AR goes live.
            </p>
          </div>
        ) : (
          <form onSubmit={handleNotify} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={submitting || !consent || !email}>
                {submitting ? "Adding..." : "Notify Me"}
              </Button>
            </div>
            <DataProtectionConsent consent={consent} onConsentChange={setConsent} compact idPrefix="live-ar-waitlist" />
          </form>
        )}

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <Camera className="h-5 w-5 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground flex-1">
            Want to try frames right now? Photo Mode uses AI to show you any frame in seconds.
          </p>
          <Button variant="outline" size="sm" onClick={onSwitchToPhoto}>
            Try Photo Mode
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
