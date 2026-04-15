

# Add Retry with Exponential Backoff for Virtual Try-On

## What Changes
One file: `supabase/functions/virtual-try-on/index.ts`

### 1. Add a retry helper function
A generic `withRetry` async wrapper that:
- Retries up to **3 attempts** (configurable)
- Only retries on 429 status codes
- Uses exponential backoff: 2s → 4s → 8s delays
- Logs each retry attempt

### 2. Wrap `callGoogleGemini` in the retry loop
Replace the single call on lines 380–398 with the retry wrapper. On each 429, wait and retry. If all retries exhaust, return the final error as before (wrapped in 200 for transient errors).

### Code Shape

```typescript
// New helper near top of file
const withRetry = async <T>(
  fn: () => Promise<{ ok: true; data: T } | { ok: false; status: number; error: string; raw?: string }>,
  maxAttempts = 3,
  baseDelayMs = 2000
) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await fn();
    if (result.ok || result.status !== 429 || attempt === maxAttempts) {
      return result;
    }
    const delay = baseDelayMs * Math.pow(2, attempt - 1);
    console.log(`Rate limited (429). Retry ${attempt}/${maxAttempts} after ${delay}ms...`);
    await new Promise(r => setTimeout(r, delay));
  }
  // Unreachable, but satisfies TS
  return fn();
};
```

Then lines 380–398 become:
```typescript
const primary = await withRetry(() => callGoogleGemini({
  apiKey: GEMINI_API_KEY,
  userImageBase64,
  frameImageBase64: frameImage?.base64,
  frameImageMimeType: frameImage?.mimeType,
  prompt,
}));

if (primary.ok) {
  generated = primary.data;
} else {
  const isTransient = primary.status === 429 || primary.status >= 500;
  return json({ success: false, error: primary.error, fallback: isTransient }, isTransient ? 200 : primary.status);
}
```

## What Stays the Same
- All prompts, image fetching, multi-angle logic
- Dormant Lovable AI gateway function
- Frontend unchanged
- Non-429 errors still fail immediately

