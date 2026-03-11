import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Image, CheckCircle, Upload } from "@phosphor-icons/react";

interface ProductImageCardProps {
  product: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
    additional_images: string[] | null;
  };
  onClick: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectionToggle?: (id: string) => void;
}

const MAX_IMAGES = 6; // 1 primary + 5 additional

export const ProductImageCard = ({
  product,
  onClick,
  selectable = false,
  selected = false,
  onSelectionToggle,
}: ProductImageCardProps) => {
  const imageCount =
    (product.image_url ? 1 : 0) + (product.additional_images?.length ?? 0);
  const isComplete = imageCount >= MAX_IMAGES;
  const hasNoImages = imageCount === 0;

  const handleClick = () => {
    if (selectable && onSelectionToggle) {
      onSelectionToggle(product.id);
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-card overflow-hidden transition-all",
        "hover:ring-2 hover:ring-primary/50 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-primary",
        hasNoImages && "border-dashed border-muted-foreground/30",
        selectable && selected && "ring-2 ring-primary border-primary"
      )}
    >
      {/* Selection Checkbox */}
      {selectable && (
        <div
          className="absolute top-2 left-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSelectionToggle?.(product.id);
          }}
        >
          <Checkbox checked={selected} />
        </div>
      )}

      {/* Image Container */}
      <AspectRatio ratio={1}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
            <Image className="h-8 w-8 mb-1" />
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Hover Overlay — only in non-select mode */}
        {!selectable && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity",
              "group-hover:opacity-100"
            )}
          >
            <div className="flex flex-col items-center text-white">
              <Upload className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">
                {hasNoImages ? "Add Images" : "Manage Images"}
              </span>
            </div>
          </div>
        )}
      </AspectRatio>

      {/* Product Info */}
      <div className="p-2 text-left">
        <p className="text-sm font-medium truncate" title={product.name}>
          {product.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">{product.sku}</p>
      </div>

      {/* Image Count Badge */}
      <Badge
        variant={isComplete ? "default" : hasNoImages ? "destructive" : "secondary"}
        className={cn(
          "absolute top-2 right-2 text-xs",
          isComplete && "bg-green-600 hover:bg-green-700"
        )}
      >
        {isComplete ? (
          <CheckCircle className="h-3 w-3 mr-1" weight="fill" />
        ) : null}
        {imageCount}/{MAX_IMAGES}
      </Badge>
    </button>
  );
};
