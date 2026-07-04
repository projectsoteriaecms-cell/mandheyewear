import { Camera, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { isCameraKitConfigured } from "@/config/snap-lenses";

export type TryOnMode = "photo" | "ar";

interface TryOnModeToggleProps {
  mode: TryOnMode;
  onModeChange: (mode: TryOnMode) => void;
  disabled?: boolean;
}

export const TryOnModeToggle = ({ mode, onModeChange, disabled = false }: TryOnModeToggleProps) => {
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => onModeChange(value as TryOnMode)}
      className="w-full max-w-md mx-auto"
    >
      <TabsList className="grid w-full grid-cols-2 h-12">
        <TabsTrigger
          value="photo"
          disabled={disabled}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Camera className="h-4 w-4" />
          <span>Photo Mode</span>
        </TabsTrigger>
        <TabsTrigger
          value="ar"
          disabled={disabled}
          className="flex items-center gap-2 text-sm font-medium relative"
        >
          <Sparkles className="h-4 w-4" />
          <span>Live AR</span>
          {!isCameraKitConfigured() && (
            <Badge
              variant="outline"
              className="absolute -top-2 -right-1 text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground border-border"
            >
              Coming Soon
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
