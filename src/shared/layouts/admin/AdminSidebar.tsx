import { Link } from "react-router-dom";
import { useState } from "react";
import { Package, ArrowsLeftRight } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/utils";

import { NavMenuItem, navItems, filterNavItems } from "./sidebar";
import { useIsManager, useIsAdmin, useIsSuperAdmin } from "@/modules/auth";

export const AdminSidebar = () => {
  const { isManager } = useIsManager();
  const { isAdmin } = useIsAdmin();
  const { isSuperAdmin } = useIsSuperAdmin();
  const [openMenus, setOpenMenus] = useState<string[]>(["Inventory"]);

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const filteredItems = filterNavItems(navItems, isManager, isSuperAdmin, isAdmin);

  return (
    <aside className="w-64 border-r bg-card min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <Link to="/admin" className="flex items-center gap-2">
          <Package weight="duotone" className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">ECMS Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => (
          <NavMenuItem
            key={item.href}
            item={item}
            isOpen={openMenus.includes(item.title)}
            onToggle={() => toggleMenu(item.title)}
          />
        ))}
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowsLeftRight weight="light" className="h-4 w-4" />
          Back to Store
        </Link>
      </div>
    </aside>
  );
};
