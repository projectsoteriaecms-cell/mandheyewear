import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";

// Placeholder images for products without images
import frame1 from "@/assets/frame-1.jpg";
import frame2 from "@/assets/frame-2.jpg";
import frame3 from "@/assets/frame-3.jpg";
import frame4 from "@/assets/frame-4.jpg";

const placeholderImages = [frame1, frame2, frame3, frame4];

const getPlaceholderImage = (index: number) => {
  return placeholderImages[index % placeholderImages.length];
};

export const FeaturedFrames = () => {
  const { data: products, isLoading } = useProducts("m_and_h_fashion");

  // Get first 4 active products
  const featuredProducts = products?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
              Featured Frames
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked designer eyewear from our premium collection
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-4">
            Featured Frames
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Handpicked designer eyewear from our premium collection
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <Link key={product.id} to={`/product/${product.id}`}>
              <Card className="group overflow-hidden hover:shadow-gold transition-all cursor-pointer h-full">
                <div className="relative h-64 overflow-hidden bg-secondary">
                  <img 
                    src={product.image_url || getPlaceholderImage(index)} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-accent font-medium capitalize">
                    {product.style || "Eyewear"}
                  </p>
                  <h3 className="font-semibold text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-bold text-accent">
                    ₦{product.price.toLocaleString()}
                  </p>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Button variant="gold" asChild>
            <Link to="/eyewear">View Full Collection</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
