import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Heart, User, LogOut, Settings, Sparkles, ChevronRight, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { hasAdminAccess } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import soteriaLogo from "@/assets/soteria-logo.png";
import mhLogo from "@/assets/mh-logo.png";

const navLinks = [
  { name: "Style Quiz", path: "/style-quiz", highlight: true, description: "Find your perfect frames", icon: Sparkles },
  { name: "Eyeglasses", path: "/eyewear?category=eyeglasses", description: "Prescription frames" },
  { name: "Sunglasses", path: "/eyewear?category=sunglasses", description: "UV protection & style" },
  { name: "Eye Exams", path: "/booking", description: "Book an appointment", icon: Calendar },
  { name: "Accessories", path: "/eyewear?category=accessories", description: "Cases, cleaners & more" },
  { name: "Find a Store", path: "/branches", description: "Visit us in person", icon: MapPin },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { data: role } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isStaff = hasAdminAccess(role ?? null);

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
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
            <SheetHeader className="p-4 border-b border-border bg-primary">
              <SheetTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src={soteriaLogo} 
                    alt="Soteria" 
                    className="h-7 w-auto brightness-0 invert"
                  />
                  <span className="text-primary-foreground/50">|</span>
                  <img 
                    src={mhLogo} 
                    alt="M&H" 
                    className="h-7 w-auto brightness-0 invert"
                  />
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <X className="h-5 w-5" />
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
                        {Icon && <Icon className={cn("h-5 w-5", link.highlight ? "text-accent" : "text-muted-foreground")} />}
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
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </nav>

              {/* Account Section */}
              <div className="border-t border-border p-4 space-y-2">
                {!loading && (
                  isAuthenticated ? (
                    <>
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to="/dashboard" onClick={() => setOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          My Account
                        </Link>
                      </Button>
                      {isStaff && (
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/admin" onClick={() => setOpen(false)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
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

        {/* Logo - Using actual images */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            src={soteriaLogo} 
            alt="Soteria" 
            className="h-8 w-auto dark:invert dark:brightness-[1.2]"
          />
          <span className="text-border">|</span>
          <img 
            src={mhLogo} 
            alt="M&H" 
            className="h-8 w-auto dark:invert dark:brightness-[1.2]"
          />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </div>
  );
};
