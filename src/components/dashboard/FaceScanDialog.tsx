import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaceScanStep } from "@/components/onboarding/FaceScanStep";
import { useQueryClient } from "@tanstack/react-query";

interface FaceScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FaceScanDialog = ({ open, onOpenChange }: FaceScanDialogProps) => {
  const queryClient = useQueryClient();

  const handleComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Face Measurement Scan</DialogTitle>
        </DialogHeader>
        <FaceScanStep
          onNext={handleComplete}
          onBack={() => onOpenChange(false)}
          onSkip={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
