import { useState, useCallback, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useProductImageUpload } from "@/modules/products";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image, CloudArrowUp, Lightning, Warning, Camera, PencilSimple, ArrowRight, ArrowLeft, CheckCircle, ArrowClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DraggableImageItem } from "./DraggableImageItem";
import { ImagePreviewLightbox } from "./ImagePreviewLightbox";
import { IMAGE_POSITION_LABELS } from "./ProductImageUpload";
import { PromptEditorPanel } from "./PromptEditorPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAdminProducts } from "@/modules/products/hooks/useAdminProducts";
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

type PDCAStep = "upload" | "review" | "generate" | "finalize";

const STEP_CONFIG: { key: PDCAStep; label: string; shortLabel: string }[] = [
  { key: "upload", label: "Plan — Upload Reference", shortLabel: "PLAN" },
  { key: "review", label: "Check — Review Prompts", shortLabel: "CHECK" },
  { key: "generate", label: "Do — Generate Shots", shortLabel: "DO" },
  { key: "finalize", label: "Act — Review Gallery", shortLabel: "ACT" },
];

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
  const { products: allProducts } = useAdminProducts();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [referenceSearch, setReferenceSearch] = useState("");
  const [isSettingReference, setIsSettingReference] = useState(false);

  // PDCA step state
  const [step, setStep] = useState<PDCAStep>("upload");
  const [generatedImages, setGeneratedImages] = useState<Record<number, string>>({});
  const [currentShotIndex, setCurrentShotIndex] = useState(0);
  const [shotComplete, setShotComplete] = useState(false);

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
  const useReferenceMode = totalImages > 0;

  const prompts: ShotPrompt[] = productForPrompt
    ? getProductPrompts(productForPrompt, useReferenceMode)
    : [];

  const referenceImageUrl = primaryImage || allImages[0] || null;

  // Search results for reference image lookup
  const searchResults = useMemo(() => {
    if (!referenceSearch || referenceSearch.length < 2) return [];
    const q = referenceSearch.toLowerCase();
    return allProducts
      .filter(
        (p) =>
          p.id !== product?.id &&
          p.image_url &&
          (p.name?.toLowerCase().includes(q) ||
            p.sku?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [referenceSearch, allProducts, product?.id]);

  // Use an existing product's image as reference
  const handleUseAsReference = useCallback(
    async (sourceImageUrl: string) => {
      if (!product) return;
      setIsSettingReference(true);
      try {
        const { error } = await supabase
          .from("products")
          .update({ image_url: sourceImageUrl })
          .eq("id", product.id);
        if (error) throw error;
        toast.success("Reference image set from existing product");
        setReferenceSearch("");
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      } catch (err) {
        console.error("Error setting reference image:", err);
        toast.error("Failed to set reference image");
      } finally {
        setIsSettingReference(false);
      }
    },
    [product, queryClient]
  );

  // Reset PDCA state when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep("upload");
      setGeneratedImages({});
      setCurrentShotIndex(0);
      setShotComplete(false);
      setReferenceSearch("");
    }
    onOpenChange(newOpen);
  };

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

  // Generate a single shot — used in both review and generate steps
  const handleGenerateSingleShot = useCallback(async (index: number, customPrompt: string) => {
    if (!product || index < 0 || index >= SHOT_SLUGS.length) return;
    const shotSlug = SHOT_SLUGS[index];
    const defaultPrompt = prompts[index]?.prompt;
    const isCustom = customPrompt !== defaultPrompt;

    setRegeneratingIndex(index);
    setIsRegenerating(true);
    try {
      const refUrls = allImages.length > 0
        ? allImages.slice(0, Math.max(minRequired, 1))
        : undefined;

      const body: Record<string, unknown> = { productId: product.id, shotSlug };
      if (isCustom) body.customPrompt = customPrompt;
      if (refUrls) body.referenceImageUrls = refUrls;

      const { data, error } = await supabase.functions.invoke("generate-product-image", { body });
      if (error) throw error;
      if (data?.succeeded > 0) {
        const generatedUrl = data?.results?.[0]?.imageUrl;
        if (generatedUrl) {
          setGeneratedImages(prev => ({ ...prev, [index]: generatedUrl }));
        }
        toast.success(`Generated "${prompts[index]?.label || shotSlug}"`);
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
        setShotComplete(true);
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

  // Generate all from review step
  const handleGenerateAll = useCallback(async (customPrompts: Record<string, string>) => {
    if (!product) return;
    setStep("generate");
    setIsRegenerating(true);
    try {
      const refUrls = allImages.length > 0
        ? allImages.slice(0, Math.max(minRequired, 1))
        : undefined;

      for (let i = 0; i < SHOT_SLUGS.length; i++) {
        const shotSlug = SHOT_SLUGS[i];
        setCurrentShotIndex(i);
        setRegeneratingIndex(i);
        setShotComplete(false);

        const body: Record<string, unknown> = { productId: product.id, shotSlug };
        if (customPrompts[shotSlug]) body.customPrompt = customPrompts[shotSlug];
        if (refUrls) body.referenceImageUrls = refUrls;

        const { data, error } = await supabase.functions.invoke("generate-product-image", { body });
        if (error) throw error;
        if (data?.succeeded === 0) {
          toast.error(`Failed on ${shotSlug}: ${data?.results?.[0]?.error || "unknown"}`);
          break;
        }

        const generatedUrl = data?.results?.[0]?.imageUrl;
        if (generatedUrl) {
          setGeneratedImages(prev => ({ ...prev, [i]: generatedUrl }));
        }
        queryClient.invalidateQueries({ queryKey: ["admin-products"] });

        // Brief pause between shots
        if (i < SHOT_SLUGS.length - 1) {
          setShotComplete(true);
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      toast.success(`Gallery generated for ${product.sku}`);
      queryClient.invalidateQueries({ queryKey: ["product-image-stats"] });
      setStep("finalize");
    } catch (err) {
      console.error("Gallery generation error:", err);
      toast.error("Failed to generate gallery");
    } finally {
      setIsRegenerating(false);
      setRegeneratingIndex(null);
      setShotComplete(false);
    }
  }, [product, allImages, minRequired, queryClient]);

  if (!product) return null;

  const photosNeeded = minRequired - totalImages;
  const blockMessage = isBlocked
    ? isKnown
      ? `Upload at least ${MIN_REFERENCE_PHOTOS_KNOWN} reference photo so the AI can accurately reproduce this frame design.`
      : `"${product.brand || "House brand"}" requires at least ${MIN_REFERENCE_PHOTOS} real photos so the AI can accurately reproduce this specific frame design.`
    : null;

  const currentStepIndex = STEP_CONFIG.findIndex(s => s.key === step);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            {product.name}
            <Badge variant="outline" className="ml-1">{product.sku}</Badge>
          </DialogTitle>

          {/* PDCA Step Indicator */}
          <div className="flex items-center gap-1 pt-2">
            {STEP_CONFIG.map((s, idx) => (
              <div key={s.key} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    // Allow navigating back but not forward past current
                    if (idx <= currentStepIndex) setStep(s.key);
                  }}
                  disabled={idx > currentStepIndex}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                    step === s.key
                      ? "bg-primary text-primary-foreground"
                      : idx < currentStepIndex
                        ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {idx < currentStepIndex ? (
                    <CheckCircle className="h-3.5 w-3.5" weight="fill" />
                  ) : (
                    <span className="w-3.5 text-center">{idx + 1}</span>
                  )}
                  {s.shortLabel}
                </button>
                {idx < STEP_CONFIG.length - 1 && (
                  <div className={cn(
                    "w-4 h-px",
                    idx < currentStepIndex ? "bg-primary" : "bg-muted-foreground/30"
                  )} />
                )}
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* ─── STEP 1: PLAN (Upload) ─── */}
          {step === "upload" && (
            <>
              {isBlocked && blockMessage && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  <div className="flex items-start gap-2">
                    <Warning className="h-4 w-4 mt-0.5 flex-shrink-0" weight="fill" />
                    <div>
                      <p className="font-medium">Reference photo{minRequired > 1 ? "s" : ""} required</p>
                      <p className="text-xs opacity-80 mt-0.5">{blockMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Upload reference photo{minRequired > 1 ? "s" : ""} of this frame, or search for an existing product to pull its image.
                {totalImages > 0 && " Drag to reorder • First image is primary."}
              </p>

              {/* Search existing products for reference image */}
              <div className="space-y-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name, SKU, or brand…"
                    value={referenceSearch}
                    onChange={(e) => setReferenceSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="rounded-lg border bg-card divide-y max-h-48 overflow-y-auto">
                    {searchResults.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-2.5 hover:bg-muted/50 transition-colors">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-10 w-10 rounded object-cover border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            SKU: {p.sku} {p.brand && `• ${p.brand}`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSettingReference}
                          onClick={() => handleUseAsReference(p.image_url!)}
                        >
                          {isSettingReference ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Use as Reference"
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {referenceSearch.length >= 2 && searchResults.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No products with images found matching "{referenceSearch}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                <span>or upload new reference</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Existing images grid */}
              {allImages.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                          isRegenerating={false}
                          onDelete={handleDelete}
                          onSetPrimary={idx !== 0 ? handleSetPrimary : undefined}
                          onPreview={() => setPreviewIndex(idx)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Upload zone */}
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

              {/* Continue button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => setStep("review")}
                  disabled={isBlocked || totalImages === 0}
                >
                  Continue to Prompts
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}

          {/* ─── STEP 2: CHECK (Review Prompts) ─── */}
          {step === "review" && prompts.length > 0 && (
            <>
              {/* Reference thumbnail */}
              {referenceImageUrl && (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                  <img
                    src={referenceImageUrl}
                    alt="Reference"
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                  <div>
                    <p className="text-sm font-medium">Reference Image</p>
                    <p className="text-xs text-muted-foreground">
                      All shots will be generated based on this reference
                    </p>
                  </div>
                </div>
              )}

              <PromptEditorPanel
                prompts={prompts}
                isGenerating={isRegenerating}
                generatingIndex={regeneratingIndex}
                onGenerate={handleGenerateSingleShot}
                onGenerateAll={handleGenerateAll}
                mode="gallery"
                referenceImageUrl={referenceImageUrl}
              />

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep("upload")}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button onClick={() => handleGenerateAll({})} disabled={isRegenerating}>
                  {isRegenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Lightning className="h-4 w-4 mr-1" weight="fill" />
                  )}
                  {isRegenerating ? "Generating..." : "Generate All 6 Shots"}
                </Button>
              </div>
            </>
          )}

          {/* ─── STEP 3: DO (Generate) ─── */}
          {step === "generate" && (
            <>
              <div className="text-center py-2">
                <p className="text-sm font-medium">
                  Generating shot {currentShotIndex + 1} of {SHOT_SLUGS.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {prompts[currentShotIndex]?.label || SHOT_SLUGS[currentShotIndex]}
                </p>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentShotIndex + (shotComplete ? 1 : 0.5)) / SHOT_SLUGS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Reference</p>
                  {referenceImageUrl && (
                    <img
                      src={referenceImageUrl}
                      alt="Reference"
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {shotComplete ? "Generated" : "Generating..."}
                  </p>
                  {generatedImages[currentShotIndex] ? (
                    <img
                      src={generatedImages[currentShotIndex]}
                      alt={`Generated ${prompts[currentShotIndex]?.label}`}
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg border bg-muted flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 4: ACT (Finalize) ─── */}
          {step === "finalize" && (
            <>
              <p className="text-sm text-muted-foreground">
                Review the generated gallery. Click any image to regenerate it with a refined prompt.
              </p>

              {/* Reference strip */}
              {referenceImageUrl && (
                <div className="flex items-center gap-3 p-2 border rounded-lg bg-muted/30">
                  <img
                    src={referenceImageUrl}
                    alt="Reference"
                    className="w-12 h-12 object-cover rounded border"
                  />
                  <p className="text-xs text-muted-foreground">Original reference</p>
                </div>
              )}

              {/* Gallery grid with regeneration */}
              <div className="grid grid-cols-3 gap-3">
                {SHOT_SLUGS.map((slug, idx) => {
                  const imgUrl = generatedImages[idx];
                  const label = prompts[idx]?.label || slug;
                  return (
                    <div key={slug} className="space-y-1">
                      <div className="relative group">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={label}
                            className="w-full aspect-square object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-full aspect-square rounded-lg border bg-muted flex items-center justify-center">
                            <Image className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setCurrentShotIndex(idx);
                            setShotComplete(false);
                            setStep("generate");
                            // Trigger regeneration
                            handleGenerateSingleShot(idx, prompts[idx]?.prompt || "");
                          }}
                          disabled={isRegenerating}
                          className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
                        >
                          <ArrowClockwise className="h-5 w-5 text-white" weight="bold" />
                        </button>
                      </div>
                      <p className="text-xs text-center text-muted-foreground truncate">{label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep("review")}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Prompts
                </Button>
                <Button onClick={() => handleOpenChange(false)}>
                  <CheckCircle className="h-4 w-4 mr-1" weight="fill" />
                  Done
                </Button>
              </div>
            </>
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
