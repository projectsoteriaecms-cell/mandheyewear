import { useParams, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductSpecifications } from "@/components/product/ProductSpecifications";
import { AddToCartSection } from "@/components/product/AddToCartSection";
import { ProductCard } from "@/components/eyewear/ProductCard";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { ArrowLeft, Star } from "lucide-react";

const ProductDetail = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, error } = useProduct(productId || "");
  const { data: relatedProducts } = useProducts(product?.brand_line);

  // Filter out current product from related
  const filteredRelated = relatedProducts
    ?.filter((p) => p.id !== productId)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-6">
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
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="hero" asChild>
              <Link to="/eyewear">Browse Eyewear</Link>
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

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/eyewear">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Eyewear
              </Link>
            </Button>
          </div>

          {/* Product Grid */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Image Gallery */}
            <ProductImageGallery
              mainImage={product.image_url}
              additionalImages={product.additional_images}
              productName={product.name}
              productId={product.id}
            />

            {/* Product Info */}
            <div className="space-y-6">
              {/* Category & Brand */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {getCategoryLabel(product.style)}
                </Badge>
                <Badge variant="outline">
                  {product.brand_line === "m_and_h_fashion"
                    ? "M&H Eyewear"
                    : "Soteria Medical"}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground">
                  {product.name}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  SKU: {product.sku}
                </p>
              </div>

              {/* Rating (placeholder) */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-accent text-accent"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (12 reviews)
                </span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-muted-foreground leading-relaxed">
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

              {/* Add to Cart */}
              <AddToCartSection product={product} />
            </div>
          </div>

          {/* Specifications */}
          <div className="mb-16">
            <ProductSpecifications product={product} />
          </div>

          {/* Related Products */}
          {filteredRelated && filteredRelated.length > 0 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                You May Also Like
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRelated.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
