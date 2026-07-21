import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { List, X, Storefront, CaretDown, CaretUp } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { navItems, filterNavItems, type NavItem } from "./sidebar/nav-config";

import { cn } from "@/lib/utils";
import { useUserRole } from "@/modules/auth";

export const AdminMobileNav = () => {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();
  const { data: role } = useUserRole();

  const isManager = role === "branch_manager" || role === "admin" || role === "super_admin";
  const isAdmin = role === "admin" || role === "super_admin";
  const isSuperAdmin = role === "super_admin";
  const filteredNavItems = filterNavItems(navItems, isManager, isSuperAdmin, isAdmin);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.title} className="space-y-1">
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" weight={active ? "duotone" : "light"} />
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <CaretUp className="h-4 w-4" weight="bold" />
            ) : (
              <CaretDown className="h-4 w-4" weight="bold" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-8 space-y-1 border-l border-border pl-3">
              {item.children!.map((child) => (
                <Link
                  key={child.href}
                  to={child.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-sm transition-colors",
                    location.pathname === child.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.title}
        to={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
          active
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" weight={active ? "duotone" : "light"} />
        <span>{item.title}</span>
      </Link>
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <List className="h-5 w-5" weight="light" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0" hideCloseButton>
        <SheetHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-base font-semibold">Admin Menu</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" weight="bold" />
          </Button>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-1">
            {filteredNavItems.map(renderNavItem)}
          </div>
        </ScrollArea>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <Storefront className="h-5 w-5" weight="duotone" />
            <span>Back to Store</span>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};
