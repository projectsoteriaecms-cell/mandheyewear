import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProductImageUpload } from "@/modules/products";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image, CloudArrowUp, Lightning } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraggableImageItem } from "./DraggableImageItem";
import { ImagePreviewLightbox } from "./ImagePreviewLightbox";
import { IMAGE_POSITION_LABELS } from "./ProductImageUpload";
import { supabase } from "@/integrations/supabase/client";

const MAX_IMAGES = 6; // 1 primary + 5 additional

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
  const [isRegenerating, setIsRegenerating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const primaryImage = product?.image_url;
  const additionalImages = product?.additional_images ?? [];
  
  // Combine all images into a unified list for drag-and-drop
  const allImages = primaryImage
    ? [primaryImage, ...additionalImages]
    : additionalImages;
    
  const totalImages = allImages.length;
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
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } finally {
        setIsUploading(false);
      }
    },
    [product, primaryImage, uploadProductImage, validateFile, queryClient]
  );

  const handleDelete = useCallback(
    async (imageUrl: string) => {
      if (!product) return;

      const isPrimary = imageUrl === primaryImage;
      setIsUploading(true);
      try {
        const success = await deleteProductImage(product.id, imageUrl, isPrimary);
        if (success) {
          toast.success("Image deleted");
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
        }
      } finally {
        setIsUploading(false);
      }
    },
    [product, primaryImage, deleteProductImage, queryClient]
  );

  const handleSetPrimary = useCallback(
    async (imageUrl: string) => {
      if (!product) return;

      setIsUploading(true);
      try {
        // Reorder: move selected image to first position
        const currentIndex = allImages.indexOf(imageUrl);
        if (currentIndex > 0) {
          const newOrder = arrayMove(allImages, currentIndex, 0);
          const newPrimary = newOrder[0];
          const newAdditional = newOrder.slice(1);

          const { error } = await supabase
            .from("products")
            .update({
              image_url: newPrimary,
              additional_images: newAdditional.length > 0 ? newAdditional : null,
            })
            .eq("id", product.id);

          if (error) throw error;

          toast.success("Primary image updated");
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
        }
      } catch (error) {
        console.error("Error setting primary:", error);
        toast.error("Failed to update primary image");
      } finally {
        setIsUploading(false);
      }
    },
    [product, allImages, queryClient]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || !product || active.id === over.id) return;

      const oldIndex = allImages.indexOf(active.id as string);
      const newIndex = allImages.indexOf(over.id as string);

      const newOrder = arrayMove(allImages, oldIndex, newIndex);
      const newPrimary = newOrder[0];
      const newAdditional = newOrder.slice(1);

      setIsUploading(true);
      try {
        const { error } = await supabase
          .from("products")
          .update({
            image_url: newPrimary,
            additional_images: newAdditional.length > 0 ? newAdditional : null,
          })
          .eq("id", product.id);

        if (error) throw error;

        toast.success("Image order updated");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } catch (error) {
        console.error("Error reordering images:", error);
        toast.error("Failed to reorder images");
      } finally {
        setIsUploading(false);
      }
    },
    [product, allImages, queryClient]
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

  const handleRegenerate = useCallback(async () => {
    if (!product) return;
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-product-image", {
        body: { productId: product.id },
      });
      if (error) throw error;
      if (data?.succeeded > 0) {
        toast.success(`Regenerated ${data.results?.[0]?.shots || 1} image(s) for ${product.sku}`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } else {
        toast.error(data?.results?.[0]?.error || "Failed to regenerate images");
      }
    } catch (err) {
      console.error("Regeneration error:", err);
      toast.error("Failed to regenerate images");
    } finally {
      setIsRegenerating(false);
    }
  }, [product, queryClient]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Manage Images
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating || isUploading}
              className="ml-auto"
            >
              {isRegenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Lightning className="h-4 w-4 mr-1" weight="fill" />
              )}
              {isRegenerating ? "Regenerating..." : "Regenerate with AI"}
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{product.name}</span>
            <Badge variant="outline">{product.sku}</Badge>
            <Badge variant={totalImages >= MAX_IMAGES ? "default" : "secondary"}>
              {totalImages}/{MAX_IMAGES} images
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Instructions */}
          <p className="text-xs text-muted-foreground">
            Drag to reorder • First image is primary
          </p>

          {/* Draggable Image Grid */}
          {allImages.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={allImages} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {allImages.map((url, idx) => (
                    <DraggableImageItem
                      key={url}
                      id={url}
                      url={url}
                      index={idx}
                      isPrimary={idx === 0}
                      isUploading={isUploading}
                      onDelete={handleDelete}
                      onSetPrimary={idx !== 0 ? handleSetPrimary : undefined}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
              <Image className="h-10 w-10 mb-2" weight="light" />
              <p className="text-sm">No images yet</p>
            </div>
          )}

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
                    Positions: {IMAGE_POSITION_LABELS.slice(allImages.length, allImages.length + 3).join(", ")}...
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
