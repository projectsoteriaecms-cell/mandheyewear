import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
        await onUpload(files.slice(0, maxImages - images.length));
      }
    },
    [onUpload, images.length, maxImages]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await onUpload(files.slice(0, maxImages - images.length));
    }
    e.target.value = "";
  };

  const handleDeleteImage = async (url: string) => {
    const isPrimary = url === primaryImage;
    await onDelete(url, isPrimary);
    
    if (isPrimary && onPrimaryChange) {
      onPrimaryChange(null);
    }
    
    onImagesChange(images.filter((img) => img !== url));
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      {/* Primary Image */}
      <div>
        <label className="text-sm font-medium mb-2 block">Primary Image</label>
        {primaryImage ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border group">
            <img
              src={primaryImage}
              alt="Primary"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleDeleteImage(primaryImage)}
              disabled={isUploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "w-32 h-32 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
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
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        )}
      </div>

      {/* Additional Images */}
      <div>
        <label className="text-sm font-medium mb-2 block">
          Additional Images ({images.length}/{maxImages})
        </label>
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div
              key={url}
              className="relative rounded-lg overflow-hidden border group"
            >
              <div className="aspect-square">
                <img
                  src={url}
                  alt={`Product ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <Badge 
                variant="secondary" 
                className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-background/80 backdrop-blur-sm"
              >
                {IMAGE_POSITION_LABELS[idx] || `Image ${idx + 1}`}
              </Badge>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDeleteImage(url)}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {canAddMore && (
            <div
              className={cn(
                "w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
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
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
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
        <p className="text-xs text-muted-foreground mt-2">
          JPG, PNG, or WebP. Max 7MB each.
        </p>
      </div>
    </div>
  );
};
