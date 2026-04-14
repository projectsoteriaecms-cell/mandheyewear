import { useState } from "react";
import { MagnifyingGlass, CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { SearchDialog } from "@/components/search/SearchDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const searchCategories = [
  { key: "all", label: "All" },
  { key: "eyeglasses", label: "Eyeglasses" },
  { key: "sunglasses", label: "Sunglasses" },
  { key: "accessories", label: "Accessories" },
];

export const SearchStrip = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");

  return (
    <>
      <div className="bg-muted/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          {/* Desktop/Tablet: full search bar */}
          <div
            className="hidden md:flex items-center w-full max-w-2xl mx-auto h-11 rounded-full border border-border bg-background hover:border-primary/40 transition-colors cursor-text shadow-sm"
            onClick={() => setSearchOpen(true)}
          >
            {/* Category dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-1 px-4 h-full text-xs font-medium text-muted-foreground hover:text-foreground border-r border-border rounded-l-full bg-muted/60 whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {searchCategories.find((c) => c.key === searchCategory)?.label}
                  <CaretDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                {searchCategories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchCategory(cat.key);
                    }}
                    className={cn(cat.key === searchCategory && "bg-accent")}
                  >
                    {cat.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Placeholder text */}
            <div className="flex-1 flex items-center px-4 h-full text-sm text-muted-foreground">
              Search eyewear, brands, styles...
            </div>

            {/* Search icon button */}
            <button
              className="flex items-center justify-center h-9 w-9 rounded-full bg-primary text-primary-foreground mr-1 hover:bg-primary/90 transition-colors"
              onClick={() => setSearchOpen(true)}
            >
              <MagnifyingGlass weight="bold" className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile: simplified tappable bar */}
          <div
            className="flex md:hidden items-center w-full h-10 rounded-full border border-border bg-background hover:border-primary/40 transition-colors cursor-text shadow-sm"
            onClick={() => setSearchOpen(true)}
          >
            <div className="flex items-center gap-2 px-4 flex-1 text-sm text-muted-foreground">
              <MagnifyingGlass weight="light" className="h-4 w-4 flex-shrink-0" />
              Search eyewear, brands, styles...
            </div>
          </div>
        </div>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};
