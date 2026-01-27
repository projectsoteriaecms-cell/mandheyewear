import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, User, LogOut, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { hasAdminAccess } from "@/lib/permissions";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Style Quiz", path: "/style-quiz", highlight: true },
  { name: "Eyeglasses", path: "/eyewear?category=eyeglasses" },
  { name: "Sunglasses", path: "/eyewear?category=sunglasses" },
  { name: "Eye Exams", path: "/booking" },
  { name: "Accessories", path: "/eyewear?category=accessories" },
];

export const MainNav = () => {
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
    }
  };

  return (
    <div className="bg-background/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Unified Brand */}
          <Link to="/" className="flex items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-primary">SOTERIA</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-xl font-display font-bold text-accent">M&H</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-smooth relative py-2",
                  link.highlight 
                    ? "text-accent hover:text-accent/80" 
                    : "text-foreground hover:text-primary",
                  location.pathname === link.path && "text-primary"
                )}
              >
                {link.highlight && (
                  <Sparkles className="h-3 w-3 inline-block mr-1 -mt-0.5" />
                )}
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Icon Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="h-5 w-5" />
            </Button>

            {/* Wishlist */}
            <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/dashboard?tab=wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>

            {/* Cart */}
            <CartDrawer />

            {/* Account */}
            {!loading && (
              isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    {isStaff && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
