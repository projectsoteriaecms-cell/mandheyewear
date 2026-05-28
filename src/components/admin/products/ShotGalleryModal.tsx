import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowsClockwise,
  CheckCircle,
  XCircle,
  WarningCircle,
  ListChecks,
  Spinner,
  ImageBroken,
} from "@phosphor-icons/react";

// ── Shot definitions ──────────────────────────────────────────────────────────

const SHOT_SLUGS = [
  "hero",
  "front",
  "mannequin",
  "lifestyle_male",
  "lifestyle_female",
] as const;

type ShotSlug = (typeof SHOT_SLUGS)[number];

interface ShotDef {
  slug: ShotSlug;
  label: string;
  description: string;
  criteria: string[];
}

const SHOTS: ShotDef[] = [
  {
    slug: "hero",
    label: "Hero",
    description: "Main thumbnail — 3/4 angle on white",
    criteria: [
      "3/4 front-left angle (frame turned ~20–25° left)",
      "Both temples open and fully visible",
      "Seamless pure white #FFFFFF background — no gradient",
      "Frame centred, filling ~70% of canvas width",
      "Tack-sharp across every hinge screw and temple tip",
      "No model, hands, packaging, or props",
    ],
  },
  {
    slug: "front",
    label: "Front View",
    description: "Dead-on symmetrical studio shot",
    criteria: [
      "Camera perfectly dead-centre at lens height",
      "Frame faces straight ahead — bilateral symmetry",
      "Both lens openings fully visible",
      "Bridge centred, nose pads visible",
      "White background, single soft contact shadow",
      "No model, no props",
    ],
  },
  {
    slug: "mannequin",
    label: "Mannequin",
    description: "Frame on boutique display head",
    criteria: [
      "Matte black / dark charcoal abstract display bust",
      "No hair, no expression — sculptural form only",
      "Frame sits naturally: nose pads on bridge, temples over ears",
      "3/4 front angle, portrait crop, frame is visual hero",
      "White or very light neutral grey studio background",
      "No human face",
    ],
  },
  {
    slug: "lifestyle_male",
    label: "Lifestyle Male",
    description: "Black/African male editorial portrait",
    criteria: [
      "Black/African man, approx 28–35 years old",
      "Frame IDENTICAL to reference — same colour, shape, proportions",
      "Frame level on nose bridge, correctly worn",
      "Close-up bust portrait, face and frame equally sharp",
      "Warm flattering light — renders dark skin tones beautifully",
      "Confident, stylish mood — premium brand editorial standard",
    ],
  },
  {
    slug: "lifestyle_female",
    label: "Lifestyle Female",
    description: "Black/African female editorial portrait",
    criteria: [
      "Black/African woman, approx 25–35 years old",
      "Frame IDENTICAL to reference — same colour, shape, proportions",
      "Frame level on nose bridge, correctly worn",
      "Close-up bust portrait, face and frame equally sharp",
      "Warm flattering light — renders dark skin tones beautifully",
      "Sophisticated, authentic African editorial aesthetic",
    ],
  },
];

// ── Quality status ────────────────────────────────────────────────────────────

type QualityStatus = "pending" | "approved" | "flagged";

function qualityKey(productId: string, slug: string) {
  return `img-quality-${productId}-${slug}`;
}

function loadQuality(productId: string): Record<ShotSlug, QualityStatus> {
  const result = {} as Record<ShotSlug, QualityStatus>;
  for (const slug of SHOT_SLUGS) {
    const stored = localStorage.getItem(qualityKey(productId, slug));
    result[slug] = (stored as QualityStatus) || "pending";
  }
  return result;
}

function saveQuality(productId: string, slug: ShotSlug, status: QualityStatus) {
  localStorage.setItem(qualityKey(productId, slug), status);
}

// ── Shot URL mapping ─────────────────────────────────────────────────────────

function getShotUrl(
  imageUrl: string | null,
  additionalImages: string[] | null,
  slug: ShotSlug
): string | null {
  const idx = SHOT_SLUGS.indexOf(slug);
  if (idx === 0) return imageUrl || null;
  return additionalImages?.[idx - 1] || null;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface ShotGalleryModalProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export const ShotGalleryModal = ({
  productId,
  open,
  onOpenChange,
  onComplete,
}: ShotGalleryModalProps) => {
  const [product, setProduct] = useState<{
    id: string;
    name: string;
    sku: string;
    brand?: string | null;
    image_url: string | null;
    additional_images: string[] | null;
    primary_image_locked?: boolean;
  } | null>(null);

  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [regenerating, setRegenerating] = useState<Record<string, boolean>>({});
  const [quality, setQuality] = useState<Record<ShotSlug, QualityStatus>>(
    {} as Record<ShotSlug, QualityStatus>
  );

  // Fetch fresh product data whenever the modal opens
  useEffect(() => {
    if (!open || !productId) return;
    setIsLoadingProduct(true);

    supabase
      .from("products")
      .select("id, name, sku, brand, image_url, additional_images, primary_image_locked")
      .eq("id", productId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          toast.error("Could not load product data");
        } else {
          setProduct(data);
          setQuality(loadQuality(data.id));
        }
        setIsLoadingProduct(false);
      });
  }, [open, productId]);

  const handleRegenerate = useCallback(
    async (slug: ShotSlug) => {
      if (!product) return;
      if (slug === "hero" && product.primary_image_locked) {
        toast.info("Hero anchor is locked — enhance it instead of regenerating.");
        return;
      }

      setRegenerating((prev) => ({ ...prev, [slug]: true }));
      const toastId = `regen-${product.id}-${slug}`;
      toast.loading(`Regenerating ${SHOTS.find((s) => s.slug === slug)?.label}…`, {
        id: toastId,
      });

      try {
        const { data, error } = await supabase.functions.invoke("generate-product-image", {
          body: { productId: product.id, shotSlug: slug },
        });

        if (error || !data?.succeeded) {
          throw new Error(
            error?.message || data?.results?.[0]?.error || "Generation failed"
          );
        }

        toast.success(`${SHOTS.find((s) => s.slug === slug)?.label} regenerated ✓`, {
          id: toastId,
        });

        // Reset quality flag for this shot after regeneration
        saveQuality(product.id, slug, "pending");
        setQuality((prev) => ({ ...prev, [slug]: "pending" }));

        // Reload product to get fresh image URL
        const { data: fresh } = await supabase
          .from("products")
          .select("id, name, sku, brand, image_url, additional_images, primary_image_locked")
          .eq("id", product.id)
          .single();
        if (fresh) setProduct(fresh);

        onComplete?.();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Failed: ${msg}`, { id: toastId });
      } finally {
        setRegenerating((prev) => ({ ...prev, [slug]: false }));
      }
    },
    [product, onComplete]
  );

  const handleQuality = useCallback(
    (slug: ShotSlug, status: QualityStatus) => {
      if (!product) return;
      saveQuality(product.id, slug, status);
      setQuality((prev) => ({ ...prev, [slug]: status }));
    },
    [product]
  );

  const handleRegenerateFlagged = useCallback(async () => {
    const flagged = SHOT_SLUGS.filter((s) => quality[s] === "flagged");
    if (flagged.length === 0) {
      toast.info("No shots flagged for redo.");
      return;
    }
    for (const slug of flagged) {
      await handleRegenerate(slug);
    }
  }, [quality, handleRegenerate]);

  // Summary counts
  const approved = SHOT_SLUGS.filter((s) => quality[s] === "approved").length;
  const flagged = SHOT_SLUGS.filter((s) => quality[s] === "flagged").length;
  const pending = SHOT_SLUGS.filter((s) => quality[s] === "pending").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-primary" weight="fill" />
            Gallery Review
            {product && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                — {product.sku} · {product.name}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Review each of the 6 generated shots. Regenerate individual shots without
            redoing the entire gallery. Flag shots that don't meet quality standards.
          </DialogDescription>
        </DialogHeader>

        {isLoadingProduct ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !product ? (
          <p className="text-muted-foreground text-center py-8">Product not found.</p>
        ) : (
          <>
            {/* Quality summary bar */}
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2.5 text-sm">
              <span className="text-muted-foreground font-medium">Quality:</span>
              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                <CheckCircle className="h-3 w-3 mr-1" weight="fill" />
                {approved} approved
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                <XCircle className="h-3 w-3 mr-1" weight="fill" />
                {flagged} flagged
              </Badge>
              <Badge variant="secondary">
                <WarningCircle className="h-3 w-3 mr-1" weight="fill" />
                {pending} pending review
              </Badge>
              {flagged > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="ml-auto"
                  onClick={handleRegenerateFlagged}
                  disabled={Object.values(regenerating).some(Boolean)}
                >
                  <ArrowsClockwise className="h-3.5 w-3.5 mr-1" weight="bold" />
                  Regenerate all flagged ({flagged})
                </Button>
              )}
            </div>

            <Separator />

            {/* Shot grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHOTS.map((shot) => {
                const url = getShotUrl(
                  product.image_url,
                  product.additional_images,
                  shot.slug
                );
                const isRegen = !!regenerating[shot.slug];
                const isLocked = shot.slug === "hero" && product.primary_image_locked;
                const qStatus = quality[shot.slug] || "pending";

                return (
                  <div
                    key={shot.slug}
                    className={cn(
                      "flex flex-col rounded-lg border bg-card overflow-hidden transition-all",
                      qStatus === "approved" && "ring-2 ring-green-500/50 border-green-200",
                      qStatus === "flagged" && "ring-2 ring-red-500/50 border-red-200"
                    )}
                  >
                    {/* Shot image */}
                    <div
                      className="relative aspect-square overflow-hidden"
                      style={{ background: "#FFFFFF" }}
                    >
                      {url ? (
                        <img
                          src={url}
                          alt={shot.label}
                          className="w-full h-full object-contain p-[4%]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <ImageBroken className="h-10 w-10 opacity-40" />
                          <span className="text-xs">Not generated</span>
                        </div>
                      )}

                      {/* Regenerating overlay */}
                      {isRegen && (
                        <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                          <Spinner className="h-7 w-7 animate-spin text-primary" />
                          <span className="text-xs font-medium">Regenerating…</span>
                        </div>
                      )}

                      {/* Lock badge */}
                      {isLocked && (
                        <Badge className="absolute top-2 left-2 text-[10px] bg-amber-500 hover:bg-amber-500 border-0">
                          Anchor locked
                        </Badge>
                      )}

                      {/* Quality badge */}
                      {qStatus !== "pending" && (
                        <div className="absolute top-2 right-2">
                          {qStatus === "approved" ? (
                            <CheckCircle
                              className="h-6 w-6 text-green-500 drop-shadow"
                              weight="fill"
                            />
                          ) : (
                            <XCircle
                              className="h-6 w-6 text-red-500 drop-shadow"
                              weight="fill"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Shot info & controls */}
                    <div className="p-3 space-y-2 flex flex-col flex-1">
                      {/* Label row */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{shot.label}</p>
                          <p className="text-xs text-muted-foreground">{shot.description}</p>
                        </div>

                        {/* Criteria tooltip */}
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="text-muted-foreground hover:text-foreground transition-colors mt-0.5 flex-shrink-0"
                                aria-label="Quality criteria"
                              >
                                <ListChecks className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="left"
                              className="max-w-xs text-xs space-y-1 p-3"
                            >
                              <p className="font-semibold mb-1">Quality checklist:</p>
                              {shot.criteria.map((c, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                                  <span>{c}</span>
                                </div>
                              ))}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      <div className="flex-1" />

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {/* Approve */}
                        <Button
                          size="sm"
                          variant={qStatus === "approved" ? "default" : "outline"}
                          className={cn(
                            "flex-1 h-7 text-xs",
                            qStatus === "approved" && "bg-green-600 hover:bg-green-700 border-0"
                          )}
                          onClick={() =>
                            handleQuality(
                              shot.slug,
                              qStatus === "approved" ? "pending" : "approved"
                            )
                          }
                          disabled={!url || isRegen}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" weight={qStatus === "approved" ? "fill" : "regular"} />
                          {qStatus === "approved" ? "Approved" : "Approve"}
                        </Button>

                        {/* Flag */}
                        <Button
                          size="sm"
                          variant={qStatus === "flagged" ? "destructive" : "outline"}
                          className="flex-1 h-7 text-xs"
                          onClick={() =>
                            handleQuality(
                              shot.slug,
                              qStatus === "flagged" ? "pending" : "flagged"
                            )
                          }
                          disabled={!url || isRegen}
                        >
                          <XCircle className="h-3 w-3 mr-1" weight={qStatus === "flagged" ? "fill" : "regular"} />
                          {qStatus === "flagged" ? "Flagged" : "Flag"}
                        </Button>

                        {/* Regenerate */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          title={
                            isLocked
                              ? "Hero anchor is locked — enhance instead"
                              : `Regenerate ${shot.label}`
                          }
                          onClick={() => handleRegenerate(shot.slug)}
                          disabled={isRegen || isLocked || Object.values(regenerating).some(Boolean)}
                        >
                          {isRegen ? (
                            <Spinner className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ArrowsClockwise className="h-3.5 w-3.5" weight="bold" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Storefront note */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">🛒 Storefront visibility</p>
              <p>
                All approved shots appear automatically in the product page carousel —
                hero as the primary image, the remaining 5 as the additional gallery. No
                extra steps needed. Changes reflect as soon as a shot is regenerated or
                the image URLs are updated.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
