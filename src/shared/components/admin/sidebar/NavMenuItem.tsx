import { Link, useLocation } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { NavItem } from "./nav-config";

interface NavMenuItemProps {
  item: NavItem;
  isOpen: boolean;
  onToggle: () => void;
}

export const NavMenuItem = ({ item, isOpen, onToggle }: NavMenuItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === item.href;
  const isParentActive = item.children?.some(
    (child) => location.pathname === child.href
  );

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={onToggle}>
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
                isOpen && "rotate-180"
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
};
