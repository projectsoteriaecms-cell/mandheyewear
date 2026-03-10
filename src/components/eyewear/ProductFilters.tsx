import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  genderFilter: string;
  styleFilter: string;
  priceSort: string;
  onGenderChange: (value: string) => void;
  onStyleChange: (value: string) => void;
  onPriceSortChange: (value: string) => void;
  sortOnly?: boolean;
}

export const ProductFilters = ({
  genderFilter,
  styleFilter,
  priceSort,
  onGenderChange,
  onStyleChange,
  onPriceSortChange,
  sortOnly = false,
}: ProductFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card p-4 rounded-lg border">
      {!sortOnly && (
        <>
          <div className="flex-1">
            <Select value={genderFilter} onValueChange={onGenderChange}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Men</SelectItem>
                <SelectItem value="female">Women</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={styleFilter} onValueChange={onStyleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Frame Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                <SelectItem value="round">Round</SelectItem>
                <SelectItem value="rectangular">Rectangular</SelectItem>
                <SelectItem value="cat-eye">Cat-Eye</SelectItem>
                <SelectItem value="aviator">Aviator</SelectItem>
                <SelectItem value="wayfarer">Wayfarer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className="flex-1">
        <Select value={priceSort} onValueChange={onPriceSortChange}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="low-high">Price: Low to High</SelectItem>
            <SelectItem value="high-low">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
