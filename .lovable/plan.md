

# Switch Face PD Analysis from Lovable AI to Direct Google Gemini API

## Overview
Migrate the `analyze-face` edge function from the Lovable AI Gateway to calling the Google Gemini API directly using the existing `GEMINI_API_KEY` secret. This makes the face measurement system fully independent of Lovable infrastructure.

## Change

### `supabase/functions/analyze-face/index.ts`
Replace the Lovable AI Gateway call with a direct Google Gemini API call:

- **Remove**: `LOVABLE_API_KEY` usage and `ai.gateway.lovable.dev` endpoint
- **Add**: `GEMINI_API_KEY` usage with Google's `generativelanguage.googleapis.com` endpoint
- **Model**: `gemini-2.5-flash` (already available on the existing Google Cloud billing account)
- **API format**: Switch from OpenAI-compatible format to Gemini's native `generateContent` format, which uses `inlineData` for images instead of `image_url`

The prompt, validation logic, auth checks, and response parsing all remain identical — only the HTTP call changes.

| Detail | Before | After |
|--------|--------|-------|
| Secret | `LOVABLE_API_KEY` | `GEMINI_API_KEY` |
| Endpoint | `ai.gateway.lovable.dev/v1/chat/completions` | `generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent` |
| Auth | Bearer token | `?key=` query param |
| Payload | OpenAI messages format | Gemini `contents` format |

No frontend changes required — the edge function response shape stays the same.

