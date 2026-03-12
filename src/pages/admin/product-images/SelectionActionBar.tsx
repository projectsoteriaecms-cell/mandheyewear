import { Button } from "@/components/ui/button";
import { Lightning, X } from "@phosphor-icons/react";

interface SelectionActionBarProps {
  visible: boolean;
  total: number;
  frames: number;
  others: number;
  shots: number;
  onGenerate: () => void;
  onExit: () => void;
}

export const SelectionActionBar = ({
  visible,
  total,
  frames,
  others,
  shots,
  onGenerate,
  onExit,
}: SelectionActionBarProps) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg">
      <div className="text-sm">
        <span className="font-semibold">{total}</span> selected
        {frames > 0 && (
          <span className="text-muted-foreground ml-1">
            ({frames} frame{frames !== 1 ? "s" : ""} × 6 shots
            {others > 0 && ` + ${others} × 1 shot`}
            {" = ~"}{shots} calls)
          </span>
        )}
        {frames === 0 && others > 0 && (
          <span className="text-muted-foreground ml-1">
            (~{shots} API call{shots !== 1 ? "s" : ""})
          </span>
        )}
      </div>
      <Button onClick={onGenerate} size="sm">
        <Lightning className="h-4 w-4 mr-1" weight="fill" />
        Generate Selected
      </Button>
      <Button variant="ghost" size="sm" onClick={onExit}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
