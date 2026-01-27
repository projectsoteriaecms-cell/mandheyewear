import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { Loader2 } from "lucide-react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  fallbackPath?: string;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallbackPath = "/login",
}: RoleGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const { data: role, isLoading: roleLoading, isFetched } = useUserRole();
  const location = useLocation();

  // Show loading while auth is loading, role is loading, or role hasn't been fetched yet (when user exists)
  const isLoading = authLoading || roleLoading || (user && !isFetched);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this area.
          </p>
          <p className="text-sm text-muted-foreground">
            Required role: {allowedRoles.join(" or ")}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
