import { Link } from "react-router-dom";
import { MapPin, Calendar, Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { SyncStatusIndicator } from "@/components/pwa/SyncStatusIndicator";
import soteriaLogo from "@/assets/soteria-logo.png";
import mhLogo from "@/assets/mh-logo.png";

export const TopBar = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);
  
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  return (
    <div className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Left: Find a Store */}
          <Link to="/branches" className="flex items-center gap-1.5 text-sm text-cream/70 hover:text-cream transition-colors">
            <MapPin weight="light" className="h-4 w-4" />
            <span className="hidden sm:inline">Find a Store</span>
          </Link>

          {/* Center: Unified Brand Logos */}
          

          {/* Right: Sync Status + Theme Toggle + Book Eye Exam */}
          <div className="flex items-center gap-2">
            {/* Sync Status Indicator */}
            <SyncStatusIndicator />

            {/* Theme Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-7 w-7 text-cream/70 hover:text-cream hover:bg-cream/10" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
                  {isDark ? <Sun weight="light" className="h-4 w-4" /> : <Moon weight="light" className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>{isDark ? "Switch to light mode" : "Switch to dark mode"}</p></TooltipContent>
            </Tooltip>

            {/* Book Eye Exam */}
            <Button variant="secondary" size="sm" asChild className="h-7 text-xs font-medium bg-flame text-white hover:bg-flame/90 border-0">
              <Link to="/booking" className="flex items-center gap-1.5">
                <Calendar weight="light" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Book Eye Exam</span>
                <span className="sm:hidden">Book</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
