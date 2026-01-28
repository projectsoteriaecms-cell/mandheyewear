import { Bell, SignOut, User, Gear, Check, Trash, Package, ShoppingCart, ArrowsLeftRight, Calendar, Warning, Info, CheckCircle, XCircle } from "@phosphor-icons/react";
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
import { useNotifications, type NotificationType } from "@/hooks/admin/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'low_stock':
      return <Package className="h-4 w-4 text-orange-500" weight="duotone" />;
    case 'new_order':
      return <ShoppingCart className="h-4 w-4 text-green-500" weight="duotone" />;
    case 'transfer_request':
      return <ArrowsLeftRight className="h-4 w-4 text-blue-500" weight="duotone" />;
    case 'appointment':
      return <Calendar className="h-4 w-4 text-purple-500" weight="duotone" />;
    case 'warning':
      return <Warning className="h-4 w-4 text-yellow-500" weight="duotone" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" weight="duotone" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-green-500" weight="duotone" />;
    default:
      return <Info className="h-4 w-4 text-blue-500" weight="duotone" />;
  }
};

export const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const { data: role } = useUserRole();
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll,
    isMarkingAllRead 
  } = useNotifications();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNotificationClick = (notification: { id: string; link: string | null; read: boolean }) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
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
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllRead}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <ScrollArea className="h-[350px]">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors group ${
                        !notification.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm truncate ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <Trash className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" weight="light" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-1">You'll see alerts for orders, low stock, and more here</p>
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <div className="p-2 border-t flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() => clearAll()}
                >
                  <Trash className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}
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
