import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type OfficeApp = "word" | "excel" | "powerpoint" | "outlook";
type Action =
  | "analyze"
  | "generate"
  | "improve"
  | "summarize"
  | "formula"
  | "custom"
  | "draft-email"
  | "reply-email";

interface ClaudeRequest {
  action: Action;
  content: string;
  prompt?: string;
  officeApp?: OfficeApp;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, prompt, officeApp }: ClaudeRequest =
      await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

    const systemPrompt = buildSystemPrompt(officeApp);
    const userMessage = buildUserMessage(action, content, prompt);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || "Claude API error");
    }

    const data = await response.json();
    const result = data.content[0]?.text ?? "";

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildSystemPrompt(officeApp?: OfficeApp): string {
  const appContext: Record<OfficeApp, string> = {
    word:
      "You are integrated into Microsoft Word. Help users write, edit, and analyse documents. Be professional and concise. Format your responses clearly.",
    excel:
      "You are integrated into Microsoft Excel. Help users analyse data, write formulas, and interpret spreadsheets. When providing Excel formulas, output them ready to paste (starting with =). Be precise.",
    powerpoint:
      "You are integrated into Microsoft PowerPoint. Help users craft compelling slide content. Focus on clarity, brevity, and impact.",
    outlook:
      "You are integrated into Microsoft Outlook. Help users write professional emails. Be concise, polite, and clear.",
  };

  const ctx = officeApp ? appContext[officeApp] : "You are integrated into Microsoft Office.";
  return `You are Claude, an AI assistant for Soteria Eye Clinic. ${ctx} Always respond in plain text unless the user requests markdown.`;
}

function buildUserMessage(
  action: Action,
  content: string,
  prompt?: string
): string {
  const templates: Record<Action, string> = {
    analyze: `Analyse the following content and provide key insights, patterns, and observations:\n\n${content}`,
    generate: `${prompt ?? "Generate relevant content for the following context"}:\n\n${content}`,
    improve: `Improve the following text for clarity, grammar, and professionalism. Return only the improved text:\n\n${content}`,
    summarize: `Provide a concise summary of the following content:\n\n${content}`,
    formula: `Suggest the best Excel formula for this task: ${prompt ?? ""}\n\nSpreadsheet context:\n${content}`,
    custom: `${prompt ?? ""}\n\nContent:\n${content}`,
    "draft-email": `Draft a professional email based on the following notes or context:\n\n${content}`,
    "reply-email": `Write a professional reply to this email:\n\n${content}${prompt ? `\n\nMy reply should: ${prompt}` : ""}`,
  };
  return templates[action];
}
