import { NavLink } from "react-router-dom";
import { Users, Target, Megaphone, ChartLine } from "lucide-react";
import { cn } from "@/shared/lib/utils";

const TABS = [
  { to: "/admin/crm/customers", label: "Customers", icon: Users },
  { to: "/admin/crm/segments",  label: "Segments",  icon: Target },
  { to: "/admin/crm/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/admin/crm/analytics", label: "Analytics", icon: ChartLine },
];

/** Shared sub-navigation across the four CRM admin tabs. */
export function CrmTabs() {
  return (
    <div className="border-b border-border">
      <nav className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
