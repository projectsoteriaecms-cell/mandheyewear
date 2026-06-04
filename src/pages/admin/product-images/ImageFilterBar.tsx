import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MagnifyingGlass, SquaresFour, List, Cursor, X } from "@phosphor-icons/react";

type ImageFilter = "all" | "with_images" | "missing_primary" | "complete";
type BrandTypeFilter = "all" | "known" | "house";
type ViewMode = "grid" | "list";

interface ImageFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: ImageFilter;
  onFilterChange: (value: ImageFilter) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  brandTypeFilter: BrandTypeFilter;
  onBrandTypeFilterChange: (value: BrandTypeFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectMode: boolean;
  onToggleSelectMode: () => void;
  itemTypeOptions: { type: string; label: string; count: number }[];
}

export const ImageFilterBar = ({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  brandTypeFilter,
  onBrandTypeFilterChange,
  viewMode,
  onViewModeChange,
  selectMode,
  onToggleSelectMode,
  itemTypeOptions,
}: ImageFilterBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, SKU, or brand..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filter} onValueChange={(value) => onFilterChange(value as ImageFilter)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Products</SelectItem>
          <SelectItem value="with_images">With Images</SelectItem>
          <SelectItem value="missing_primary">Missing Primary</SelectItem>
          <SelectItem value="complete">Complete (5+ images)</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={categoryFilter}
        onValueChange={onCategoryFilterChange}
      >
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {itemTypeOptions.map((opt) => (
            <SelectItem key={opt.type} value={opt.type}>
              {opt.label} ({opt.count})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={brandTypeFilter}
        onValueChange={(value) => onBrandTypeFilterChange(value as BrandTypeFilter)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Brand Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Brands</SelectItem>
          <SelectItem value="known">Known Brands</SelectItem>
          <SelectItem value="house">House Brands</SelectItem>
        </SelectContent>
      </Select>
      <ToggleGroup
        type="single"
        value={viewMode}
        onValueChange={(value) => value && onViewModeChange(value as ViewMode)}
        className="flex-shrink-0"
      >
        <ToggleGroupItem value="grid" aria-label="Grid view">
          <SquaresFour className="h-4 w-4" weight={viewMode === "grid" ? "fill" : "regular"} />
        </ToggleGroupItem>
        <ToggleGroupItem value="list" aria-label="List view">
          <List className="h-4 w-4" weight={viewMode === "list" ? "bold" : "regular"} />
        </ToggleGroupItem>
      </ToggleGroup>
      <Button
        variant={selectMode ? "default" : "outline"}
        onClick={onToggleSelectMode}
        size="sm"
        className="flex-shrink-0"
      >
        {selectMode ? (
          <>
            <X className="h-4 w-4 mr-1" />
            Exit Select
          </>
        ) : (
          <>
            <Cursor className="h-4 w-4 mr-1" />
            Select
          </>
        )}
      </Button>
    </div>
  );
};
