import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsThree, Upload, Image, CheckCircle, Lightning, SquaresFour } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface ProductImageListViewProps {
  products: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
    additional_images: string[] | null;
    brand?: string | null;
    color?: string | null;
  }[];
  onUploadClick: (productId: string) => void;
  onRegenerateClick?: (productId: string) => void;
  onGalleryClick?: (productId: string) => void;
  maxImages?: number;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionToggle?: (id: string) => void;
  onSelectAll?: () => void;
  allSelected?: boolean;
}

export const ProductImageListView = ({
  products,
  onUploadClick,
  onRegenerateClick,
  onGalleryClick,
  maxImages = 6,
  selectable = false,
  selectedIds = new Set(),
  onSelectionToggle,
  onSelectAll,
  allSelected = false,
}: ProductImageListViewProps) => {
  return (
    <div className="space-y-2">
      {/* Select All header */}
      {selectable && products.length > 0 && (
        <div className="flex items-center gap-3 px-3 py-2 border-b">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => onSelectAll?.()}
          />
          <span className="text-sm font-medium text-muted-foreground">
            {allSelected ? "Deselect all" : "Select all"}
          </span>
        </div>
      )}

      {products.map((product) => {
        const imageCount =
          (product.image_url ? 1 : 0) + (product.additional_images?.length ?? 0);
        const isComplete = imageCount >= maxImages;
        const hasNoImages = imageCount === 0;
        const isSelected = selectedIds.has(product.id);

        return (
          <div
            key={product.id}
            className={cn(
              "flex items-center gap-4 p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors",
              selectable && isSelected && "ring-2 ring-primary border-primary"
            )}
            onClick={selectable ? () => onSelectionToggle?.(product.id) : undefined}
            role={selectable ? "button" : undefined}
          >
            {/* Checkbox */}
            {selectable && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelectionToggle?.(product.id)}
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Thumbnail */}
            <div
              className="relative h-14 w-14 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: "#FFFFFF" }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-full w-full rounded-lg object-contain p-[8%]"
                />
              ) : (
                <Image className="h-6 w-6 text-muted-foreground" weight="light" />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" title={product.name}>
                {product.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {product.sku}
              </p>
              {(product.brand || product.color) && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[product.brand, product.color].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>

            {/* Image Count Badge */}
            <Badge
              variant={isComplete ? "default" : hasNoImages ? "destructive" : "secondary"}
              className={cn(
                "text-xs flex-shrink-0",
                isComplete && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isComplete && <CheckCircle className="h-3 w-3 mr-1" weight="fill" />}
              {imageCount}/{maxImages}
            </Badge>

            {/* Three-dot Menu — hidden in select mode */}
            {!selectable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <DotsThree className="h-5 w-5" weight="bold" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onUploadClick(product.id)}>
                    <Upload className="mr-2 h-4 w-4" weight="light" />
                    {hasNoImages ? "Add Images" : "Manage Images"}
                  </DropdownMenuItem>
                  {onGalleryClick && (
                    <DropdownMenuItem onClick={() => onGalleryClick(product.id)}>
                      <SquaresFour className="mr-2 h-4 w-4" weight="fill" />
                      Review Gallery (6 shots)
                    </DropdownMenuItem>
                  )}
                  {onRegenerateClick && (
                    <DropdownMenuItem onClick={() => onRegenerateClick(product.id)}>
                      <Lightning className="mr-2 h-4 w-4" weight="fill" />
                      Regenerate All (AI)
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
};
