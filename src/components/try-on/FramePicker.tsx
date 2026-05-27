import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/modules/products/hooks/useProducts";
import type { FrameDetails } from "@/modules/personalization/hooks/useVirtualTryOn";

interface FramePickerProps {
  products: Product[];
  isLoading: boolean;
  selectedFrame: FrameDetails | null;
  onSelectFrame: (frame: FrameDetails) => void;
  onTryOn: (frame: FrameDetails) => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const FramePicker = ({
  products,
  isLoading,
  selectedFrame,
  onTryOn,
  isGenerating,
  disabled,
}: FramePickerProps) => {
  const productToFrameDetails = (product: Product): FrameDetails => ({
    id: product.id,
    name: product.name,
    color: product.color || undefined,
    style: product.style || undefined,
    imageUrl: product.image_url || undefined,
    price: product.price,
    sku: product.sku,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Select a Frame</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No frames available for try-on.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {disabled ? "Upload a photo to start trying on" : "Tap any frame to try it on"}
        </h3>
        <span className="text-xs text-muted-foreground">{products.length} frames</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => {
          const frameDetails = productToFrameDetails(product);
          const isSelected = selectedFrame?.id === product.id;
          const isThisGenerating = isGenerating && isSelected;

          return (
            <Card
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (disabled || isGenerating) return;
                onTryOn(frameDetails);
              }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !disabled && !isGenerating) {
                  e.preventDefault();
                  onTryOn(frameDetails);
                }
              }}
              className={cn(
                "group relative cursor-pointer transition-all overflow-hidden",
                "hover:shadow-lg hover:-translate-y-0.5",
                isSelected && "ring-2 ring-primary",
                (disabled || (isGenerating && !isSelected)) && "opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none"
              )}
            >
              <CardContent className="p-3 space-y-2">
                <div
                  className="aspect-[4/3] rounded-md overflow-hidden relative"
                  style={{ background: "#FFFFFF" }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-contain p-[8%]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}

                  {isThisGenerating && (
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="text-xs font-medium text-foreground">Generating…</span>
                    </div>
                  )}

                  {!isThisGenerating && !disabled && (
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-background/90 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-md">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium">Try on</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-sm text-foreground truncate">{product.name}</p>
                  <div className="flex items-center gap-1 flex-wrap">
                    {product.color && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {product.color}
                      </Badge>
                    )}
                  </div>
                  <p className="text-accent font-semibold text-sm">
                    ₦{product.price.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
