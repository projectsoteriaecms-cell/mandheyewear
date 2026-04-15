

# Disable Lovable AI Fallback for Virtual Try-On

## What Changes
One file: `supabase/functions/virtual-try-on/index.ts`

Remove the Lovable AI fallback block (lines 400–411). When the Gemini Pro key fails with a non-transient error or is rate-limited, the function will return the error directly instead of falling through to Lovable AI.

### Specifically
- **Remove** lines 400–411 (the `callLovableAIGateway` fallback block)
- If `GEMINI_API_KEY` is missing, return an error immediately instead of silently falling to Lovable AI
- Keep the `callLovableAIGateway` function definition in the file (dormant) so it can be re-enabled later with a single-line change

### Before (lines 376–411)
```
if (GEMINI_API_KEY) { ... try Gemini ... }
if (!generated) { ... try Lovable AI fallback ... }
```

### After
```
if (!GEMINI_API_KEY) {
  return json({ success: false, error: "AI service not configured" }, 500);
}
// Try Gemini only
const primary = await callGoogleGemini({ ... });
if (primary.ok) { generated = primary.data; }
else { return json({ success: false, error: primary.error }, primary.status); }
```

## What Stays the Same
- All prompts, image fetching, multi-angle logic
- The `callLovableAIGateway` function remains in code (unused) for future reactivation
- Frontend hook and modal components unchanged

