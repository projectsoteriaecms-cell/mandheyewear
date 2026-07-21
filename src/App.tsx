import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { AppRoutes } from "@/routes";
import { InstallPrompt, OfflineIndicator } from "@/components/pwa";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { useMetaPixelPageView } from "@/shared/hooks/useMetaPixel";
import { TourProvider, TourTooltip } from "@/components/tour";
import { FeedbackWidget } from "@/components/feedback";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { track } from "@/shared/lib/telemetry";
import { useWelcomeNotification, useOrderConfirmationNotification } from "@/modules/notifications";

const queryClient = new QueryClient();

// Component to handle Meta Pixel page view tracking within Router context
const MetaPixelTracker = () => {
  useMetaPixelPageView();
  return null;
};

// Records every route change so a visitor's journey can be replayed end to end,
// including for logged-out visitors.
const PageViewTracker = () => {
  const location = useLocation();
  useEffect(() => {
    void track("page.view", { path: location.pathname, search: location.search });
  }, [location.pathname, location.search]);
  return null;
};

// Mounts module event subscribers that react to platform events (e.g. auth.signup_completed)
// without importing hooks from the modules that emit them — see MODULE_CONTRACTS.md.
const PlatformEventSubscribers = () => {
  useWelcomeNotification();
  useOrderConfirmationNotification();
  return null;
};

const App = () => {
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TourProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <InstallPrompt variant="toast" />
          <TourTooltip />
          <FeedbackWidget />
          <BrowserRouter>
            <MetaPixelTracker />
            <PageViewTracker />
            <PlatformEventSubscribers />
            <AppRoutes />
            <WhatsAppButton />
          </BrowserRouter>
        </TourProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
