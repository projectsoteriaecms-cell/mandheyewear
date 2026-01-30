import { useRef } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/hooks/useProducts";
import type { FrameDetails } from "@/hooks/useVirtualTryOn";

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
  onSelectFrame,
  onTryOn,
  isGenerating,
  disabled,
}: FramePickerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-64 flex-shrink-0 rounded-lg" />
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
        <h3 className="text-lg font-semibold text-foreground">Select a Frame</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div ref={scrollRef} className="flex gap-4 pb-4">
          {products.map((product) => {
            const frameDetails = productToFrameDetails(product);
            const isSelected = selectedFrame?.id === product.id;

            return (
              <Card
                key={product.id}
                className={cn(
                  "flex-shrink-0 w-64 cursor-pointer transition-all hover:shadow-md",
                  isSelected && "ring-2 ring-primary"
                )}
                onClick={() => onSelectFrame(frameDetails)}
              >
                <CardContent className="p-4 space-y-3">
                  {/* Frame Image */}
                  <div className="aspect-[4/3] bg-muted rounded-md overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Frame Details */}
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-foreground truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {product.color && (
                        <Badge variant="secondary" className="text-xs">
                          {product.color}
                        </Badge>
                      )}
                      {product.style && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {product.style}
                        </Badge>
                      )}
                    </div>
                    <p className="text-accent font-semibold">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Try On Button */}
                  <Button
                    variant={isSelected ? "gold" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTryOn(frameDetails);
                    }}
                    disabled={disabled || isGenerating}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating && isSelected ? "Generating..." : "Try This Frame"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
