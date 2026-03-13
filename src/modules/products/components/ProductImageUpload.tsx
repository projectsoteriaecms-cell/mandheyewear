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
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DraggableImageItem } from "./DraggableImageItem";

export const IMAGE_POSITION_LABELS = [
  "Front View",
  "Side View (Left)",
  "Side View (Right)",
  "On-Model",
  "Detail",
] as const;

export type ImagePosition = typeof IMAGE_POSITION_LABELS[number];

interface ProductImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onUpload: (files: File[]) => Promise<void>;
  onDelete: (imageUrl: string, isPrimary: boolean) => Promise<void>;
  maxImages?: number;
  isUploading?: boolean;
  primaryImage?: string | null;
  onPrimaryChange?: (url: string | null) => void;
}

export const ProductImageUpload = ({
  images,
  onImagesChange,
  onUpload,
  onDelete,
  maxImages = 5,
  isUploading = false,
  primaryImage,
  onPrimaryChange,
}: ProductImageUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

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

  // Combine primary and additional images for unified drag-and-drop
  const allImages = primaryImage 
    ? [primaryImage, ...images.filter(img => img !== primaryImage)]
    : images;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (files.length > 0) {
        await onUpload(files.slice(0, maxImages - allImages.length));
      }
    },
    [onUpload, allImages.length, maxImages]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await onUpload(files.slice(0, maxImages - allImages.length));
    }
    e.target.value = "";
  };

  const handleDeleteImage = async (url: string) => {
    const isPrimary = url === primaryImage;
    await onDelete(url, isPrimary);
    
    if (isPrimary && onPrimaryChange) {
      // If deleting primary, promote first additional image
      const remaining = images.filter(img => img !== url);
      onPrimaryChange(remaining[0] || null);
    }
    
    onImagesChange(images.filter((img) => img !== url));
  };

  const handleSetPrimary = (url: string) => {
    if (onPrimaryChange) {
      onPrimaryChange(url);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = allImages.indexOf(active.id as string);
      const newIndex = allImages.indexOf(over.id as string);
      
      const newOrder = arrayMove(allImages, oldIndex, newIndex);
      
      // First image becomes primary
      const newPrimary = newOrder[0];
      const newAdditional = newOrder.slice(1);
      
      if (onPrimaryChange) {
        onPrimaryChange(newPrimary);
      }
      onImagesChange(newAdditional);
    }
  };

  const canAddMore = allImages.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Product Images ({allImages.length}/{maxImages})
        </label>
        <p className="text-xs text-muted-foreground">
          Drag to reorder • First image is primary
        </p>
      </div>

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
                  onDelete={handleDeleteImage}
                  onSetPrimary={idx !== 0 ? handleSetPrimary : undefined}
                />
              ))}

              {canAddMore && (
                <div
                  className={cn(
                    "aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <label className="cursor-pointer flex flex-col items-center p-4">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground text-center">
                          Add Image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div
          className={cn(
            "h-40 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <label className="cursor-pointer flex flex-col items-center">
            {isUploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <>
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Drop images here or click to upload
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, or WebP. Max 7MB each.
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};
