import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BottomSheet } from "@/components/mobile/BottomSheet";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { StockBadge } from "@/modules/storefront/components/eyewear/StockBadge";
import { RequestItemDialog } from "@/modules/storefront/components/eyewear/RequestItemDialog";
import { InlineTryOnModal } from "@/components/try-on";
import { useProduct } from "@/modules/products/hooks/useProducts";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useInlineTryOn } from "@/modules/personalization/hooks/useInlineTryOn";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDisplayImages } from "@/modules/products/lib/image-utils";
import type { StockStatus } from "@/modules/storefront/components/eyewear/StockBadge";
import {
  ShoppingBag,
  ExternalLink,
  Minus,
  Plus,
  Camera,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Ruler,
  Palette,
  Layers,
} from "lucide-react";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

interface ProductQuickViewProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickView = ({ productId, isOpen, onClose }: ProductQuickViewProps) => {
  const { data: product, isLoading } = useProduct(productId || "");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { modalOpen, targetProductId, savedPhotoUrl, triggerTryOn, setModalOpen } = useInlineTryOn();

  const { data: availability } = useQuery({
    queryKey: ["product-availability", productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_product_availability", {
        p_product_id: productId!,
      });
      if (error) return { status: "unknown" as StockStatus };
      return data as { mh_stock: number; other_stock: number; status: StockStatus };
    },
    enabled: !!productId,
    staleTime: 5 * 60_000,
  });

  const stockStatus: StockStatus = (availability?.status as StockStatus) || "unknown";
  const isOutOfStock = stockStatus === "out_of_stock";

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login");
      return;
    }
    if (product) {
      addToCart.mutate({ productId: product.id, quantity });
    }
  };

  const images = product ? getDisplayImages(product) : [];
  if (images.length === 0 && product) images.push("/placeholder.svg");

  const nextImage = () => setActiveImageIndex((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImageIndex((i) => (i - 1 + images.length) % images.length);

  // Reset state when dialog closes
  const handleClose = () => {
    setQuantity(1);
    setActiveImageIndex(0);
    onClose();
  };

  const specs = product
    ? [
        { label: "Material", value: product.material, icon: Layers },
        { label: "Color", value: product.color, icon: Palette },
        { label: "Frame Width", value: product.frame_width, icon: Ruler },
        { label: "Bridge", value: product.bridge_size, icon: Ruler },
        { label: "Temple", value: product.temple_length, icon: Ruler },
      ].filter((s) => s.value)
    : [];

  const content = isLoading ? (
    <div className="space-y-4 p-4">
      <Skeleton className="aspect-square rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  ) : product ? (
    <div className="grid md:grid-cols-2 gap-5">
      {/* Image Gallery */}
      <div className="space-y-2">
        <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
          <img
            src={images[activeImageIndex]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 shadow-md hover:bg-background transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          {/* Stock badge */}
          {stockStatus !== "unknown" && (
            <div className="absolute top-2 left-2">
              <StockBadge status={stockStatus} />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <WishlistButton productId={product.id} />
          </div>
        </div>
        {/* Thumbnails (desktop only) */}
        {images.length > 1 && (
          <div className="hidden md:flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-14 h-14 rounded-md overflow-hidden border-2 flex-shrink-0 transition ${
                  i === activeImageIndex ? "border-accent" : "border-transparent"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
        {/* Image dots (mobile) */}
        {images.length > 1 && (
          <div className="flex md:hidden justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIndex(i)}
                className={`w-2 h-2 rounded-full transition ${
                  i === activeImageIndex ? "bg-accent" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3 flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="capitalize">
            {product.style || "Eyewear"}
          </Badge>
          {product.gender && (
            <Badge variant="outline" className="capitalize">
              {product.gender}
            </Badge>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
          {product.name}
        </h2>

        {/* Price */}
        <p className="text-2xl font-bold text-accent">
          ₦{product.price.toLocaleString()}
        </p>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
        )}

        {/* Specs */}
        {specs.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm py-2 border-t border-b">
            {specs.map((spec) => (
              <div key={spec.label} className="flex items-center gap-1.5">
                <spec.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{spec.label}:</span>
                <span className="font-medium capitalize truncate">{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quantity */}
        {!isOutOfStock && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Qty:</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-8 text-center font-semibold">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex-1 flex flex-col justify-end pt-2 space-y-2">
          {isOutOfStock ? (
            <div onClick={(e) => e.stopPropagation()}>
              <RequestItemDialog productId={product.id} productName={product.name} />
            </div>
          ) : (
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
            >
              {addToCart.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart — ₦{(product.price * quantity).toLocaleString()}
                </>
              )}
            </Button>
          )}

          {/* Try-On + View Details row */}
          <div className="flex gap-2">
            {product.item_type === "frames" && (
              <Button
                variant="gold"
                size="sm"
                className="flex-1"
                onClick={() => triggerTryOn(product.id)}
              >
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                Try On
              </Button>
            )}
            <Button variant="outline" size="sm" asChild className="flex-1" onClick={handleClose}>
              <Link to={`/product/${product.id}`}>
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Full Details
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Inline Try-On Modal */}
      {savedPhotoUrl && (
        <InlineTryOnModal
          productId={targetProductId}
          savedPhotoUrl={savedPhotoUrl}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  ) : (
    <div className="text-center py-8">
      <p className="text-muted-foreground">Product not found</p>
    </div>
  );

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <BottomSheet
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        title={product?.name}
      >
        <div className="px-4 pb-6">{content}</div>
      </BottomSheet>
    );
  }

  // Desktop: Dialog
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>{product?.name || "Product Quick View"}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
