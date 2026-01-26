import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Building2,
  Package,
  ClipboardList,
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Star,
  Loader2,
} from "lucide-react";

interface StaffOnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "branch", title: "Your Branch" },
  { id: "features", title: "Key Features" },
  { id: "complete", title: "Ready!" },
];

const FEATURES = [
  {
    icon: Package,
    title: "Inventory Management",
    description: "Track stock levels, view products, and monitor low-stock alerts across your branch.",
  },
  {
    icon: ClipboardList,
    title: "Purchase Orders",
    description: "Create draft purchase orders for supplies. Managers can approve and process them.",
  },
  {
    icon: ArrowLeftRight,
    title: "Stock Transfers",
    description: "Request and receive stock transfers between branches to balance inventory.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description: "Access dashboards showing sales, inventory metrics, and performance data.",
  },
];

export const StaffOnboardingWizard = ({ open, onComplete }: StaffOnboardingWizardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedBranches, setSelectedBranches] = useState<Set<string>>(new Set());
  const [primaryBranch, setPrimaryBranch] = useState<string | null>(null);

  const { data: branches = [], isLoading: branchesLoading } = useBranches();

  const saveBranchAssignments = useMutation({
    mutationFn: async () => {
      if (!user?.id || selectedBranches.size === 0) {
        throw new Error("Please select at least one branch");
      }

      const assignments = Array.from(selectedBranches).map((branchId) => ({
        user_id: user.id,
        branch_id: branchId,
        is_primary: branchId === primaryBranch,
      }));

      const { error } = await supabase
        .from("branch_assignments")
        .insert(assignments);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branch-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["user-branch-assignments"] });
      setCurrentStep(3); // Move to complete step
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save branch assignments");
    },
  });

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    const newSelected = new Set(selectedBranches);
    if (checked) {
      newSelected.add(branchId);
      // Auto-set as primary if it's the first selection
      if (newSelected.size === 1) {
        setPrimaryBranch(branchId);
      }
    } else {
      newSelected.delete(branchId);
      if (primaryBranch === branchId) {
        setPrimaryBranch(newSelected.size > 0 ? Array.from(newSelected)[0] : null);
      }
    }
    setSelectedBranches(newSelected);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Save branch assignments before moving to features
      saveBranchAssignments.mutate();
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    toast.success("Welcome to the team! You're all set.");
    onComplete();
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = () => {
    if (currentStep === 1) {
      return selectedBranches.size > 0;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg sm:max-w-xl [&>button]:hidden">
        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step Content */}
        <div className="min-h-[320px] flex flex-col">
          {/* Welcome Step */}
          {currentStep === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl">Welcome to the Team!</DialogTitle>
                <DialogDescription className="text-base max-w-md">
                  We're excited to have you on board. Let's get you set up with your branch 
                  assignment and walk through the key features you'll be using.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-8 flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="gap-1">
                  <Package className="h-3 w-3" /> Inventory
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <ClipboardList className="h-3 w-3" /> Orders
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <ArrowLeftRight className="h-3 w-3" /> Transfers
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <BarChart3 className="h-3 w-3" /> Reports
                </Badge>
              </div>
            </div>
          )}

          {/* Branch Selection Step */}
          {currentStep === 1 && (
            <div className="flex-1 py-4">
              <DialogHeader className="mb-6">
                <DialogTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Select Your Branch
                </DialogTitle>
                <DialogDescription>
                  Choose the branch(es) you'll be working at. You can select multiple if needed.
                </DialogDescription>
              </DialogHeader>

              {branchesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2">
                  {branches.map((branch) => {
                    const isSelected = selectedBranches.has(branch.id);
                    const isPrimary = primaryBranch === branch.id;

                    return (
                      <div
                        key={branch.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "border-primary/50 bg-primary/5"
                            : "border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`branch-${branch.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleBranchToggle(branch.id, checked as boolean)
                            }
                          />
                          <label
                            htmlFor={`branch-${branch.id}`}
                            className="cursor-pointer"
                          >
                            <p className="font-medium">{branch.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {branch.city}, {branch.state}
                            </p>
                          </label>
                        </div>
                        {isSelected && (
                          <div className="flex items-center gap-2">
                            {isPrimary ? (
                              <Badge variant="secondary" className="gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Primary
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => setPrimaryBranch(branch.id)}
                              >
                                Set Primary
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedBranches.size > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  {selectedBranches.size} branch{selectedBranches.size !== 1 ? "es" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* Features Overview Step */}
          {currentStep === 2 && (
            <div className="flex-1 py-4">
              <DialogHeader className="mb-6">
                <DialogTitle>Key Features</DialogTitle>
                <DialogDescription>
                  Here's what you can do in the admin panel. Your access may vary based on your role.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3">
                {FEATURES.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 3 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-green-600" />
              </div>
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl">You're All Set!</DialogTitle>
                <DialogDescription className="text-base max-w-md">
                  Your branch assignment has been saved. You now have access to the admin 
                  panel where you can start managing inventory and operations.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6 p-4 rounded-lg bg-muted/50 max-w-sm">
                <p className="text-sm font-medium mb-1">Quick Tips:</p>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>• Check the Dashboard for an overview of your branch</li>
                  <li>• Use the sidebar to navigate between sections</li>
                  <li>• Ask your manager if you need additional access</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t">
          {currentStep > 0 && currentStep < 3 ? (
            <Button variant="ghost" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saveBranchAssignments.isPending}
            >
              {saveBranchAssignments.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {currentStep === 0 ? "Get Started" : currentStep === 1 ? "Save & Continue" : "Next"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} className="w-full">
              Go to Dashboard
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
