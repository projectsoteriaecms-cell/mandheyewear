

## Editable AI Prompts for Image Generation

### Problem
Currently the AI prompts are auto-generated and hidden from the admin. You have no way to tell the AI specifically what you want — it just does its thing based on product metadata.

### Solution
Add a **prompt editor** to the QuickImageUploadModal that lets you:
1. See the auto-generated prompt for each shot before generating
2. Edit the prompt text to add specific instructions (e.g., "translucent gray frame, not blue")
3. Optionally write a completely custom prompt from scratch
4. Regenerate individual shots with your edited prompt

### How it works

When you click the regenerate button (per-shot or full gallery), instead of firing immediately, a prompt editing panel appears. You see the auto-generated prompt text in an editable textarea. You can modify it or replace it entirely, then confirm to generate.

### Technical Changes

**1. Edge function: `supabase/functions/generate-product-image/index.ts`**
- Accept optional `customPrompt: string` parameter for single-shot regeneration
- When provided, use it instead of the auto-generated prompt
- No changes to the generation logic itself — just which prompt string is used

**2. UI: `src/modules/products/components/QuickImageUploadModal.tsx`**
- Add a "prompt editor" state: when regenerating a shot, show a dialog/panel with the auto-generated prompt pre-filled in a textarea
- Add a "Generate" confirm button that sends the (possibly edited) prompt to the edge function via a new `customPrompt` body parameter
- For full gallery regeneration, show a collapsible section with all 6 prompts editable before confirming
- Add a helper function that calls the edge function's prompt builders client-side to preview prompts (duplicate the `describeProduct` + `buildFramePrompts` logic on the client, or add an endpoint that returns prompts without generating)

**3. New component: `src/modules/products/components/PromptEditorPanel.tsx`**
- Textarea with the auto-generated prompt
- Shot label (e.g., "Hero", "Front", "Side")
- "Reset to default" button to restore auto-generated text
- "Generate" button to confirm

### Files Modified
1. `supabase/functions/generate-product-image/index.ts` — Accept `customPrompt` param
2. `src/modules/products/components/QuickImageUploadModal.tsx` — Add prompt editor flow to regenerate buttons
3. `src/modules/products/components/PromptEditorPanel.tsx` — New component for prompt editing UI
4. `src/modules/products/lib/prompt-builders.ts` — Client-side copy of prompt generation logic for preview

