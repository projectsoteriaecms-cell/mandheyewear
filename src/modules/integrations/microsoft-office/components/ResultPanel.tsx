import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Copy, X, CircleNotch } from "@phosphor-icons/react";
import { toast } from "sonner";

interface ResultPanelProps {
  result: string | null;
  error: string | null;
  isLoading: boolean;
  onClear: () => void;
  extraActions?: ReactNode;
}

export function ResultPanel({
  result,
  error,
  isLoading,
  onClear,
  extraActions,
}: ResultPanelProps) {
  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6 text-muted-foreground">
        <CircleNotch className="h-5 w-5 animate-spin mr-2" />
        <span className="text-sm">Claude is thinking…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Claude's Response
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClear}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
        {result}
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5 mr-1" />
          Copy
        </Button>
        {extraActions}
      </div>
    </div>
  );
}
