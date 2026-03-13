import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/shared/hooks/usePWA";
import { cn } from "@/lib/utils";

interface InstallPromptProps {
  variant?: "banner" | "toast";
  className?: string;
}

export const InstallPrompt = ({ variant = "banner", className }: InstallPromptProps) => {
  const { isInstallable, isInstalled, promptInstall, dismissInstallPrompt } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        setDismissed(true);
        return;
      }
    }

    // Delay showing to not interrupt initial page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    dismissInstallPrompt();
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setDismissed(true);
    }
  };

  if (!isInstallable || isInstalled || dismissed || !isVisible) {
    return null;
  }

  if (variant === "toast") {
    return (
      <div
        className={cn(
          "fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50",
          "bg-card border border-border rounded-xl shadow-2xl p-4",
          "animate-fade-in",
          className
        )}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm">Install M&H Eyewear</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to your home screen for quick access
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-xs"
          >
            Not now
          </Button>
          <Button
            size="sm"
            onClick={handleInstall}
            className="flex-1 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Install
          </Button>
        </div>
      </div>
    );
  }

  // Banner variant
  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground",
        "animate-fade-in",
        className
      )}
    >
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Download className="h-4 w-4 flex-shrink-0" />
          <p className="text-sm font-medium truncate">
            Install app for the best experience
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleInstall}
            className="text-xs h-7 px-3"
          >
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-primary-foreground/10 rounded transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
