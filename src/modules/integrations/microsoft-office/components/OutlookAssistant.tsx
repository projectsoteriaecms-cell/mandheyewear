import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Envelope, ArrowBendUpLeft, Article, Sparkle } from "@phosphor-icons/react";
import { useClaudeAssistant } from "../hooks/useClaudeAssistant";
import { ResultPanel } from "./ResultPanel";

export function OutlookAssistant() {
  const [emailNotes, setEmailNotes] = useState("");
  const [replyNotes, setReplyNotes] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const { result, isLoading, error, run, clear } = useClaudeAssistant();

  const handleDraftEmail = async () => {
    if (!emailNotes.trim()) return;
    await run({
      action: "draft-email",
      content: emailNotes,
      officeApp: "outlook",
    });
  };

  const handleReplyEmail = async () => {
    if (!emailBody.trim()) return;
    await run({
      action: "reply-email",
      content: emailBody,
      prompt: replyNotes || undefined,
      officeApp: "outlook",
    });
  };

  const handleSummarize = async () => {
    if (!emailBody.trim()) return;
    await run({
      action: "summarize",
      content: emailBody,
      officeApp: "outlook",
    });
  };

  return (
    <div className="space-y-4">
      {/* Draft new email */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Draft New Email
        </p>
        <Textarea
          placeholder="Notes for your email, e.g. Confirm appointment on Friday at 10am, remind about pre-exam checklist..."
          value={emailNotes}
          onChange={(e) => setEmailNotes(e.target.value)}
          className="resize-none text-sm"
          rows={3}
        />
        <Button
          className="w-full"
          onClick={handleDraftEmail}
          disabled={isLoading || !emailNotes.trim()}
        >
          <Envelope className="h-4 w-4 mr-2" />
          {isLoading ? "Drafting…" : "Draft Email"}
        </Button>
      </div>

      {/* Reply or summarize */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Paste Email to Reply / Summarize
        </p>
        <Textarea
          placeholder="Paste the email you received here…"
          value={emailBody}
          onChange={(e) => setEmailBody(e.target.value)}
          className="resize-none text-sm"
          rows={4}
        />
        <Textarea
          placeholder="Optional: how should I reply? (e.g. politely decline, confirm the booking...)"
          value={replyNotes}
          onChange={(e) => setReplyNotes(e.target.value)}
          className="resize-none text-sm"
          rows={2}
        />
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleSummarize}
            disabled={isLoading || !emailBody.trim()}
          >
            <Article className="h-4 w-4 mr-1" />
            Summarize
          </Button>
          <Button
            onClick={handleReplyEmail}
            disabled={isLoading || !emailBody.trim()}
          >
            <ArrowBendUpLeft className="h-4 w-4 mr-1" />
            {isLoading ? "Writing…" : "Write Reply"}
          </Button>
        </div>
      </div>

      <ResultPanel
        result={result}
        error={error}
        isLoading={isLoading}
        onClear={clear}
      />
    </div>
  );
}
