import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { OfficeApp } from "./useOfficeContext";

type Action =
  | "analyze"
  | "generate"
  | "improve"
  | "summarize"
  | "formula"
  | "custom"
  | "draft-email"
  | "reply-email";

interface UseClaudeAssistantResult {
  result: string | null;
  isLoading: boolean;
  error: string | null;
  run: (params: {
    action: Action;
    content: string;
    prompt?: string;
    officeApp?: OfficeApp;
  }) => Promise<string | null>;
  clear: () => void;
}

export function useClaudeAssistant(): UseClaudeAssistantResult {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async ({
    action,
    content,
    prompt,
    officeApp,
  }: {
    action: Action;
    content: string;
    prompt?: string;
    officeApp?: OfficeApp;
  }): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "claude-assistant",
        { body: { action, content, prompt, officeApp } }
      );

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      const text = data?.result ?? "";
      setResult(text);
      return text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  return { result, isLoading, error, run, clear };
}
