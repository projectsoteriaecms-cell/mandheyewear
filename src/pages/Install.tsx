import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Smartphone, Check, Share, Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

const Install = () => {
  const { isInstallable, isInstalled, promptInstall, canPrompt } = usePWA();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInstalled) {
      // Redirect to home if already installed
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInstalled, navigate]);

  const handleInstall = async () => {
    await promptInstall();
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  if (isInstalled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-semibold text-center mb-2">
          Already Installed!
        </h1>
        <p className="text-muted-foreground text-center max-w-sm">
          You're all set. Redirecting you to the app...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg">
          <Smartphone className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <h1 className="text-3xl font-display font-semibold mb-3">
          Install M&H Eyewear
        </h1>
        
        <p className="text-muted-foreground max-w-md mb-8">
          Get quick access to eye care appointments, shop eyewear, and use our AI try-on feature—all from your home screen.
        </p>

        {/* Benefits */}
        <div className="grid gap-4 max-w-sm w-full mb-8">
          {[
            { icon: "⚡", text: "Faster loading & offline access" },
            { icon: "🔔", text: "Appointment reminders" },
            { icon: "👓", text: "Quick access to try-on" },
            { icon: "📱", text: "Native app experience" },
          ].map((benefit, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-left bg-card border rounded-lg p-3"
            >
              <span className="text-xl">{benefit.icon}</span>
              <span className="text-sm">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* Install Button or Instructions */}
        {canPrompt ? (
          <Button size="lg" onClick={handleInstall} className="gap-2 px-8">
            <Download className="h-5 w-5" />
            Install Now
          </Button>
        ) : (
          <div className="bg-card border rounded-xl p-6 max-w-sm w-full">
            <h3 className="font-medium mb-4">How to install:</h3>
            
            {isIOS ? (
              <ol className="space-y-3 text-sm text-left">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</span>
                  <span>Tap the <Share className="inline h-4 w-4 mx-1" /> Share button in Safari</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">2</span>
                  <span>Scroll down and tap <Plus className="inline h-4 w-4 mx-1" /> "Add to Home Screen"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">3</span>
                  <span>Tap "Add" to confirm</span>
                </li>
              </ol>
            ) : isAndroid ? (
              <ol className="space-y-3 text-sm text-left">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">1</span>
                  <span>Tap the <MoreVertical className="inline h-4 w-4 mx-1" /> menu in Chrome</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">2</span>
                  <span>Tap "Add to Home screen"</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">3</span>
                  <span>Tap "Add" to confirm</span>
                </li>
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Look for the install option in your browser's menu or address bar.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <Button variant="ghost" onClick={() => navigate("/")}>
          Continue in browser
        </Button>
      </div>
    </div>
  );
};

export default Install;
