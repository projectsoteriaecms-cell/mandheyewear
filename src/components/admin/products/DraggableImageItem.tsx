import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { IMAGE_POSITION_LABELS } from "./ProductImageUpload";

interface DraggableImageItemProps {
  id: string;
  url: string;
  index: number;
  isPrimary?: boolean;
  isUploading?: boolean;
  onDelete: (url: string) => void;
  onSetPrimary?: (url: string) => void;
  onPreview?: (url: string) => void;
}

export const DraggableImageItem = ({
  id,
  url,
  index,
  isPrimary = false,
  isUploading = false,
  onDelete,
  onSetPrimary,
}: DraggableImageItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative rounded-lg overflow-hidden border group",
        isDragging && "opacity-50 z-50 shadow-lg",
        isPrimary && "ring-2 ring-primary"
      )}
    >
      <div className="aspect-square">
        <img
          src={url}
          alt={`Product ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 rounded bg-background/80 backdrop-blur-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Primary badge or set primary button */}
      {isPrimary ? (
        <Badge 
          className="absolute top-1 left-8 text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground"
        >
          <Star className="h-3 w-3 mr-0.5 fill-current" />
          Primary
        </Badge>
      ) : onSetPrimary ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute top-1 left-8 h-5 text-[10px] px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onSetPrimary(url)}
        >
          <Star className="h-3 w-3 mr-0.5" />
          Set Primary
        </Button>
      ) : null}

      {/* Position label */}
      <Badge 
        variant="secondary" 
        className="absolute bottom-1 left-1 text-[10px] px-1.5 py-0.5 bg-background/80 backdrop-blur-sm"
      >
        {IMAGE_POSITION_LABELS[index] || `Image ${index + 1}`}
      </Badge>

      {/* Delete button */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(url)}
        disabled={isUploading}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};
