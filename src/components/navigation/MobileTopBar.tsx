import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { List, X, Heart, Bag, Moon, Sun, Info, Sparkle, Camera, Gear, SignOut, Eyeglasses, SunDim, Watch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUserRole } from "@/modules/auth/hooks/useUserRole";
import { hasAdminAccess } from "@/shared/lib/permissions";
import { useToast } from "@/shared/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/modules/orders/hooks/useCart";
import { cn } from "@/lib/utils";
import mhLogo from "@/assets/mh-logo.png";
import mhLogoGold from "@/assets/mh-logo-gold.png";

const menuItems = [{
  name: "Style Quiz",
  path: "/style-quiz",
  icon: Sparkle,
  highlight: true,
  description: "Find your perfect frames"
}, {
  name: "Virtual Try-On",
  path: "/try-on",
  icon: Camera,
  highlight: true,
  description: "See frames on your face"
}, {
  name: "Eyeglasses",
  path: "/eyewear?category=eyeglasses",
  icon: Eyeglasses,
  description: "Prescription frames"
}, {
  name: "Sunglasses",
  path: "/eyewear?category=sunglasses",
  icon: SunDim,
  description: "UV protection & style"
}, {
  name: "Accessories",
  path: "/eyewear?category=accessories",
  icon: Watch,
  description: "Cases, cleaners & more"
}, {
  name: "About Us",
  path: "/about",
  icon: Info,
  description: "Our story"
}];
export const MobileTopBar = () => {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const {
    user,
    loading,
    signOut,
    isAuthenticated
  } = useAuth();
  const {
    data: role
  } = useUserRole();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    cartItems
  } = useCart();
  const isStaff = hasAdminAccess(role ?? null);
  const cartCount = cartItems?.length || 0;
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
    const {
      error
    } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed Out",
        description: "You have been signed out."
      });
      navigate("/");
      setOpen(false);
    }
  };
  return <div className="lg:hidden bg-background/95 backdrop-blur-lg border-b border-border relative">
      <div className="flex justify-between items-center h-14 px-4">
        {/* Left: Hamburger Menu + Theme Toggle */}
        <div className="flex items-center gap-1">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground -ml-2">
                <List weight="light" className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 flex flex-col" hideCloseButton>
              {/* Header */}
              <SheetHeader className="p-4 border-b border-border bg-primary">
                <SheetTitle className="flex items-center justify-between">
                  <img src={mhLogo} alt="M&H Eyewear" className="h-12 w-auto brightness-0 invert" />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 -mr-2">
                      <X weight="light" className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </SheetTitle>
              </SheetHeader>
              
              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto py-2">
                {menuItems.map(item => {
                const Icon = item.icon;
                return <Link key={item.name} to={item.path} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted", item.highlight && "bg-accent/10")}>
                      <Icon weight={item.highlight ? "duotone" : "light"} className={cn("h-5 w-5", item.highlight ? "text-accent" : "text-muted-foreground")} />
                      <div>
                        <div className={cn("font-medium text-sm", item.highlight ? "text-accent" : "text-foreground")}>
                          {item.name}
                        </div>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>;
              })}
              </nav>

              {/* Theme & Account Section */}
              <div className="border-t border-border p-4 space-y-3">
                {/* Theme Toggle */}
                <Button variant="outline" className="w-full justify-start" onClick={toggleTheme}>
                  {isDark ? <>
                      <Sun weight="light" className="h-4 w-4 mr-2" />
                      Light Mode
                    </> : <>
                      <Moon weight="light" className="h-4 w-4 mr-2" />
                      Dark Mode
                    </>}
                </Button>

                <Separator />

                {/* Account */}
                {!loading && (isAuthenticated ? <div className="space-y-2">
                      {isStaff && <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/admin" onClick={() => setOpen(false)}>
                            <Gear weight="light" className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>}
                      <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleSignOut}>
                        <SignOut weight="light" className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div> : <div className="space-y-2">
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
                    </div>)}
              </div>
            </SheetContent>
          </Sheet>

          {/* Theme Toggle Icon - Visible on top bar */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-foreground/70 hover:text-foreground">
            {isDark ? <Sun weight="light" className="h-5 w-5" /> : <Moon weight="light" className="h-5 w-5" />}
          </Button>
        </div>

        {/* Logo - Centered */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={isDark ? mhLogoGold : mhLogo} alt="M&H Eyewear" className="h-9 w-auto" />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild className="text-foreground/70 hover:text-foreground">
            <Link to="/dashboard?tab=wishlist">
              <Heart weight="light" className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="text-foreground/70 hover:text-foreground relative">
            <Link to="/checkout">
              <Bag weight="light" className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-medium flex items-center justify-center text-accent-foreground">
                  {cartCount}
                </span>}
            </Link>
          </Button>
        </div>
      </div>
    </div>;
};