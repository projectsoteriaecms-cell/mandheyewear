import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBranches } from "@/modules/branches";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Building2, Star, Loader2 } from "lucide-react";

interface BranchAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userEmail: string;
  userName: string;
}

interface BranchAssignment {
  id: string;
  branch_id: string;
  is_primary: boolean;
}

export const BranchAssignmentDialog = ({
  open,
  onOpenChange,
  userId,
  userEmail,
  userName,
}: BranchAssignmentDialogProps) => {
  const queryClient = useQueryClient();
  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(new Map());
  const [primaryBranch, setPrimaryBranch] = useState<string | null>(null);

  // Fetch current assignments for this user
  const { data: assignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ["user-branch-assignments", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_assignments")
        .select("id, branch_id, is_primary")
        .eq("user_id", userId);

      if (error) throw error;
      
      // Set the primary branch from existing data
      const primary = data?.find(a => a.is_primary);
      if (primary) {
        setPrimaryBranch(primary.branch_id);
      }
      
      return data as BranchAssignment[];
    },
    enabled: open && !!userId,
  });

  const assignedBranchIds = new Set(assignments.map((a) => a.branch_id));

  // Check if a branch is assigned (considering pending changes)
  const isBranchAssigned = (branchId: string): boolean => {
    if (pendingChanges.has(branchId)) {
      return pendingChanges.get(branchId)!;
    }
    return assignedBranchIds.has(branchId);
  };

  // Get count of currently assigned branches
  const getAssignedCount = (): number => {
    let count = 0;
    branches.forEach((branch) => {
      if (isBranchAssigned(branch.id)) count++;
    });
    return count;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Re-check existing assignments at save time to avoid duplicate-key errors
      // when the UI state is stale or assignments were changed in another session.
      const { data: existingNow, error: existingError } = await supabase
        .from("branch_assignments")
        .select("branch_id")
        .eq("user_id", userId);

      if (existingError) throw existingError;

      const existingAssigned = new Set((existingNow ?? []).map((r) => r.branch_id));

      const toAssign: string[] = [];
      const toRemove: string[] = [];

      pendingChanges.forEach((isAssigned, branchId) => {
        const wasAssigned = existingAssigned.has(branchId);
        if (isAssigned && !wasAssigned) {
          toAssign.push(branchId);
        } else if (!isAssigned && wasAssigned) {
          toRemove.push(branchId);
        }
      });

      // Remove unassigned branches
      if (toRemove.length > 0) {
        const { error } = await supabase
          .from("branch_assignments")
          .delete()
          .eq("user_id", userId)
          .in("branch_id", toRemove);
        if (error) throw error;
      }

      // Add newly assigned branches (only if not already assigned)
      if (toAssign.length > 0) {
        // Filter out any branches that might already be assigned (edge case)
        const actuallyNew = toAssign.filter((branchId) => !existingAssigned.has(branchId));
        
        if (actuallyNew.length > 0) {
          const newAssignments = actuallyNew.map((branchId) => ({
            user_id: userId,
            branch_id: branchId,
            is_primary: branchId === primaryBranch && getAssignedCount() === 0,
          }));
          
           // Use upsert to avoid duplicate key crashes when re-assigning
           // an already-assigned branch (unique: user_id + branch_id).
           const { error } = await supabase
             .from("branch_assignments")
             .upsert(newAssignments, {
               onConflict: "user_id,branch_id",
              ignoreDuplicates: true,
             });
           if (error) throw error;
        }
      }

      // Update primary branch if needed
      if (primaryBranch) {
        // First, set all to non-primary
        await supabase
          .from("branch_assignments")
          .update({ is_primary: false })
          .eq("user_id", userId);

        // Then set the primary one
        await supabase
          .from("branch_assignments")
          .update({ is_primary: true })
          .eq("user_id", userId)
          .eq("branch_id", primaryBranch);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-branch-assignments", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Branch assignments updated successfully");
      setPendingChanges(new Map());
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update branch assignments");
    },
  });

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    const newChanges = new Map(pendingChanges);
    newChanges.set(branchId, checked);
    setPendingChanges(newChanges);

    // If unchecking the primary branch, clear it
    if (!checked && primaryBranch === branchId) {
      setPrimaryBranch(null);
    }
  };

  const handleSetPrimary = (branchId: string) => {
    // Can only set primary if branch is assigned
    if (isBranchAssigned(branchId)) {
      setPrimaryBranch(branchId);
    }
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const isLoading = branchesLoading || assignmentsLoading;
  const hasChanges = pendingChanges.size > 0 || 
    (primaryBranch !== null && primaryBranch !== assignments.find(a => a.is_primary)?.branch_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Branch Assignments
          </DialogTitle>
          <DialogDescription>
            Assign <strong>{userName || userEmail}</strong> to one or more branches.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Building2 className="mx-auto h-10 w-10 mb-2 opacity-50" />
            <p>No branches available</p>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {branches.map((branch) => {
                  const isAssigned = isBranchAssigned(branch.id);
                  const isPrimary = primaryBranch === branch.id;

                  return (
                    <div
                      key={branch.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isAssigned
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`branch-${branch.id}`}
                          checked={isAssigned}
                          onCheckedChange={(checked) =>
                            handleBranchToggle(branch.id, checked as boolean)
                          }
                        />
                        <label
                          htmlFor={`branch-${branch.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <p className="font-medium">{branch.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {branch.city}, {branch.state}
                          </p>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPrimary && (
                          <Badge variant="secondary" className="gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Primary
                          </Badge>
                        )}
                        {isAssigned && !isPrimary && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetPrimary(branch.id)}
                            className="text-xs h-7"
                          >
                            Set Primary
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {getAssignedCount()} branch{getAssignedCount() !== 1 ? "es" : ""} assigned
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || !hasChanges}
                >
                  {saveMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
