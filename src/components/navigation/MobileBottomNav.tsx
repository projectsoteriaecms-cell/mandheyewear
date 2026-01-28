import { Link, useLocation } from "react-router-dom";
import { House, Bag, Calendar, MagnifyingGlass, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getIconWeight } from "@/components/ui/icon";

const bottomNavItems = [
  { name: "Home", path: "/", icon: House },
  { name: "Shop", path: "/eyewear", icon: Bag },
  { name: "Book", path: "/booking", icon: Calendar },
  { name: "Search", path: "/eyewear?search=true", icon: MagnifyingGlass },
  { name: "Account", path: "/dashboard", icon: User },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1 safe-area-x">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all touch-target touch-feedback no-select",
                "min-w-[56px]",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all",
                active && "bg-primary/10"
              )}>
                <Icon 
                  weight={getIconWeight(active)}
                  className={cn(
                    "h-5 w-5 transition-all",
                    active && "scale-110"
                  )} 
                />
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-all leading-tight",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
