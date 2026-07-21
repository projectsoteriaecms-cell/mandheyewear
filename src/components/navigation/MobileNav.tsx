import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, X, MagnifyingGlass, User, SignOut, Gear, Sparkle, Camera, CaretRight, MapPin, Calendar, Moon, Sun } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/cart/CartDrawer";

import { hasAdminAccess } from "@/shared/lib/permissions";
import { useToast } from "@/shared/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";
import { useAuth, useUserRole } from "@/modules/auth";

const navLinks = [
  { name: "Style Quiz", path: "/style-quiz", highlight: true, description: "Find your perfect frames", icon: Sparkle },
  { name: "Virtual Try-On", path: "/try-on", highlight: true, description: "See frames on your face", icon: Camera },
  { name: "Eyeglasses", path: "/shop?category=eyeglasses", description: "Prescription frames" },
  { name: "Sunglasses", path: "/shop?category=sunglasses", description: "UV protection & style" },
  { name: "Eye Exams", path: "/booking", description: "Book an appointment", icon: Calendar },
  { name: "Accessories", path: "/shop?category=accessories", description: "Cases, cleaners & more" },
  { name: "Find a Store", path: "/branches", description: "Visit us in person", icon: MapPin },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { data: role } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isStaff = hasAdminAccess(role ?? null);

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

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been signed out.",
      });
      navigate("/");
      setOpen(false);
    }
  };

  return (
    <div className="lg:hidden bg-background border-b border-border">
      <div className="flex justify-between items-center h-14 px-4">
        {/* Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground">
              <List weight="light" className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0" hideCloseButton>
            <SheetHeader className="p-4 border-b border-border bg-primary">
              <SheetTitle className="flex items-center justify-between">
                <img 
                  src={mhLogoGold} 
                  alt="M&H Eyewear" 
                  className="h-8 w-auto"
                />
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <X weight="light" className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col h-[calc(100vh-72px)]">
              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 transition-colors",
                        link.highlight 
                          ? "bg-accent/10 border-l-4 border-accent" 
                          : "hover:bg-muted border-l-4 border-transparent",
                        location.pathname === link.path && "bg-primary/10 border-l-4 border-primary"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && <Icon weight={link.highlight ? "duotone" : "light"} className={cn("h-5 w-5", link.highlight ? "text-accent" : "text-muted-foreground")} />}
                        <div>
                          <div className={cn(
                            "font-medium",
                            link.highlight ? "text-accent" : "text-foreground"
                          )}>
                            {link.name}
                          </div>
                          <p className="text-xs text-muted-foreground">{link.description}</p>
                        </div>
                      </div>
                      <CaretRight weight="light" className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </nav>

              {/* Theme Toggle */}
              <div className="border-t border-border p-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={toggleTheme}
                >
                  {isDark ? (
                    <>
                      <Sun weight="light" className="h-4 w-4 mr-2" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon weight="light" className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>
                  )}
                </Button>
              </div>

              {/* Account Section */}
              <div className="border-t border-border p-4 space-y-2">
                {!loading && (
                  isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/dashboard" onClick={() => setOpen(false)}>
                          <User weight="light" className="h-4 w-4 mr-2" />
                          My Account
                        </Link>
                      </Button>
                      {isStaff && (
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/admin" onClick={() => setOpen(false)}>
                            <Gear weight="light" className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                      >
                        <SignOut weight="light" className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link to="/login" onClick={() => setOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/signup" onClick={() => setOpen(false)}>
                          Create Account
                        </Link>
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/">
          <img 
            src={isDark ? mhLogoGold : mhLogo} 
            alt="M&H Eyewear" 
            className="h-9 w-auto"
          />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
            <MagnifyingGlass weight="light" className="h-5 w-5" />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </div>
  );
};
