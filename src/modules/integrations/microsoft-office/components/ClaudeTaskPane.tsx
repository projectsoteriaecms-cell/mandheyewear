import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MicrosoftWordLogo,
  MicrosoftExcelLogo,
  MicrosoftOutlookLogo,
  MicrosoftPowerpointLogo,
  CircleNotch,
  Sparkle,
  WarningCircle,
} from "@phosphor-icons/react";
import { useOfficeContext } from "../hooks/useOfficeContext";
import { useClaudeAssistant } from "../hooks/useClaudeAssistant";
import { WordAssistant } from "./WordAssistant";
import { ExcelAssistant } from "./ExcelAssistant";
import { OutlookAssistant } from "./OutlookAssistant";
import { ResultPanel } from "./ResultPanel";

const APP_META = {
  word: {
    label: "Word",
    icon: MicrosoftWordLogo,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  excel: {
    label: "Excel",
    icon: MicrosoftExcelLogo,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  outlook: {
    label: "Outlook",
    icon: MicrosoftOutlookLogo,
    color: "text-blue-500",
    bg: "bg-sky-50",
  },
  powerpoint: {
    label: "PowerPoint",
    icon: MicrosoftPowerpointLogo,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  unknown: {
    label: "Office",
    icon: Sparkle,
    color: "text-primary",
    bg: "bg-primary/5",
  },
} as const;

function GenericAssistant() {
  const [prompt, setPrompt] = useState("");
  const { result, isLoading, error, run, clear } = useClaudeAssistant();

  const handleRun = async () => {
    if (!prompt.trim()) return;
    await run({ action: "custom", content: "", prompt });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Ask Claude anything…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="resize-none text-sm"
        rows={4}
      />
      <Button
        className="w-full"
        onClick={handleRun}
        disabled={isLoading || !prompt.trim()}
      >
        <Sparkle className="h-4 w-4 mr-2" />
        {isLoading ? "Thinking…" : "Ask Claude"}
      </Button>
      <ResultPanel
        result={result}
        error={error}
        isLoading={isLoading}
        onClear={clear}
      />
    </div>
  );
}

export function ClaudeTaskPane() {
  const { isOfficeReady, officeApp, isLoading, isOfficeEnvironment } =
    useOfficeContext();

  const meta = APP_META[officeApp];
  const Icon = meta.icon;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-muted-foreground gap-3">
        <CircleNotch className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Connecting to Office…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b ${meta.bg}`}>
        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
          <Icon className={`h-5 w-5 ${meta.color}`} weight="fill" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">
            Claude AI for {meta.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Soteria Eye Clinic
          </p>
        </div>
        {isOfficeReady && (
          <Badge variant="secondary" className="ml-auto text-xs">
            Connected
          </Badge>
        )}
      </div>

      {/* Warning if not in Office */}
      {!isOfficeEnvironment && (
        <div className="mx-4 mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2 text-xs text-amber-800">
          <WarningCircle className="h-4 w-4 shrink-0 mt-0.5" weight="fill" />
          <span>
            Preview mode — running outside Microsoft Office. Install the add-in
            to use document features.
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {officeApp === "word" && isOfficeReady ? (
          <WordAssistant />
        ) : officeApp === "excel" && isOfficeReady ? (
          <ExcelAssistant />
        ) : officeApp === "outlook" && isOfficeReady ? (
          <OutlookAssistant />
        ) : (
          <GenericAssistant />
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by Claude AI · Soteria Eye Clinic
        </p>
      </div>
    </div>
  );
}
