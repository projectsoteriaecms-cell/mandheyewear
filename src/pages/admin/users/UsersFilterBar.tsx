import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface UsersFilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
}

export const UsersFilterBar = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: UsersFilterBarProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="branch_manager">Branch Managers</SelectItem>
            <SelectItem value="branch_staff">Branch Staff</SelectItem>
            <SelectItem value="customer">Customers (Verified)</SelectItem>
            <SelectItem value="user">Users (Unverified)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardContent>
  </Card>
);
