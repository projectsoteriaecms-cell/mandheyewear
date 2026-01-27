import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import {
  LayoutDashboard,
  Package,
  Truck,
  ArrowLeftRight,
  Users,
  Settings,
  ShoppingBag,
  BarChart3,
  ChevronDown,
  Building2,
  Wrench,
  FolderTree,
} from "lucide-react";
import { useIsManager, useIsSuperAdmin } from "@/shared/hooks/useUserRole";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
  requiresManager?: boolean;
  requiresSuperAdmin?: boolean;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    href: "/admin/inventory",
    icon: Package,
    children: [
      { title: "Stock Overview", href: "/admin/inventory" },
      { title: "Purchase Orders", href: "/admin/inventory/purchase-orders" },
      { title: "Stock Transfers", href: "/admin/inventory/transfers" },
      { title: "Adjustments", href: "/admin/inventory/adjustments" },
      { title: "Transactions", href: "/admin/inventory/transactions" },
    ],
  },
  {
    title: "Suppliers",
    href: "/admin/suppliers",
    icon: Truck,
    requiresManager: true,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
    requiresManager: true,
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Wrench,
    requiresManager: true,
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
    requiresManager: true,
  },
  {
    title: "Branches",
    href: "/admin/branches",
    icon: Building2,
    requiresSuperAdmin: true,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
    requiresManager: true,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    requiresSuperAdmin: true,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
    requiresSuperAdmin: true,
  },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const { isManager } = useIsManager();
  const { isSuperAdmin } = useIsSuperAdmin();
  const [openMenus, setOpenMenus] = useState<string[]>(["Inventory"]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const filteredItems = navItems.filter((item) => {
    if (item.requiresSuperAdmin && !isSuperAdmin) return false;
    if (item.requiresManager && !isManager) return false;
    return true;
  });

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ECMS Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.href;
          const isParentActive = item.children?.some(
            (child) => location.pathname === child.href
          );

          if (item.children) {
            return (
              <Collapsible
                key={item.title}
                open={openMenus.includes(item.title)}
                onOpenChange={() => toggleMenu(item.title)}
              >
                <CollapsibleTrigger className="w-full">
                  <div
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isParentActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openMenus.includes(item.title) && "rotate-180"
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-10 space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        "block px-3 py-2 rounded-md text-sm transition-colors",
                        location.pathname === child.href
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      {child.title}
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
};
