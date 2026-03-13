import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MagnifyingGlass, Warning } from "@phosphor-icons/react";

interface Branch {
  id: string;
  name: string;
}

interface InventoryFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  branches?: Branch[];
  showLowStockOnly: boolean;
  onToggleLowStock: () => void;
}

export const InventoryFilters = ({
  searchTerm,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  branches,
  showLowStockOnly,
  onToggleLowStock,
}: InventoryFiltersProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Filters</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" weight="light" />
          <Input
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedBranch} onValueChange={onBranchChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches?.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showLowStockOnly ? "default" : "outline"}
          onClick={onToggleLowStock}
        >
          <Warning className="mr-2 h-4 w-4" weight="light" />
          Low Stock Only
        </Button>
      </div>
    </CardContent>
  </Card>
);
