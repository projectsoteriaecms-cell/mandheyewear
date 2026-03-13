import { useEffect, useState } from "react";
import { useBranchAssignments } from "@/modules/branches";
import { useUserRole } from "@/shared/hooks/useUserRole";
import { isAtLeast } from "@/shared/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Buildings, MapPin, Star, Confetti } from "@phosphor-icons/react";

const WELCOME_SHOWN_KEY = "soteria_welcome_shown";

export const WelcomeBranchDialog = () => {
  const [open, setOpen] = useState(false);
  const { data: assignments, isLoading: assignmentsLoading } = useBranchAssignments();
  const { data: role, isLoading: roleLoading } = useUserRole();

  const isLoading = assignmentsLoading || roleLoading;
  const isSuperAdmin = role === "super_admin";
  const isStaffOrManager = role && isAtLeast(role, "branch_staff") && !isSuperAdmin;
  const hasBranchAssigned = assignments && assignments.length > 0;
  const primaryBranch = assignments?.find((a) => a.is_primary)?.branch || assignments?.[0]?.branch;

  useEffect(() => {
    if (isLoading) return;

    // Only show for staff/managers with branch assignments
    if (!isStaffOrManager || !hasBranchAssigned) return;

    // Check if we've already shown the welcome
    const welcomeShown = localStorage.getItem(WELCOME_SHOWN_KEY);
    const assignmentIds = assignments?.map(a => a.id).sort().join(",");
    
    // Show if never shown or if assignments changed
    if (welcomeShown !== assignmentIds) {
      setOpen(true);
    }
  }, [isLoading, isStaffOrManager, hasBranchAssigned, assignments]);

  const handleClose = () => {
    // Mark as shown for current assignments
    const assignmentIds = assignments?.map(a => a.id).sort().join(",");
    if (assignmentIds) {
      localStorage.setItem(WELCOME_SHOWN_KEY, assignmentIds);
    }
    setOpen(false);
  };

  if (!primaryBranch) return null;

  const roleLabel = role === "branch_manager" ? "Branch Manager" : "Staff Member";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Confetti className="h-8 w-8 text-primary" weight="duotone" />
          </div>
          <DialogTitle className="text-xl">Welcome to Your Branch!</DialogTitle>
          <DialogDescription>
            You've been assigned as a <strong>{roleLabel}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Primary Branch Card */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Buildings className="h-5 w-5 text-primary" weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{primaryBranch.name}</h3>
                  {assignments && assignments.length > 0 && assignments[0].is_primary && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Star className="h-3 w-3" weight="fill" />
                      Primary
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {primaryBranch.city}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Branches */}
          {assignments && assignments.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                You also have access to:
              </p>
              <div className="flex flex-wrap gap-2">
                {assignments
                  .filter((a) => a.branch?.id !== primaryBranch.id)
                  .map((a) => (
                    <Badge key={a.id} variant="outline">
                      {a.branch?.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            <p>
              You can now access inventory, appointments, and other features for your assigned{" "}
              {assignments && assignments.length > 1 ? "branches" : "branch"}.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={handleClose}>
            Get Started
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
