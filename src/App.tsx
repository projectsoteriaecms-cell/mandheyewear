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

const queryClient = new QueryClient();

// Component to handle Meta Pixel page view tracking within Router context
const MetaPixelTracker = () => {
  useMetaPixelPageView();
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TourProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <InstallPrompt variant="toast" />
          <TourTooltip />
          <BrowserRouter>
            <MetaPixelTracker />
            <AppRoutes />
            <WhatsAppButton />
          </BrowserRouter>
        </TourProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
