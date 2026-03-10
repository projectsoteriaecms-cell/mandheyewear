import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "@phosphor-icons/react";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ShopSidebarProps {
  genderFilter: string;
  styleFilter: string;
  priceSort: string;
  priceTierFilter: string | null;
  onGenderChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onPriceSortChange: (value: string) => void;
  onPriceTierChange: (value: string | null) => void;
  activeFilterCount: number;
  onClearAll: () => void;
  className?: string;
}

const GENDER_OPTIONS: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "male", label: "Men" },
  { value: "female", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const SHAPE_OPTIONS: FilterOption[] = [
  { value: "all", label: "All Shapes" },
  { value: "round", label: "Round" },
  { value: "rectangular", label: "Rectangular" },
  { value: "cat-eye", label: "Cat-Eye" },
  { value: "aviator", label: "Aviator" },
  { value: "wayfarer", label: "Wayfarer" },
];

const PRICE_TIER_OPTIONS: FilterOption[] = [
  { value: "budget", label: "Budget" },
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "featured", label: "Featured" },
  { value: "low-high", label: "Price: Low → High" },
  { value: "high-low", label: "Price: High → Low" },
];

const FilterSection = ({
  options,
  value,
  onChange,
}: {
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={cn(
          "text-left px-3 py-2 rounded-md text-sm transition-colors",
          value === opt.value
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

export const ShopSidebar = ({
  genderFilter,
  styleFilter,
  priceSort,
  priceTierFilter,
  onGenderChange,
  onStyleChange,
  onPriceSortChange,
  onPriceTierChange,
  activeFilterCount,
  onClearAll,
  className,
}: ShopSidebarProps) => {
  return (
    <aside className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-semibold text-foreground">Filters</h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 h-auto py-1"
          >
            <X weight="bold" className="h-3 w-3" />
            Clear all ({activeFilterCount})
          </Button>
        )}
      </div>
      <Separator className="mb-4" />

      <Accordion type="multiple" defaultValue={["sort", "gender", "shape", "price"]} className="space-y-0">
        {/* Sort */}
        <AccordionItem value="sort" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Sort By
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <FilterSection options={SORT_OPTIONS} value={priceSort} onChange={onPriceSortChange} />
          </AccordionContent>
        </AccordionItem>

        {/* Gender */}
        <AccordionItem value="gender" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Gender
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <FilterSection options={GENDER_OPTIONS} value={genderFilter} onChange={onGenderChange} />
          </AccordionContent>
        </AccordionItem>

        {/* Shape */}
        <AccordionItem value="shape" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Frame Shape
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <FilterSection options={SHAPE_OPTIONS} value={styleFilter} onChange={onStyleChange} />
          </AccordionContent>
        </AccordionItem>

        {/* Price Tier */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm font-medium hover:no-underline">
            Price Range
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="flex flex-col gap-1">
              {PRICE_TIER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onPriceTierChange(priceTierFilter === opt.value ? null : opt.value)
                  }
                  className={cn(
                    "text-left px-3 py-2 rounded-md text-sm transition-colors",
                    priceTierFilter === opt.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};
