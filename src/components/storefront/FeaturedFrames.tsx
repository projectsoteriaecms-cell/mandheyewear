import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight, Heart, Eye } from "@phosphor-icons/react";

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
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-accent font-medium uppercase tracking-widest text-sm mb-4">
              M&H Eyewear Collection
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground mb-4">
              Featured Frames
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Handpicked designer eyewear from our premium collection
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl">
                <Skeleton className="h-72 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-float-slow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <p className="text-accent font-medium uppercase tracking-widest text-sm mb-3 animate-fade-in-up">
              M&H Eyewear Collection
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-semibold text-foreground animate-fade-in-up stagger-delay-1">
              Featured Frames
            </h2>
          </div>
          <Button variant="outline" asChild className="group border-2 rounded-full px-6 hover-glow animate-fade-in-up stagger-delay-2 hover:scale-105 transition-all">
            <Link to="/eyewear" className="flex items-center gap-2">
              View All
              <ArrowRight weight="bold" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 perspective-1500">
          {featuredProducts.map((product, index) => (
            <Link 
              key={product.id} 
              to={`/product/${product.id}`}
              className="animate-cascade"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <Card className="group overflow-hidden rounded-2xl border-border hover:border-primary/30 card-3d-hover cursor-pointer h-full bg-card">
                <div className="relative h-72 overflow-hidden bg-secondary/50">
                  <img 
                    src={product.image_url || getPlaceholderImage(index)} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover overlay with gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Shimmer sweep effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>
                  
                  {/* Quick action buttons with elastic animation */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <button className="w-10 h-10 rounded-full bg-white/95 shadow-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all hover:scale-110 backdrop-blur-sm">
                      <Heart weight="bold" className="h-5 w-5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/95 shadow-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 backdrop-blur-sm" style={{ transitionDelay: '0.05s' }}>
                      <Eye weight="bold" className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Style badge with glassmorphism */}
                  {product.style && (
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1.5 rounded-full glass text-xs font-semibold text-foreground capitalize">
                        {product.style}
                      </span>
                    </div>
                  )}
                </div>
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {product.brand || "M&H Eyewear"}
                  </p>
                  <h3 className="font-display font-semibold text-foreground text-lg line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-accent">
                      ₦{product.price.toLocaleString()}
                    </p>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 hover:scale-105 transition-all">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
