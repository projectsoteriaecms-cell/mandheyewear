import { Link, useLocation } from "react-router-dom";
import { House, Storefront, Calendar, Camera, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getIconWeight } from "@/components/ui/icon";
import { track } from "@/shared/lib/telemetry";

// Search dropped from the tab bar -- SearchStrip already sits under the
// header on every page, so the slot was duplicate real estate. Try-On takes
// it instead: raised out of the bar like a camera-shutter button, the single
// highest-visibility way to put the feature one thumb-tap from any screen.
const bottomNavItems = [
  { name: "Home", path: "/", icon: House },
  { name: "Shop", path: "/shop", icon: Storefront },
  { name: "Try-On", path: "/try-on", icon: Camera, elevated: true },
  { name: "Book", path: "/booking", icon: Calendar },
  { name: "Account", path: "/dashboard", icon: User },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1 safe-area-x">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            if (item.elevated) {
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => track("tryon.nav_button_tapped", { source: "bottom_nav" })}
                  className="flex flex-col items-center justify-center gap-1 -mt-6 touch-target touch-feedback no-select"
                  aria-label="Virtual Try-On"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center h-12 w-12 rounded-full shadow-gold transition-all",
                      "bg-mh-gold text-ink",
                      active ? "scale-105 shadow-lg" : "hover:scale-105"
                    )}
                  >
                    <Icon weight="fill" className="h-6 w-6" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-semibold leading-tight",
                      active ? "text-mh-gold" : "text-muted-foreground"
                    )}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all touch-target touch-feedback no-select",
                  "min-w-[56px]",
                  active 
                    ? "text-mh-gold" 
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                <div className={cn(
                  "relative p-1.5 rounded-xl transition-all",
                  active && "bg-mh-gold/10"
                )}>
                  <Icon 
                    weight={getIconWeight(active)}
                    className={cn(
                      "h-5 w-5 transition-all",
                      active && "scale-110"
                    )} 
                  />
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mh-gold" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium transition-all leading-tight",
                  active ? "text-mh-gold" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
