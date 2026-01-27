import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Heart, User, LogOut, Settings, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { hasAdminAccess } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Style Quiz", path: "/style-quiz", highlight: true, description: "Find your perfect frames" },
  { name: "Eyeglasses", path: "/eyewear?category=eyeglasses", description: "Prescription frames" },
  { name: "Sunglasses", path: "/eyewear?category=sunglasses", description: "UV protection & style" },
  { name: "Eye Exams", path: "/booking", description: "Book an appointment" },
  { name: "Accessories", path: "/eyewear?category=accessories", description: "Cases, cleaners & more" },
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
    <div className="lg:hidden bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="flex justify-between items-center h-16 px-4">
        {/* Menu Button */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <span className="text-xl font-display font-bold text-primary">SOTERIA</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-xl font-display font-bold text-accent">M&H</span>
              </SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col">
              {/* Navigation Links */}
              <nav className="flex flex-col py-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-6 py-4 transition-smooth",
                      link.highlight 
                        ? "bg-accent/10 border-l-4 border-accent" 
                        : "hover:bg-muted",
                      location.pathname === link.path && "bg-primary/10 border-l-4 border-primary"
                    )}
                  >
                    <div>
                      <div className={cn(
                        "font-medium flex items-center gap-2",
                        link.highlight ? "text-accent" : "text-foreground"
                      )}>
                        {link.highlight && <Sparkles className="h-4 w-4" />}
                        {link.name}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))}
              </nav>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Account Section */}
              <div className="p-6 space-y-3">
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
                        className="w-full justify-start text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Button variant="default" className="w-full" asChild>
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
        <Link to="/" className="flex items-center gap-1">
          <span className="text-lg font-display font-bold text-primary">SOTERIA</span>
          <span className="text-muted-foreground text-sm">|</span>
          <span className="text-lg font-display font-bold text-accent">M&H</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </div>
  );
};
