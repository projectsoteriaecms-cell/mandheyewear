import { Link } from "react-router-dom";
import { useActiveCategories } from "@/modules/categories";
import {
  Eyeglasses,
  SunDim,
  BookOpenText,
  Gradient,
  CircleHalf,
  DiamondsFour,
  Airplane,
  Cat,
  Circle,
  Rectangle,
  Tag,
  Sparkle,
  TrendUp,
  CurrencyCircleDollar,
  ArrowRight,
} from "@phosphor-icons/react";
import type { IconWeight } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";

// Map category slugs to Phosphor icons
const categoryIconMap: Record<string, React.ElementType> = {
  "prescription-glasses": Eyeglasses,
  "reading-glasses": BookOpenText,
  "progressive-lenses": Gradient,
  "blue-light-glasses": CircleHalf,
  "designer-frames": DiamondsFour,
  "sunglasses": SunDim,
  "aviator-collection": Airplane,
  "cat-eye-collection": Cat,
  "round-collection": Circle,
  "rectangular-collection": Rectangle,
};

// Quick filter options
const quickFilters = [
  { label: "On Sale", filter: "on-sale", icon: Tag },
  { label: "New In", filter: "new-arrivals", icon: Sparkle },
  { label: "Best Sellers", filter: "best-sellers", icon: TrendUp },
  { label: "Under ₦30k", filter: "under-30000", icon: CurrencyCircleDollar },
];

export const QuickCategories = () => {
  const { data: categories, isLoading } = useActiveCategories();

  return (
    <section className="py-8 lg:py-12 bg-muted/30">
      <div className="container px-4">
        {/* Category Bubbles */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Shop by Category
          </h2>
          
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <Skeleton className="w-14 h-3" />
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories?.map((category) => {
                const IconComponent = categoryIconMap[category.slug] || Eyeglasses;
                
                return (
                  <Link
                    key={category.id}
                    to={`/eyewear?category=${category.slug}`}
                    className="flex flex-col items-center gap-2 min-w-[72px] snap-start group"
                  >
                    <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center transition-all duration-300 group-hover:border-accent group-hover:shadow-gold group-hover:scale-105">
                      <IconComponent 
                        weight="light" 
                        className="w-7 h-7 text-foreground/70 group-hover:text-accent transition-colors" 
                      />
                    </div>
                    <span className="text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2 max-w-[72px]">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Promotional Banner */}
        <div className="mb-8">
          <Link 
            to="/eyewear?filter=new-arrivals"
            className="block relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border border-border hover:border-accent/50 transition-all duration-300 group"
          >
            <div className="px-6 py-8 lg:py-10">
              <div className="max-w-lg">
                <span className="inline-block text-xs font-medium uppercase tracking-wider text-accent mb-2">
                  New Collection
                </span>
                <h3 className="text-xl lg:text-2xl font-serif font-semibold text-foreground mb-2">
                  2026 Designer Frames
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover our latest curated selection of premium eyewear
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-accent group-hover:gap-3 transition-all">
                  Shop Now
                  <ArrowRight weight="bold" className="w-4 h-4" />
                </span>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -right-4 top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl" />
          </Link>
        </div>

        {/* Quick Filter Pills */}
        <div>
          <div 
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              
              return (
                <Link
                  key={filter.filter}
                  to={`/eyewear?filter=${filter.filter}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-border text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent whitespace-nowrap transition-all duration-200 hover:shadow-sm"
                >
                  <IconComponent weight="light" className="w-4 h-4" />
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
