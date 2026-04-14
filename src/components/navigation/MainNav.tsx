import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, User, SignOut, Gear, Sparkle, Camera } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { hasAdminAccess } from "@/shared/lib/permissions";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/lib/utils";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";

// Highlighted feature links
const highlightedLinks = [
  { name: "Style Quiz", path: "/style-quiz", icon: Sparkle },
  { name: "Virtual Try-On", path: "/try-on", icon: Camera },
];

// Category links
const categoryLinks = [
  { name: "Eyeglasses", path: "/shop?category=eyeglasses" },
  { name: "Sunglasses", path: "/shop?category=sunglasses" },
  { name: "Accessories", path: "/shop?category=accessories" },
  { name: "Eye Exams", path: "/booking" },
];

export const MainNav = () => {
  const location = useLocation();
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const { data: role } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const isStaff = hasAdminAccess(role ?? null);
  
  const isStaff = hasAdminAccess(role ?? null);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Error", description: "Failed to sign out.", variant: "destructive" });
    } else {
      toast({ title: "Signed Out", description: "You have been signed out." });
      navigate("/");
    }
  };

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={mhLogo} alt="M&H Eyewear" className="h-20 w-auto dark:hidden" />
            <img src={mhLogoGold} alt="M&H Eyewear" className="h-20 w-auto hidden dark:block" />
          </Link>

          {/* Inline Search Bar — Desktop only */}
          <div className="hidden lg:flex items-center flex-1 max-w-xl mx-4">
            <div
              className="flex items-center w-full h-10 rounded-full border border-border bg-muted/50 hover:border-primary/40 transition-colors cursor-text"
              onClick={() => setSearchOpen(true)}
            >
              {/* Category dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 px-3 h-full text-xs font-medium text-muted-foreground hover:text-foreground border-r border-border rounded-l-full bg-muted/80 whitespace-nowrap">
                    {searchCategories.find((c) => c.key === searchCategory)?.label}
                    <CaretDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-36">
                  {searchCategories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.key}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchCategory(cat.key);
                      }}
                      className={cn(cat.key === searchCategory && "bg-accent")}
                    >
                      {cat.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search text area */}
              <div
                className="flex-1 flex items-center px-3 h-full text-sm text-muted-foreground"
                onClick={() => setSearchOpen(true)}
              >
                Search eyewear, brands, styles...
              </div>

              {/* Search icon button */}
              <button
                className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground mr-1 hover:bg-primary/90 transition-colors"
                onClick={() => setSearchOpen(true)}
              >
                <MagnifyingGlass weight="bold" className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 flex-shrink-0">
            {/* Highlighted Feature Links */}
            {highlightedLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-smooth relative py-2 flex items-center gap-1.5",
                    "text-flame hover:text-flame/80",
                    location.pathname === link.path && "text-flame"
                  )}
                >
                  <Icon weight="duotone" className="h-4 w-4" />
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-flame rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Category Links */}
            {categoryLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path ||
                (link.path.includes("?") && location.search.includes(link.path.split("?")[1]));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium transition-smooth relative py-2",
                    "text-foreground/70 hover:text-foreground",
                    isActive && "text-foreground"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Icon Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Mobile search icon */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-foreground/70 hover:text-foreground hover:bg-muted" onClick={() => setSearchOpen(true)}>
                  <MagnifyingGlass weight="light" className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Search</p></TooltipContent>
            </Tooltip>

            {/* Wishlist */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" asChild className="text-foreground/70 hover:text-foreground hover:bg-muted">
                  <Link to="/dashboard?tab=wishlist">
                    <Heart weight="light" className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent><p>Wishlist</p></TooltipContent>
            </Tooltip>

            {/* Cart */}
            <CartDrawer />

            {/* Account */}
            {!loading && (isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground hover:bg-muted">
                        <User weight="light" className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>My Account</p></TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50 bg-popover">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">
                      <User weight="light" className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  {isStaff && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Gear weight="light" className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <SignOut weight="light" className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild className="text-foreground/70 hover:text-foreground">
                <Link to="/login">Sign In</Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
};
