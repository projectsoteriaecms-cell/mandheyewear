# Edge Function Logging Implementation Guide

## 📍 **Exactly Where to Add Code**

Your Edge Function is at:
```
supabase/functions/generate-product-image/index.ts
```

### **STEP 1: Add Two Helper Functions (at the top after imports)**

**Location:** Right after the `isBrandedFrame()` function (around line 37), add these two logging functions:

```typescript
// ════════════════════════════════════════════════════════════════
// LOGGING FUNCTIONS (add this section)
// ════════════════════════════════════════════════════════════════

async function logGeneration(
  supabase: any,
  logData: {
    user_id?: string;
    product_id?: string;
    generation_type: string;
    shot_type: string;
    status: 'started' | 'success' | 'failed' | 'retrying';
    start_time: string;
    end_time?: string;
    duration_ms?: number;
    image_url?: string;
    error_code?: string;
    error_message?: string;
    attempt_number: number;
    device_type?: string;
    os_name?: string;
    browser_name?: string;
  }
) {
  try {
    await supabase
      .from('image_generation_logs')
      .insert([logData]);
    console.log(`✓ Logged: ${logData.status} - ${logData.shot_type}`);
  } catch (err) {
    console.error('Failed to log generation:', err);
    // Don't throw — logging shouldn't break the generation
  }
}

async function logError(
  supabase: any,
  logId: string,
  errorData: {
    error_type: string;
    error_code: string;
    error_message: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    suspected_cause?: string;
  }
) {
  try {
    await supabase
      .from('image_generation_errors')
      .insert([
        {
          log_id: logId,
          ...errorData,
          user_visible: true,
          auto_retry_scheduled: false,
          retry_count: 0,
        },
      ]);
    console.log(`✓ Logged error: ${errorData.error_type}`);
  } catch (err) {
    console.error('Failed to log error:', err);
  }
}

// ════════════════════════════════════════════════════════════════
```

---

## **STEP 2: Wrap Gemini API Call (Around Line 495)**

Find this function:
```typescript
async function generateImageViaGemini(
  prompt: string,
  geminiApiKey: string
): Promise<{ data: string; mimeType: string }> {
```

**WRAP IT WITH TRY-CATCH AND LOGGING:**

```typescript
async function generateImageViaGemini(
  prompt: string,
  geminiApiKey: string,
  supabase: any,  // ADD THIS PARAMETER
  logId: string,  // ADD THIS PARAMETER
  shotType: string  // ADD THIS PARAMETER
): Promise<{ data: string; mimeType: string }> {
  const startTime = Date.now();
  
  try {
    // Log that we started the API call
    await logGeneration(supabase, {
      product_id: logId,
      generation_type: 'admin_individual',
      shot_type: shotType,
      status: 'started',
      start_time: new Date().toISOString(),
      attempt_number: 1,
    });

    // Your existing API call code here...
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiApiKey,
      },
      body: JSON.stringify({
        // ... your existing payload
      }),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      const endTime = Date.now();
      
      // Log the error
      await logError(supabase, logId, {
        error_type: 'api_error',
        error_code: String(resp.status),
        error_message: `Gemini API returned ${resp.status}: ${errorText.substring(0, 200)}`,
        severity: resp.status >= 500 ? 'critical' : resp.status === 429 ? 'high' : 'medium',
        suspected_cause: resp.status === 429 ? 'rate_limit' : resp.status >= 500 ? 'server_error' : 'unknown',
      });

      // Log failure
      await logGeneration(supabase, {
        product_id: logId,
        generation_type: 'admin_individual',
        shot_type: shotType,
        status: 'failed',
        start_time: new Date(Date.now() - (endTime - startTime)).toISOString(),
        end_time: new Date().toISOString(),
        duration_ms: endTime - startTime,
        error_code: String(resp.status),
        error_message: `Gemini API returned ${resp.status}`,
        attempt_number: 1,
      });

      throw new Error(`Gemini API returned ${resp.status}: ${errorText}`);
    }

    // Parse response
    const data = await resp.json();
    const endTime = Date.now();

    // Log success
    await logGeneration(supabase, {
      product_id: logId,
      generation_type: 'admin_individual',
      shot_type: shotType,
      status: 'success',
      start_time: new Date(Date.now() - (endTime - startTime)).toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: endTime - startTime,
      image_url: data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ? 'generated' : null,
      attempt_number: 1,
    });

    return {
      data: data.candidates[0].content.parts[0].inlineData.data,
      mimeType: data.candidates[0].content.parts[0].inlineData.mimeType,
    };

  } catch (error) {
    const endTime = Date.now();
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log unexpected errors
    await logError(supabase, logId, {
      error_type: 'unknown',
      error_code: 'EXCEPTION',
      error_message: errorMessage,
      severity: 'high',
      suspected_cause: 'exception_in_generation',
    });

    // Log failure
    await logGeneration(supabase, {
      product_id: logId,
      generation_type: 'admin_individual',
      shot_type: shotType,
      status: 'failed',
      start_time: new Date(Date.now() - (endTime - startTime)).toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: endTime - startTime,
      error_code: 'EXCEPTION',
      error_message: errorMessage.substring(0, 300),
      attempt_number: 1,
    });

    throw error;
  }
}
```

---

## **STEP 3: Update All Calls to generateImageViaGemini**

Find every place that calls `generateImageViaGemini()` and add the new parameters.

**Example pattern:**
```typescript
// BEFORE:
const result = await generateImageViaGemini(prompt, geminiApiKey);

// AFTER:
const result = await generateImageViaGemini(
  prompt,
  geminiApiKey,
  supabase,           // Add this
  productId,          // Add this
  "hero"              // Add shot type like: "hero", "front", "mannequin", etc.
);
```

---

## **STEP 4: Test Logging (5 min)**

1. **Deploy the updated Edge Function:**
   ```bash
   supabase functions deploy generate-product-image
   ```

2. **Trigger one virtual try-on generation from your app**

3. **Check Supabase logs:**
   ```sql
   SELECT * FROM image_generation_logs ORDER BY created_at DESC LIMIT 5;
   ```

4. **Check error logs (if generation failed):**
   ```sql
   SELECT * FROM image_generation_errors ORDER BY created_at DESC LIMIT 5;
   ```

---

## **What You'll See**

✅ **Success case:**
```
image_generation_logs:
┌─────────────┬────────────┬──────────┬─────────────┐
│ shot_type   │ status     │ duration │ created_at  │
├─────────────┼────────────┼──────────┼─────────────┤
│ hero        │ success    │ 2345ms   │ 2:30:15 PM  │
│ front       │ success    │ 1892ms   │ 2:30:18 PM  │
│ mannequin   │ success    │ 2156ms   │ 2:30:21 PM  │
└─────────────┴────────────┴──────────┴─────────────┘
```

❌ **Error case:**
```
image_generation_errors:
┌──────────────┬────────────┬──────────────────────────┐
│ error_type   │ error_code │ error_message            │
├──────────────┼────────────┼──────────────────────────┤
│ api_error    │ 429        │ Rate limit exceeded      │
│ severity     │ high       │ (auto_retry: true)       │
└──────────────┴────────────┴──────────────────────────┘
```

---

## **Real-time Monitoring Queries**

After deployment, use these to monitor:

```sql
-- Last 10 generations
SELECT shot_type, status, duration_ms, created_at 
FROM image_generation_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- Error rate in last hour
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'success' THEN 1 END) as successes,
  ROUND(100.0 * COUNT(CASE WHEN status = 'success' THEN 1 END) / COUNT(*), 2) as success_rate
FROM image_generation_logs
WHERE created_at > NOW() - INTERVAL '1 hour';

-- What's failing
SELECT error_type, COUNT(*) as count
FROM image_generation_errors
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type
ORDER BY count DESC;
```

---

## **Why This Works**

| What We Log | Why | Where It Goes |
|-------------|-----|---------------|
| **Start** | Track attempt begins | `image_generation_logs` |
| **API Response** | Know if API succeeded/failed | `image_generation_logs` (success field) |
| **Error Details** | Classify the failure type | `image_generation_errors` (error_type) |
| **Timing** | Measure performance | `image_generation_logs` (duration_ms) |
| **Retry Patterns** | Find problem products | `v_retry_patterns` view |

This gives you **visibility into exactly what's happening** instead of just "processed: 0, success: 0, failed: 0".

