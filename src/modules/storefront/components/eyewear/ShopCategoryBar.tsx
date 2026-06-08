import { cn } from "@/lib/utils";
import { Eyeglasses, SunDim, Bag, Drop, Pill, FirstAid, Package } from "@phosphor-icons/react";

interface CategoryItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryItem[] = [
  { value: "all", label: "All", icon: Package },
  { value: "eyeglasses", label: "Eyeglasses", icon: Eyeglasses },
  { value: "sunglasses", label: "Sunglasses", icon: SunDim },
  { value: "accessories", label: "Accessories", icon: Bag },
  { value: "lenses", label: "Lenses", icon: Drop },
  { value: "contact_lenses", label: "Contacts", icon: Drop },
  { value: "solutions", label: "Solutions", icon: FirstAid },
  { value: "medications", label: "Medications", icon: Pill },
];

interface ShopCategoryBarProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, number>;
}

export const ShopCategoryBar = ({
  activeCategory,
  onCategoryChange,
  categoryCounts,
}: ShopCategoryBarProps) => {
  const visibleCategories = CATEGORIES.filter(
    (cat) => cat.value === "all" || (categoryCounts[cat.value] || 0) > 0
  );

  return (
    <div data-tour="shop-category-bar" className="flex justify-center gap-6 lg:gap-8 overflow-x-auto py-6 px-4 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {visibleCategories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.value;
        const count = categoryCounts[cat.value] || 0;

        return (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "flex flex-col items-center gap-2 min-w-[64px] group transition-all",
            )}
          >
            {/* Circular icon */}
            <div
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-muted/50 text-muted-foreground border-transparent group-hover:border-border group-hover:bg-muted"
              )}
            >
              <Icon weight={isActive ? "fill" : "light"} className="h-6 w-6" />
            </div>
            {/* Label */}
            <span
              className={cn(
                "text-xs font-medium whitespace-nowrap transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
              )}
            >
              {cat.label}
            </span>
            {/* Active underline */}
            <div
              className={cn(
                "h-0.5 w-6 rounded-full transition-all duration-300",
                isActive ? "bg-primary" : "bg-transparent"
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
