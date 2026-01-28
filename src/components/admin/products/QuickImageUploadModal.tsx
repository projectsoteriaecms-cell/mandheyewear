import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProductImageUpload } from "@/modules/products";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Image,
  Trash,
  Star,
  CloudArrowUp,
} from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { IMAGE_POSITION_LABELS } from "./ProductImageUpload";

const MAX_IMAGES = 6; // 1 primary + 5 additional
const MAX_ADDITIONAL = 5;

interface QuickImageUploadModalProps {
  product: {
    id: string;
    name: string;
    sku: string;
    image_url: string | null;
    additional_images: string[] | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickImageUploadModal = ({
  product,
  open,
  onOpenChange,
}: QuickImageUploadModalProps) => {
  const queryClient = useQueryClient();
  const { uploadProductImage, deleteProductImage, validateFile } =
    useProductImageUpload();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const primaryImage = product?.image_url;
  const additionalImages = product?.additional_images ?? [];
  const totalImages = (primaryImage ? 1 : 0) + additionalImages.length;
  const canAddMore = totalImages < MAX_IMAGES;

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || !product) return;

      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);
      try {
        for (const file of validFiles) {
          // If no primary image, set first as primary
          const isPrimary = !primaryImage && validFiles.indexOf(file) === 0;
          await uploadProductImage(product.id, file, isPrimary);
        }
        toast.success(`Uploaded ${validFiles.length} image(s)`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      } finally {
        setIsUploading(false);
      }
    },
    [product, primaryImage, uploadProductImage, validateFile, queryClient]
  );

  const handleDelete = useCallback(
    async (imageUrl: string, isPrimary: boolean) => {
      if (!product) return;

      setIsUploading(true);
      try {
        const success = await deleteProductImage(product.id, imageUrl, isPrimary);
        if (success) {
          toast.success("Image deleted");
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        }
      } finally {
        setIsUploading(false);
      }
    },
    [product, deleteProductImage, queryClient]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Manage Images
          </DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{product.name}</span>
            <Badge variant="outline">{product.sku}</Badge>
            <Badge variant={totalImages >= MAX_IMAGES ? "default" : "secondary"}>
              {totalImages}/{MAX_IMAGES} images
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Primary Image */}
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" weight="fill" />
              Primary Image
            </h4>
            {primaryImage ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border group">
                <img
                  src={primaryImage}
                  alt="Primary"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleDelete(primaryImage, true)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                <span className="text-xs">No primary image</span>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div>
            <h4 className="text-sm font-medium mb-2">Additional Images ({additionalImages.length}/{MAX_ADDITIONAL})</h4>
            <div className="grid grid-cols-4 gap-3">
              {additionalImages.map((url, index) => (
                <div
                  key={url}
                  className="relative aspect-square rounded-lg overflow-hidden border group"
                >
                  <img
                    src={url}
                    alt={`Additional ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Badge 
                    variant="secondary" 
                    className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-background/80 backdrop-blur-sm"
                  >
                    {IMAGE_POSITION_LABELS[index] || `Image ${index + 1}`}
                  </Badge>
                  <button
                    onClick={() => handleDelete(url, false)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {additionalImages.length === 0 && (
                <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground col-span-2">
                  <span className="text-xs text-center px-2">No additional images</span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Zone */}
          {canAddMore && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/30 hover:border-primary/50"
              )}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <>
                  <CloudArrowUp className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">
                    Drag & drop images here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, or WebP up to 7MB each. {MAX_IMAGES - totalImages} slot(s)
                    remaining.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Positions: {IMAGE_POSITION_LABELS.slice(additionalImages.length, additionalImages.length + 3).join(", ")}...
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
          )}

          {!canAddMore && (
            <div className="text-center py-4 text-sm text-muted-foreground bg-muted/50 rounded-lg">
              Maximum of {MAX_IMAGES} images reached. Delete an image to upload more.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
