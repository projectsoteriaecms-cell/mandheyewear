import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileActionBarProps {
  price?: number;
  onPrimaryAction?: () => void;
  onBuyNow?: () => void;
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
      onBuyNow,
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
        <div className="flex items-center gap-2">
          {/* Price */}
          {price !== undefined && (
            <div className="flex-shrink-0 min-w-0">
              <p className="text-lg font-bold text-accent leading-tight">
                ₦{price.toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex-1 flex items-center gap-2 justify-end">
            {secondaryAction}
            {onBuyNow && (
              <Button
                variant="hero"
                size="sm"
                onClick={onBuyNow}
                disabled={disabled || isLoading}
                className="gap-1.5 flex-1 max-w-[140px]"
              >
                <Zap className="h-4 w-4" />
                Buy Now
              </Button>
            )}
            <Button
              variant={onBuyNow ? "outline" : "hero"}
              size="sm"
              onClick={onPrimaryAction}
              disabled={disabled || isLoading}
              className="gap-1.5 flex-1 max-w-[140px]"
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
