import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/modules/categories";
import { cn } from "@/shared/lib/utils";

interface SortableCategoryRowProps {
  category: Category;
  depth: number;
  hasChildren: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export const SortableCategoryRow = ({
  category,
  depth,
  hasChildren,
  onEdit,
  onDelete,
}: SortableCategoryRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getBrandLineBadge = (brandLine: string) => {
    const colors: Record<string, string> = {
      soteria_medical: "bg-primary/10 text-primary border-primary/20",
      m_and_h_fashion: "bg-accent/10 text-accent-foreground border-accent/20",
    };
    const labels: Record<string, string> = {
      soteria_medical: "Soteria Medical",
      m_and_h_fashion: "M&H Fashion",
    };
    return (
      <Badge variant="outline" className={colors[brandLine] || ""}>
        {labels[brandLine] || brandLine}
      </Badge>
    );
  };

  return (
    <TableRow 
      ref={setNodeRef} 
      style={style}
      className={cn(depth > 0 && "bg-muted/30")}
    >
      <TableCell className="w-10">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">
        <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 24}px` }}>
          {depth > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          )}
          <span>{category.name}</span>
          {hasChildren && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Parent
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
      <TableCell>{getBrandLineBadge(category.brand_line)}</TableCell>
      <TableCell>
        <Badge variant={category.is_active ? "default" : "secondary"}>
          {category.is_active ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {category.display_order ?? 0}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(category.id)}
            disabled={hasChildren}
            title={hasChildren ? "Cannot delete category with children" : "Delete category"}
          >
            <Trash2 className={cn("h-4 w-4", hasChildren ? "text-muted-foreground" : "text-destructive")} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
