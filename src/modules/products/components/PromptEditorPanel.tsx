import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Lightning, ArrowCounterClockwise, CaretDown, CaretUp } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import type { ShotPrompt } from "../lib/prompt-builders";

interface PromptEditorPanelProps {
  prompts: ShotPrompt[];
  isGenerating: boolean;
  generatingIndex: number | null;
  onGenerate: (index: number, customPrompt: string) => void;
  onGenerateAll: (customPrompts: Record<string, string>) => void;
  mode: "single" | "gallery";
  singleIndex?: number;
}

export const PromptEditorPanel = ({
  prompts,
  isGenerating,
  generatingIndex,
  onGenerate,
  onGenerateAll,
  mode,
  singleIndex,
}: PromptEditorPanelProps) => {
  const [editedPrompts, setEditedPrompts] = useState<Record<number, string>>({});
  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    mode === "single" && singleIndex !== undefined ? singleIndex : null
  );

  const getPromptText = (index: number) => {
    return editedPrompts[index] ?? prompts[index]?.prompt ?? "";
  };

  const updatePrompt = (index: number, text: string) => {
    setEditedPrompts((prev) => ({ ...prev, [index]: text }));
  };

  const resetPrompt = (index: number) => {
    setEditedPrompts((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const isEdited = (index: number) => {
    return editedPrompts[index] !== undefined && editedPrompts[index] !== prompts[index]?.prompt;
  };

  const handleGenerateAll = () => {
    const customPrompts: Record<string, string> = {};
    prompts.forEach((p, i) => {
      if (editedPrompts[i] !== undefined) {
        customPrompts[p.slug] = editedPrompts[i];
      }
    });
    onGenerateAll(customPrompts);
  };

  const visiblePrompts = mode === "single" && singleIndex !== undefined
    ? [{ prompt: prompts[singleIndex], originalIndex: singleIndex }]
    : prompts.map((p, i) => ({ prompt: p, originalIndex: i }));

  return (
    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <Lightning className="h-4 w-4" weight="fill" />
          {mode === "single" ? "Edit Prompt" : "Edit Prompts & Generate Gallery"}
        </h4>
        {mode === "gallery" && (
          <Button
            size="sm"
            onClick={handleGenerateAll}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Lightning className="h-4 w-4 mr-1" weight="fill" />
            )}
            {isGenerating ? "Generating..." : "Generate All 6 Shots"}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visiblePrompts.map(({ prompt: shot, originalIndex }) => (
          <Collapsible
            key={shot.slug}
            open={expandedIndex === originalIndex}
            onOpenChange={(open) => setExpandedIndex(open ? originalIndex : null)}
          >
            <div className="border rounded-md bg-background">
              <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{shot.label}</span>
                  {isEdited(originalIndex) && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0">
                      edited
                    </Badge>
                  )}
                  {generatingIndex === originalIndex && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  )}
                </div>
                {expandedIndex === originalIndex ? (
                  <CaretUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <CaretDown className="h-4 w-4 text-muted-foreground" />
                )}
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-2">
                  <Textarea
                    value={getPromptText(originalIndex)}
                    onChange={(e) => updatePrompt(originalIndex, e.target.value)}
                    rows={4}
                    className="text-xs font-mono resize-y"
                    placeholder="Enter your custom prompt..."
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onGenerate(originalIndex, getPromptText(originalIndex))}
                      disabled={isGenerating}
                    >
                      {generatingIndex === originalIndex ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Lightning className="h-3 w-3 mr-1" weight="fill" />
                      )}
                      Generate This Shot
                    </Button>
                    {isEdited(originalIndex) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resetPrompt(originalIndex)}
                      >
                        <ArrowCounterClockwise className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
};
