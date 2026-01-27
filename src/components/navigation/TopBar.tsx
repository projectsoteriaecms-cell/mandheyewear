import { Link } from "react-router-dom";
import { MapPin, Calendar, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
    <div className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          {/* Left: Find a Store */}
          <Link 
            to="/branches" 
            className="flex items-center gap-1.5 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Find a Store</span>
          </Link>

          {/* Center: Unified Brand Logos */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={soteriaLogo} 
              alt="Soteria Eye Clinic" 
              className="h-6 w-auto brightness-0 invert"
            />
            <span className="text-primary-foreground/60">|</span>
            <img 
              src={mhLogo} 
              alt="M&H Eyewear" 
              className="h-6 w-auto brightness-0 invert"
            />
          </Link>

          {/* Right: Theme Toggle + Book Eye Exam */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Book Eye Exam */}
            <Button 
              variant="secondary" 
              size="sm" 
              asChild 
              className="h-7 text-xs font-medium bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              <Link to="/booking" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
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
