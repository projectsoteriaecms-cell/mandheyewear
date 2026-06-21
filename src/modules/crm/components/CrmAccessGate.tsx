import { ReactNode } from "react";
import { ShieldOff, Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCrmRlsPreflight } from "../hooks/useCrmRlsPreflight";

interface CrmAccessGateProps {
  children: ReactNode;
  /** Override the fallback shown while checking permissions. */
  loadingFallback?: ReactNode;
}

const REASON_ICON: Record<string, typeof ShieldOff> = {
  not_authenticated:  ShieldOff,
  insufficient_role:  ShieldOff,
  preflight_error:    AlertTriangle,
};

/**
 * Wraps any CRM admin page or section.
 * Shows a clear, actionable error if the current user lacks CRM access,
 * instead of letting the page render partially with silent empty data.
 */
export function CrmAccessGate({ children, loadingFallback }: CrmAccessGateProps) {
  const { data, isLoading, refetch } = useCrmRlsPreflight();

  if (isLoading) {
    return loadingFallback ?? (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking CRM access…
      </div>
    );
  }

  if (!data?.ok) {
    const reason = data?.reason ?? "preflight_error";
    const Icon = REASON_ICON[reason] ?? ShieldOff;
    const isRetryable = reason === "preflight_error";

    return (
      <div className="flex items-start justify-center py-16 px-4">
        <Alert variant="destructive" className="max-w-md">
          <Icon className="h-4 w-4" />
          <AlertTitle>
            {reason === "not_authenticated"  && "Sign in required"}
            {reason === "insufficient_role"  && "Access restricted"}
            {reason === "preflight_error"    && "Permission check failed"}
          </AlertTitle>
          <AlertDescription className="mt-1 space-y-3">
            <p>{data?.message ?? "You don't have permission to access CRM features."}</p>
            {isRetryable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="mt-2"
              >
                Try again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
