import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  PencilSimple,
  Article,
  TextAa,
  Sparkle,
  ClipboardText,
  ArrowSquareDown,
} from "@phosphor-icons/react";
import { useWordContent } from "../hooks/useWordContent";
import { useClaudeAssistant } from "../hooks/useClaudeAssistant";
import { ResultPanel } from "./ResultPanel";

const QUICK_ACTIONS = [
  {
    id: "improve",
    label: "Improve Writing",
    icon: PencilSimple,
    description: "Fix grammar and enhance clarity",
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: Article,
    description: "Condense selected text or whole doc",
  },
  {
    id: "analyze",
    label: "Analyze",
    icon: TextAa,
    description: "Get insights and observations",
  },
] as const;

export function WordAssistant() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [contentSource, setContentSource] = useState<"selection" | "document">(
    "selection"
  );
  const { getSelectedText, getDocumentText, insertText } = useWordContent();
  const { result, isLoading, error, run, clear } = useClaudeAssistant();

  const getContent = async () => {
    if (contentSource === "selection") {
      const sel = await getSelectedText();
      if (sel) return sel;
    }
    return getDocumentText();
  };

  const handleQuickAction = async (
    action: "improve" | "summarize" | "analyze"
  ) => {
    const content = await getContent();
    if (!content) return;
    await run({ action, content, officeApp: "word" });
  };

  const handleCustom = async () => {
    if (!customPrompt.trim()) return;
    const content = await getContent();
    await run({
      action: "custom",
      content,
      prompt: customPrompt,
      officeApp: "word",
    });
  };

  const handleInsert = async () => {
    if (!result) return;
    await insertText(result, "replace");
  };

  return (
    <div className="space-y-4">
      {/* Content source toggle */}
      <div className="flex gap-2">
        <Badge
          variant={contentSource === "selection" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setContentSource("selection")}
        >
          Selected text
        </Badge>
        <Badge
          variant={contentSource === "document" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setContentSource("document")}
        >
          Whole document
        </Badge>
      </div>

      {/* Quick actions */}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Quick Actions
        </p>
        <div className="grid grid-cols-1 gap-2">
          {QUICK_ACTIONS.map(({ id, label, icon: Icon, description }) => (
            <Button
              key={id}
              variant="outline"
              className="justify-start h-auto py-2 px-3"
              onClick={() => handleQuickAction(id)}
              disabled={isLoading}
            >
              <Icon className="h-4 w-4 mr-2 shrink-0" />
              <div className="text-left">
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">
                  {description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Generate section */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ask Claude
        </p>
        <Textarea
          placeholder="e.g. Rewrite this in a formal tone, or Draft a follow-up paragraph about eye health..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="resize-none text-sm"
          rows={3}
        />
        <Button
          className="w-full"
          onClick={handleCustom}
          disabled={isLoading || !customPrompt.trim()}
        >
          <Sparkle className="h-4 w-4 mr-2" />
          {isLoading ? "Thinking…" : "Ask Claude"}
        </Button>
      </div>

      {/* Result */}
      <ResultPanel
        result={result}
        error={error}
        isLoading={isLoading}
        onClear={clear}
        extraActions={
          result ? (
            <Button size="sm" variant="outline" onClick={handleInsert}>
              <ArrowSquareDown className="h-3.5 w-3.5 mr-1" />
              Insert into Doc
            </Button>
          ) : null
        }
      />
    </div>
  );
}
