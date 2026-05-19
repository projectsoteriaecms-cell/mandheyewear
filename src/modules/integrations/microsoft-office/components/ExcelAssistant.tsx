import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ChartBar,
  MagnifyingGlass,
  Function,
  Sparkle,
  ArrowSquareDown,
} from "@phosphor-icons/react";
import { useExcelContent } from "../hooks/useExcelContent";
import { useClaudeAssistant } from "../hooks/useClaudeAssistant";
import { ResultPanel } from "./ResultPanel";

const QUICK_ACTIONS = [
  {
    id: "analyze",
    label: "Analyze Data",
    icon: ChartBar,
    description: "Insights and patterns in selected cells",
  },
  {
    id: "summarize",
    label: "Summarize",
    icon: MagnifyingGlass,
    description: "Plain-English summary of the data",
  },
] as const;

export function ExcelAssistant() {
  const [formulaPrompt, setFormulaPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const { getSelectedRange, insertFormulaInSelection } = useExcelContent();
  const { result, isLoading, error, run, clear } = useClaudeAssistant();

  const handleQuickAction = async (action: "analyze" | "summarize") => {
    const content = await getSelectedRange();
    await run({ action, content, officeApp: "excel" });
  };

  const handleFormulaHelp = async () => {
    if (!formulaPrompt.trim()) return;
    const content = await getSelectedRange();
    await run({
      action: "formula",
      content,
      prompt: formulaPrompt,
      officeApp: "excel",
    });
  };

  const handleCustom = async () => {
    if (!customPrompt.trim()) return;
    const content = await getSelectedRange();
    await run({
      action: "custom",
      content,
      prompt: customPrompt,
      officeApp: "excel",
    });
  };

  const handleInsertFormula = async () => {
    if (!result) return;
    // Extract formula from result (first line starting with =)
    const lines = result.split("\n");
    const formula = lines.find((l) => l.trim().startsWith("="))?.trim();
    if (formula) await insertFormulaInSelection(formula);
  };

  return (
    <div className="space-y-4">
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

      {/* Formula help */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Formula Help
        </p>
        <Textarea
          placeholder="e.g. Calculate the average sales excluding zeros, or VLOOKUP the product name from Sheet2..."
          value={formulaPrompt}
          onChange={(e) => setFormulaPrompt(e.target.value)}
          className="resize-none text-sm"
          rows={2}
        />
        <Button
          className="w-full"
          variant="outline"
          onClick={handleFormulaHelp}
          disabled={isLoading || !formulaPrompt.trim()}
        >
          <Function className="h-4 w-4 mr-2" />
          {isLoading ? "Thinking…" : "Get Formula"}
        </Button>
      </div>

      {/* Custom prompt */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Ask Claude
        </p>
        <Textarea
          placeholder="Ask anything about your selected data…"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="resize-none text-sm"
          rows={2}
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
          result && result.includes("=") ? (
            <Button size="sm" variant="outline" onClick={handleInsertFormula}>
              <ArrowSquareDown className="h-3.5 w-3.5 mr-1" />
              Insert Formula
            </Button>
          ) : null
        }
      />
    </div>
  );
}
