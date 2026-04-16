import { useState } from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentRetryPromptProps {
  errorMessage: string;
  onRetry: () => void;
  onDismiss: () => void;
  isRetrying?: boolean;
}

export const PaymentRetryPrompt = ({
  errorMessage,
  onRetry,
  onDismiss,
  isRetrying = false,
}: PaymentRetryPromptProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 animate-in fade-in duration-300 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-destructive/10 shrink-0">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground">
              Payment didn't go through
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-2">
          {errorMessage || "Something went wrong with your payment. No charges were made."}
        </p>

        <p className="text-xs text-muted-foreground mb-6">
          Your cart is safe and prices are still locked. Try again or use a different payment method.
        </p>

        <div className="space-y-2">
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={onDismiss}
          >
            I'll try later
          </Button>
        </div>
      </div>
    </div>
  );
};
