import {
  SquaresFour,
  Package,
  Truck,
  ArrowsLeftRight,
  Users,
  Gear,
  Bag,
  ChartBar,
  Buildings,
  Wrench,
  FolderSimple,
} from "@phosphor-icons/react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  children?: { title: string; href: string }[];
  requiresManager?: boolean;
  requiresSuperAdmin?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: SquaresFour,
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
    icon: Bag,
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
    icon: FolderSimple,
    requiresManager: true,
  },
  {
    title: "Branches",
    href: "/admin/branches",
    icon: Buildings,
    requiresSuperAdmin: true,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: ChartBar,
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
    icon: Gear,
    requiresSuperAdmin: true,
  },
];

export const filterNavItems = (
  items: NavItem[],
  isManager: boolean,
  isSuperAdmin: boolean
): NavItem[] => {
  return items.filter((item) => {
    if (item.requiresSuperAdmin && !isSuperAdmin) return false;
    if (item.requiresManager && !isManager) return false;
    return true;
  });
};
