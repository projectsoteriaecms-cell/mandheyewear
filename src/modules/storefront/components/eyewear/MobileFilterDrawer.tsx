import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Faders } from "@phosphor-icons/react";
import { ShopSidebar } from "./ShopSidebar";
import { Badge } from "@/components/ui/badge";

interface MobileFilterDrawerProps {
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
}

export const MobileFilterDrawer = (props: MobileFilterDrawerProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button data-tour="shop-filter-btn" variant="outline" size="sm" className="gap-2 lg:hidden">
          <Faders weight="bold" className="h-4 w-4" />
          Filters & Sort
          {props.activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {props.activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[340px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-display">Filters & Sort</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <ShopSidebar {...props} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
