import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileActionBarProps {
  price?: number;
  onPrimaryAction?: () => void;
  primaryLabel?: string;
  primaryIcon?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MobileActionBar = forwardRef<HTMLDivElement, MobileActionBarProps>(
  (
    {
      price,
      onPrimaryAction,
      primaryLabel = "Add to Cart",
      primaryIcon = <ShoppingBag className="h-4 w-4" />,
      secondaryAction,
      isLoading = false,
      disabled = false,
      className,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "lg:hidden fixed bottom-0 left-0 right-0 z-40",
          "bg-background/95 backdrop-blur-lg border-t border-border",
          "px-4 py-3 safe-area-bottom",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* Price display */}
          {price !== undefined && (
            <div className="flex-shrink-0">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-lg font-bold text-accent">
                ₦{price.toLocaleString()}
              </p>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex-1 flex items-center gap-2 justify-end">
            {secondaryAction}
            <Button
              variant="hero"
              size="lg"
              onClick={onPrimaryAction}
              disabled={disabled || isLoading}
              className="flex-1 max-w-[200px] gap-2 touch-target"
            >
              {primaryIcon}
              {primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

MobileActionBar.displayName = "MobileActionBar";
