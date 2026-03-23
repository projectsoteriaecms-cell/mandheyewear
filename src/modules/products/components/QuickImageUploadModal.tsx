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
import { Image, CloudArrowUp, Lightning, Warning, Camera, PencilSimple } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraggableImageItem } from "./DraggableImageItem";
import { ImagePreviewLightbox } from "./ImagePreviewLightbox";
import { IMAGE_POSITION_LABELS } from "./ProductImageUpload";
import { PromptEditorPanel } from "./PromptEditorPanel";
import { supabase } from "@/integrations/supabase/client";
import {
  isKnownBrand,
  MIN_REFERENCE_PHOTOS,
  MIN_REFERENCE_PHOTOS_KNOWN,
} from "@/modules/products/lib/brand-classification";
import {
  getProductPrompts,
  SHOT_SLUGS,
  type ShotPrompt,
  type ProductForPrompt,
} from "@/modules/products/lib/prompt-builders";

const MAX_IMAGES = 6;

interface QuickImageUploadModalProps {
  product: {
    id: string;
    name: string;
    sku: string;
    brand?: string | null;
    image_url: string | null;
    additional_images: string[] | null;
    item_type?: string | null;
    color?: string | null;
    material?: string | null;
    style?: string | null;
    gender?: string | null;
    model_code?: string | null;
    frame_shape?: string | null;
    frame_material?: string | null;
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
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [promptEditorMode, setPromptEditorMode] = useState<"single" | "gallery">("gallery");
  const [promptEditorSingleIndex, setPromptEditorSingleIndex] = useState<number | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const primaryImage = product?.image_url;
  const additionalImages = product?.additional_images ?? [];
  const allImages = primaryImage
    ? [primaryImage, ...additionalImages]
    : additionalImages;
  const totalImages = allImages.length;
  const canAddMore = totalImages < MAX_IMAGES;

  // Build prompts for the prompt editor
  const productForPrompt: ProductForPrompt | null = product
    ? {
        name: product.name,
        brand: product.brand,
        color: product.color,
        material: product.material,
        style: product.style,
        gender: product.gender,
        item_type: product.item_type,
        model_code: product.model_code,
        frame_shape: product.frame_shape,
        frame_material: product.frame_material,
      }
    : null;

  const isKnown = product ? isKnownBrand(product.brand) : false;
  const minRequired = isKnown ? MIN_REFERENCE_PHOTOS_KNOWN : MIN_REFERENCE_PHOTOS;
  const isBlocked = product
    ? totalImages < minRequired && product.item_type === "frames"
    : false;
  // Use reference mode whenever we have any images
  const useReferenceMode = totalImages > 0;

  const prompts: ShotPrompt[] = productForPrompt
    ? getProductPrompts(productForPrompt, useReferenceMode)
    : [];

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || !product) return;
      const validFiles: File[] = [];
      for (const file of Array.from(files)) {
        const error = validateFile(file);
        if (error) { toast.error(`${file.name}: ${error}`); } else { validFiles.push(file); }
      }
      if (validFiles.length === 0) return;
      setIsUploading(true);
      try {
        for (const file of validFiles) {
          const isPrimary = !primaryImage && validFiles.indexOf(file) === 0;
          await uploadProductImage(product.id, file, isPrimary);
        }
        toast.success(`Uploaded ${validFiles.length} image(s)`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } finally { setIsUploading(false); }
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
      } finally { setIsUploading(false); }
    },
    [product, primaryImage, deleteProductImage, queryClient]
  );

  const handleSetPrimary = useCallback(
    async (imageUrl: string) => {
      if (!product) return;
      setIsUploading(true);
      try {
        const currentIndex = allImages.indexOf(imageUrl);
        if (currentIndex > 0) {
          const newOrder = arrayMove(allImages, currentIndex, 0);
          const { error } = await supabase
            .from("products")
            .update({ image_url: newOrder[0], additional_images: newOrder.slice(1).length > 0 ? newOrder.slice(1) : null })
            .eq("id", product.id);
          if (error) throw error;
          toast.success("Primary image updated");
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
          queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
        }
      } catch (error) {
        console.error("Error setting primary:", error);
        toast.error("Failed to update primary image");
      } finally { setIsUploading(false); }
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
      setIsUploading(true);
      try {
        const { error } = await supabase
          .from("products")
          .update({ image_url: newOrder[0], additional_images: newOrder.slice(1).length > 0 ? newOrder.slice(1) : null })
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Image order updated");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } catch (error) {
        console.error("Error reordering images:", error);
        toast.error("Failed to reorder images");
      } finally { setIsUploading(false); }
    },
    [product, allImages, queryClient]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); }, []);
  const handleDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); },
    [handleFileSelect]
  );

  // Generate a single shot with optional custom prompt
  const handleGenerateSingleShot = useCallback(async (index: number, customPrompt: string) => {
    if (!product || index < 0 || index >= SHOT_SLUGS.length) return;
    const shotSlug = SHOT_SLUGS[index];
    const defaultPrompt = prompts[index]?.prompt;
    const isCustom = customPrompt !== defaultPrompt;

    setRegeneratingIndex(index);
    setIsRegenerating(true);
    try {
      // Always pass existing images as references
      const refUrls = allImages.length > 0
        ? allImages.slice(0, Math.max(minRequired, 1))
        : undefined;

      const body: Record<string, unknown> = { productId: product.id, shotSlug };
      if (isCustom) body.customPrompt = customPrompt;
      if (refUrls) body.referenceImageUrls = refUrls;

      const { data, error } = await supabase.functions.invoke("generate-product-image", { body });
      if (error) throw error;
      if (data?.succeeded > 0) {
        toast.success(`Generated "${prompts[index]?.label || shotSlug}" for ${product.sku}`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } else {
        toast.error(data?.results?.[0]?.error || `Failed to generate ${shotSlug}`);
      }
    } catch (err) {
      console.error(`Shot generation error (${shotSlug}):`, err);
      toast.error(`Failed to generate ${shotSlug}`);
    } finally {
      setRegeneratingIndex(null);
      setIsRegenerating(false);
    }
  }, [product, prompts, allImages, minRequired, queryClient]);

  // Generate all shots (full gallery) with optional custom prompts
  const handleGenerateAll = useCallback(async (customPrompts: Record<string, string>) => {
    if (!product) return;
    setIsRegenerating(true);
    try {
      // Always pass existing images as references
      const refUrls = allImages.length > 0
        ? allImages.slice(0, Math.max(minRequired, 1))
        : undefined;

      for (let i = 0; i < SHOT_SLUGS.length; i++) {
        const shotSlug = SHOT_SLUGS[i];
        setRegeneratingIndex(i);

        const body: Record<string, unknown> = { productId: product.id, shotSlug };
        if (customPrompts[shotSlug]) body.customPrompt = customPrompts[shotSlug];
        if (refUrls) body.referenceImageUrls = refUrls;

        const { data, error } = await supabase.functions.invoke("generate-product-image", { body });
        if (error) throw error;
        if (data?.succeeded === 0) {
          toast.error(`Failed on ${shotSlug}: ${data?.results?.[0]?.error || "unknown"}`);
          break;
        }
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      }

      toast.success(`Gallery generated for ${product.sku}`);
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
    } catch (err) {
      console.error("Gallery generation error:", err);
      toast.error("Failed to generate gallery");
    } finally {
      setIsRegenerating(false);
      setRegeneratingIndex(null);
    }
  }, [product, allImages, minRequired, queryClient]);

  // Open prompt editor for full gallery
  const openGalleryPromptEditor = useCallback(() => {
    setPromptEditorMode("gallery");
    setPromptEditorSingleIndex(undefined);
    setShowPromptEditor(true);
  }, []);

  // Open prompt editor for a single shot
  const openShotPromptEditor = useCallback((index: number) => {
    setPromptEditorMode("single");
    setPromptEditorSingleIndex(index);
    setShowPromptEditor(true);
  }, []);

  if (!product) return null;

  const photosNeeded = minRequired - totalImages;
  const aiButtonLabel = isBlocked
    ? `Upload ${photosNeeded} more reference photo${photosNeeded > 1 ? "s" : ""} first`
    : "Generate from Reference";

  const blockMessage = isBlocked
    ? isKnown
      ? `Upload at least ${MIN_REFERENCE_PHOTOS_KNOWN} reference photo so the AI can accurately reproduce this frame design.`
      : `"${product.brand || "House brand"}" is not a known international brand. Upload at least ${MIN_REFERENCE_PHOTOS} real photos so the AI can accurately reproduce this specific frame design.`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Manage Images
            </DialogTitle>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={openGalleryPromptEditor}
                disabled={isRegenerating || isUploading || isBlocked}
              >
                <PencilSimple className="h-4 w-4 mr-1" />
                Edit Prompts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateAll({})}
                disabled={isRegenerating || isUploading || isBlocked}
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : isBlocked ? (
                  <Camera className="h-4 w-4 mr-1" />
                ) : (
                  <Lightning className="h-4 w-4 mr-1" weight="fill" />
                )}
                {isRegenerating ? "Generating..." : aiButtonLabel}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{product.name}</span>
            <Badge variant="outline">{product.sku}</Badge>
            <Badge variant={totalImages >= MAX_IMAGES ? "default" : "secondary"}>
              {totalImages}/{MAX_IMAGES} images
            </Badge>
          </div>

          {isBlocked && blockMessage && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 mt-2">
              <div className="flex items-start gap-2">
                <Warning className="h-4 w-4 mt-0.5 flex-shrink-0" weight="fill" />
                <div>
                  <p className="font-medium">Reference photo{minRequired > 1 ? "s" : ""} required</p>
                  <p className="text-xs opacity-80 mt-0.5">{blockMessage}</p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Drag to reorder • First image is primary • Click ✏️ on a shot to edit its prompt
          </p>

          {/* Prompt Editor Panel */}
          {showPromptEditor && prompts.length > 0 && (
            <PromptEditorPanel
              prompts={prompts}
              isGenerating={isRegenerating}
              generatingIndex={regeneratingIndex}
              onGenerate={handleGenerateSingleShot}
              onGenerateAll={handleGenerateAll}
              mode={promptEditorMode}
              singleIndex={promptEditorSingleIndex}
            />
          )}

          {/* Draggable Image Grid */}
          {allImages.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={allImages} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {allImages.map((url, idx) => {
                    const isFrame = product.item_type === "frames";
                    return (
                      <DraggableImageItem
                        key={url}
                        id={url}
                        url={url}
                        index={idx}
                        isPrimary={idx === 0}
                        isUploading={isUploading}
                        isRegenerating={regeneratingIndex === idx}
                        onDelete={handleDelete}
                        onSetPrimary={idx !== 0 ? handleSetPrimary : undefined}
                        onPreview={() => setPreviewIndex(idx)}
                        onRegenerate={isFrame && idx < SHOT_SLUGS.length ? () => openShotPromptEditor(idx) : undefined}
                      />
                    );
                  })}
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
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </div>
              ) : (
                <>
                  <CloudArrowUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" weight="light" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop images here, or{" "}
                    <label className="text-primary cursor-pointer hover:underline">
                      browse
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e.target.files)}
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Max 5MB per image • {MAX_IMAGES - totalImages} slot{MAX_IMAGES - totalImages !== 1 ? "s" : ""} remaining
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Image Preview Lightbox */}
        <ImagePreviewLightbox
          images={allImages}
          currentIndex={previewIndex ?? 0}
          open={previewIndex !== null}
          onOpenChange={(open) => { if (!open) setPreviewIndex(null); }}
          onIndexChange={setPreviewIndex}
        />
      </DialogContent>
    </Dialog>
  );
};
