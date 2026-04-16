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
import { ProductReviews } from "@/components/product/ProductReviews";
import { useReviewStats } from "@/components/product/hooks/useProductReviews";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { ProductDescription } from "@/components/product/ProductDescription";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { SocialProofBadge } from "@/components/product/SocialProofBadge";
import { ProductCard } from "@/modules/storefront/components/eyewear/ProductCard";
import { MobileActionBar } from "@/components/mobile";
import { InlineTryOnModal } from "@/components/try-on";
import { useProduct, useProducts } from "@/modules/products/hooks/useProducts";
import { useCart } from "@/modules/orders/hooks/useCart";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useMetaPixel } from "@/shared/hooks/useMetaPixel";
import { useInlineTryOn } from "@/modules/personalization/hooks/useInlineTryOn";
import { useTrackActivity } from "@/shared/hooks/useTrackActivity";
import { ArrowLeft, Star, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


function ReviewStarsSummary({ productId }: { productId: string }) {
  const stats = useReviewStats(productId);
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "h-4 w-4",
              s <= Math.round(stats.average) ? "fill-accent text-accent" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {stats.total > 0 ? `${stats.average.toFixed(1)} (${stats.total} review${stats.total !== 1 ? "s" : ""})` : "No reviews yet"}
      </span>
    </div>
  );
}

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

  useEffect(() => {
    if (product && !isLoading) {
      trackViewContent({
        content_ids: [product.id],
        content_name: product.name,
        content_type: "product",
        value: product.price,
        currency: "NGN",
      });
      track({
        activityType: "product_view",
        productId: product.id,
        category: product.style || undefined,
        metadata: { brand: product.brand, price_tier: product.price_tier },
      });
    }
  }, [product, isLoading, trackViewContent, track]);

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

  const handleMobileBuyNow = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product) {
      navigate(`/checkout?buyNow=${product.id}&qty=1`);
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
        <div className="pt-28 sm:pt-36 pb-24 lg:pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
              <Skeleton className="aspect-[4/5] rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-12 w-full" />
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
        <div className="pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button variant="hero" asChild>
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
      round: "Classic Round", rectangular: "Rectangular", "cat-eye": "Cat-Eye",
      aviator: "Aviator", wayfarer: "Wayfarer",
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
          <div className="mb-2 lg:mb-3">
            <Button variant="ghost" size="sm" asChild className="touch-target -ml-2">
              <Link to="/shop">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Shop</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>

          {/* Product Hero Grid — Amazon-style above-the-fold */}
          <div className="grid lg:grid-cols-2 gap-5 lg:gap-8 mb-10 lg:mb-16">
            {/* Left: Image Carousel */}
            <ProductImageGallery
              mainImage={product.image_url}
              additionalImages={product.additional_images}
              productName={product.name}
              productId={product.id}
              variant="pdp"
            />

            {/* Right: Product Info — sticky on desktop */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {getCategoryLabel(product.style)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {product.brand_line === "m_and_h_fashion" ? "M&H Lifestyle" : "M&H Medical"}
                </Badge>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Rating — live from reviews */}
              <ReviewStarsSummary productId={product.id} />

              {/* Social Proof */}
              <SocialProofBadge productId={product.id} />

              {/* Add to Cart Section (contains price, qty, Buy Now, Add to Cart, Try-On, Wishlist, trust badges) */}
              <AddToCartSection product={product} />

              {/* Collapsible Details */}
              <Accordion type="multiple" className="w-full">
                {product.description && (
                  <AccordionItem value="description">
                    <AccordionTrigger className="text-sm font-semibold">Description</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {product.description}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                )}
                <AccordionItem value="specs">
                  <AccordionTrigger className="text-sm font-semibold">Specifications</AccordionTrigger>
                  <AccordionContent>
                    <ProductSpecifications product={product} compact />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Rich Description (HTML) — below the fold */}
          {(product as any).description_html && (
            <div className="mb-8 lg:mb-12">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">Product Details</h2>
              <ProductDescription
                descriptionHtml={(product as any).description_html}
                description={product.description}
              />
            </div>
          )}

          {/* Reviews Section */}
          <div className="mb-10 lg:mb-16">
            <ProductReviews productId={product.id} />
          </div>

          {/* Related Products */}
          {filteredRelated && filteredRelated.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4 sm:mb-6">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {filteredRelated.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Action Bar — Buy Now + Add to Cart */}
      <MobileActionBar
        price={product.price}
        onPrimaryAction={handleMobileAddToCart}
        onBuyNow={handleMobileBuyNow}
        primaryLabel="Cart"
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
