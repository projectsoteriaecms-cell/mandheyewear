import { Bell, SignOut, User, Gear } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/shared/hooks/useAuth";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Placeholder notifications - will be replaced with real data
const PLACEHOLDER_NOTIFICATIONS = [
  {
    id: "1",
    title: "Low Stock Alert",
    message: "5 products are running low on stock",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    title: "New Order Received",
    message: "Order #ORD-2024-001 needs processing",
    time: "4 hours ago",
    read: false,
  },
  {
    id: "3",
    title: "Transfer Request",
    message: "Stock transfer from Lagos HQ pending approval",
    time: "1 day ago",
    read: true,
  },
];

export const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const { data: role } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "branch_manager":
        return "Branch Manager";
      case "branch_staff":
        return "Branch Staff";
      default:
        return "Staff";
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "branch_manager":
        return "default";
      default:
        return "secondary";
    }
  };

  const unreadCount = PLACEHOLDER_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">Inventory Management</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" weight="light" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="p-4 border-b">
              <h4 className="font-semibold">Notifications</h4>
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
              </p>
            </div>
            <ScrollArea className="h-[300px]">
              {PLACEHOLDER_NOTIFICATIONS.length > 0 ? (
                <div className="divide-y">
                  {PLACEHOLDER_NOTIFICATIONS.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                        )}
                        <div className={!notification.read ? "" : "ml-5"}>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" weight="light" />
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </ScrollArea>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full text-primary">
                View all notifications
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" weight="light" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
                  {getRoleLabel(role)}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/dashboard?tab=profile")}>
              <User className="mr-2 h-4 w-4" weight="light" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard?tab=settings")}>
              <Gear className="mr-2 h-4 w-4" weight="light" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <SignOut className="mr-2 h-4 w-4" weight="light" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
