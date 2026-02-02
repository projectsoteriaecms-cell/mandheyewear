import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Glasses } from "lucide-react";
import type { SnapLensConfig } from "@/config/snap-lenses";

interface ARLensSelectorProps {
  lenses: SnapLensConfig[];
  currentLensId: string | null;
  onSelectLens: (lensId: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ARLensSelector = ({
  lenses,
  currentLensId,
  onSelectLens,
  isLoading = false,
  disabled = false,
}: ARLensSelectorProps) => {
  if (lenses.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No AR lenses configured yet
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-foreground mb-3">Select Frames</h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {lenses.map((lens) => {
            const isSelected = currentLensId === lens.id;
            const isConfigured = Boolean(lens.snapLensId);
            
            return (
              <Button
                key={lens.id}
                variant="outline"
                disabled={disabled || isLoading || !isConfigured}
                onClick={() => onSelectLens(lens.id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px] transition-all",
                  isSelected && "ring-2 ring-accent ring-offset-2 bg-accent/10",
                  !isConfigured && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Lens thumbnail or placeholder */}
                <div className="relative w-14 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {lens.thumbnailUrl && lens.thumbnailUrl !== "/placeholder.svg" ? (
                    <img
                      src={lens.thumbnailUrl}
                      alt={lens.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Glasses className="h-6 w-6 text-muted-foreground" />
                  )}
                  
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-accent" />
                    </div>
                  )}
                </div>
                
                {/* Lens name */}
                <span className="text-xs font-medium text-center truncate max-w-[90px]">
                  {lens.name}
                </span>
                
                {/* Not configured badge */}
                {!isConfigured && (
                  <span className="text-[10px] text-muted-foreground">
                    Coming soon
                  </span>
                )}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
