

## Fix: Front View Generating Product Shot Instead of Face Try-On

### Problem
The front angle returns an empty string from `getAngleInstruction()`, so the prompt lacks an explicit instruction to show the glasses **on the person's face** from a front-facing view. The side angles work correctly because they explicitly say "Show the person turned..." — which anchors the AI to generate a face shot.

### Fix
One change in `supabase/functions/virtual-try-on/index.ts`:

**Update `getAngleInstruction` to return an explicit front-facing instruction instead of an empty string:**

```typescript
case "front":
default:
  return `
ANGLE INSTRUCTION: Show the person facing directly forward (front view) wearing the glasses on their face.
This MUST be a photo of the PERSON wearing the glasses — NOT a product shot, NOT the glasses on a case or table.
The person's face, eyes, nose, and ears must be clearly visible with the glasses properly worn.`;
```

This ensures the front view prompt explicitly tells the AI to generate a face try-on, not a product/packaging image.

### Files Modified
1. `supabase/functions/virtual-try-on/index.ts` — Add explicit front-angle instruction

