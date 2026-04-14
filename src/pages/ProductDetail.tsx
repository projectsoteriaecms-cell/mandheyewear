import { useEffect, useMemo } from "react";
import { useSEO } from "@/shared/hooks/useSEO";
import { JsonLd } from "@/components/seo";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { ProductCard } from "@/modules/storefront/components/eyewear/ProductCard";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import { MobileActionBar } from "@/components/mobile";
import { InlineTryOnModal } from "@/components/try-on";
import { useProduct, useProducts } from "@/modules/products/hooks/useProducts";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { useInlineTryOn } from "@/modules/personalization/hooks/useInlineTryOn";
import { useTrackActivity } from "@/shared/hooks/useTrackActivity";
import { ArrowLeft, Star, ShoppingBag, Sparkles } from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, error } = useProduct(productId || "");

  useSEO({
    title: product ? `${product.name}${product.brand ? ` – ${product.brand}` : ""} | M&H Eyewear` : "Loading... | M&H Eyewear",
    description: product?.description || "Shop premium designer eyewear at M&H Eyewear Nigeria.",
    ogImage: product?.image_url || undefined,
    ogType: "product",
  });
  const { data: relatedProducts } = useProducts(product?.brand_line);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { trackViewContent } = useMetaPixel();
  const navigate = useNavigate();
  const { modalOpen, targetProductId, savedPhotoUrl, triggerTryOn, setModalOpen } = useInlineTryOn();
  const { track } = useTrackActivity();

  // Track ViewContent event when product loads
  useEffect(() => {
    if (product && !isLoading) {
      trackViewContent({
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.price,
        currency: "NGN",
      });
      // Track browsing activity
      track({
        activityType: "product_view",
        productId: product.id,
        category: product.style || undefined,
        metadata: { brand: product.brand, price_tier: product.price_tier },
      });
    }
  }, [product, isLoading, trackViewContent, track]);

  // Filter out current product from related
  const filteredRelated = relatedProducts
    ?.filter((p) => p.id !== productId)
    .slice(0, 4);

  const handleMobileAddToCart = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product) {
      addToCart.mutate({ productId: product.id, quantity: 1 });
    }
  };

  const productJsonLd = useMemo(() => product ? ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand || "M&H Eyewear" },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      url: `https://soteriaeyeclinic.lovable.app/product/${product.id}`,
    },
  }) : null, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 sm:pt-24 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-6 sm:h-8 w-3/4" />
                <Skeleton className="h-5 sm:h-6 w-1/4" />
                <Skeleton className="h-20 sm:h-24 w-full" />
                <Skeleton className="h-10 sm:h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center py-12 sm:py-16">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="hero" asChild className="touch-target">
              <Link to="/shop">Browse Eyewear</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const getCategoryLabel = (style: string | null): string => {
    if (!style) return "Eyewear";
    const styleMap: Record<string, string> = {
      round: "Classic Round",
      rectangular: "Rectangular",
      "cat-eye": "Cat-Eye",
      aviator: "Aviator",
      wayfarer: "Wayfarer",
    };
    return styleMap[style] || style.charAt(0).toUpperCase() + style.slice(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      {productJsonLd && <JsonLd data={productJsonLd} />}

      <div className="pt-20 sm:pt-24 pb-28 lg:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-8">
            <Button variant="ghost" size="sm" asChild className="touch-target -ml-2">
              <Link to="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Shop</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>

          {/* Product Grid */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 mb-12 lg:mb-16">
            {/* Image Gallery */}
            <ProductImageGallery
              mainImage={product.image_url}
              additionalImages={product.additional_images}
              productName={product.name}
              productId={product.id}
            />

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              {/* Category & Brand */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(product.style)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {product.brand_line === "m_and_h_fashion"
                    ? "M&H Lifestyle"
                    : "M&H Medical"}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-foreground">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Price - Prominent on mobile */}
              <p className="text-2xl sm:text-3xl font-bold text-accent lg:hidden">
                ₦{product.price.toLocaleString()}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 sm:h-5 sm:w-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  (12 reviews)
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Gender Tag */}
              {product.gender && (
                <p className="text-sm">
                  <span className="text-muted-foreground">For: </span>
                  <span className="font-medium capitalize">{product.gender}</span>
                </p>
              )}

              {/* Desktop: Add to Cart & Wishlist */}
              <div className="hidden lg:block space-y-4">
                <AddToCartSection product={product} />
                <div className="flex gap-3">
                  <WishlistButton productId={product.id} variant="full" className="flex-1" />
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => triggerTryOn(product.id)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Try On
                  </Button>
                </div>
              </div>

              {/* Mobile: Wishlist and Try-On (Cart is in sticky bar) */}
              <div className="lg:hidden space-y-3">
                <WishlistButton productId={product.id} variant="full" className="w-full" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => triggerTryOn(product.id)}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Virtual Try-On
                </Button>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-12 lg:mb-16">
            <ProductSpecifications product={product} />
          </div>

          {/* Related Products */}
          {filteredRelated && filteredRelated.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4 sm:mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredRelated.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Action Bar */}
      <MobileActionBar
        price={product.price}
        onPrimaryAction={handleMobileAddToCart}
        primaryLabel="Add to Cart"
        primaryIcon={<ShoppingBag className="h-4 w-4" />}
        isLoading={addToCart.isPending}
      />

      <Footer />

      {savedPhotoUrl && (
        <InlineTryOnModal
          productId={targetProductId}
          savedPhotoUrl={savedPhotoUrl}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
};

export default ProductDetail;
