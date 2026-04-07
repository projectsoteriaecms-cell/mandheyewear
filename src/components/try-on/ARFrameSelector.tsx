import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Glasses } from "lucide-react";

interface FrameProduct {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  color?: string | null;
}

interface ARFrameSelectorProps {
  products: FrameProduct[];
  selectedProductId: string | null;
  onSelectProduct: (product: FrameProduct) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ARFrameSelector = ({
  products,
  selectedProductId,
  onSelectProduct,
  isLoading = false,
  disabled = false,
}: ARFrameSelectorProps) => {
  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-sm font-medium text-foreground mb-3">Select Frames</h3>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-[100px] h-[88px] rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No frames available for AR try-on
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-foreground mb-3">
        Select Frames ({products.length})
      </h3>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {products.map((product) => {
            const isSelected = selectedProductId === product.id;

            return (
              <Button
                key={product.id}
                variant="outline"
                disabled={disabled}
                onClick={() => onSelectProduct(product)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-2 h-auto py-3 px-4 min-w-[100px] transition-all",
                  isSelected && "ring-2 ring-accent ring-offset-2 bg-accent/10"
                )}
              >
                <div className="relative w-14 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Glasses className="h-6 w-6 text-muted-foreground" />
                  )}

                  {isSelected && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="h-5 w-5 text-accent" />
                    </div>
                  )}
                </div>

                <span className="text-xs font-medium text-center truncate max-w-[90px]">
                  {product.name}
                </span>
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
