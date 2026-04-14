import { Link, useLocation } from "react-router-dom";
import { House, Storefront, Calendar, MagnifyingGlass, User } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { getIconWeight } from "@/components/ui/icon";
import { useState } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";

const bottomNavItems = [
  { name: "Home", path: "/", icon: House },
  { name: "Shop", path: "/shop", icon: Storefront },
  { name: "Book", path: "/booking", icon: Calendar },
  { name: "Search", path: "search", icon: MagnifyingGlass },
  { name: "Account", path: "/dashboard", icon: User },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "search") return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path.split("?")[0]);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-1 safe-area-x">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isSearch = item.path === "search";
            const active = isActive(item.path);
            
            if (isSearch) {
              return (
                <button
                  key={item.name}
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all touch-target touch-feedback no-select",
                    "min-w-[56px]",
                    "text-muted-foreground active:text-foreground"
                  )}
                >
                  <div className="relative p-1.5 rounded-xl transition-all">
                    <Icon weight="regular" className="h-5 w-5 transition-all" />
                  </div>
                  <span className="text-[10px] font-medium transition-all leading-tight text-muted-foreground">
                    {item.name}
                  </span>
                </button>
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
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
