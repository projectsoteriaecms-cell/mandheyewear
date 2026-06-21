# Copy-Paste Logging Code (EXACT CODE TO COPY)

## 📁 File Location
```
supabase/functions/generate-product-image/index.ts
```

---

## ✂️ **COPY THIS CODE BLOCK #1**

**Where to paste:** Right after the imports at the very top of your file (after line 2)

**Copy this entire block and paste it after line 2:**

```typescript
// ════════════════════════════════════════════════════════════════
// MONITORING: Logging Functions (ADD THIS SECTION)
// ════════════════════════════════════════════════════════════════

async function logGeneration(supabase: any, logData: any) {
  try {
    await supabase.from("image_generation_logs").insert([logData]);
  } catch (err) {
    console.error("Logging failed (non-critical):", err);
  }
}

async function logError(supabase: any, logId: string, errorData: any) {
  try {
    await supabase.from("image_generation_errors").insert([
      {
        log_id: logId,
        ...errorData,
        user_visible: true,
      },
    ]);
  } catch (err) {
    console.error("Error logging failed (non-critical):", err);
  }
}

// ════════════════════════════════════════════════════════════════
```

**Result:** You now have two helper functions that send logs to the database.

---

## ✂️ **COPY THIS CODE BLOCK #2**

**Where to paste:** Find your `serve()` function at the bottom and wrap the main code

**Find this:**
```typescript
serve(async (req: Request) => {
  // ... your existing code ...
});
```

**Replace the `serve()` function with this (wrapping it with logging):**

```typescript
serve(async (req: Request) => {
  const startTime = Date.now();
  const logId = crypto.randomUUID();
  
  try {
    // Parse request
    const { productId, shotType, userId } = await req.json();
    
    // Log start
    await logGeneration(supabase, {
      product_id: productId,
      shot_type: shotType,
      user_id: userId,
      status: "started",
      start_time: new Date().toISOString(),
      attempt_number: 1,
    });
    
    // YOUR EXISTING CODE HERE (all the image generation logic)
    // ... everything that was already in serve() ...
    
    // When generation SUCCEEDS, add this before returning:
    const duration = Date.now() - startTime;
    await logGeneration(supabase, {
      product_id: productId,
      shot_type: shotType,
      user_id: userId,
      status: "success",
      start_time: new Date(Date.now() - duration).toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: duration,
      attempt_number: 1,
    });
    
    // Then return your response...
    return json({ success: true, /* ... rest of response ... */ });
    
  } catch (error) {
    // When generation FAILS, add this:
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    // Log the error
    await logError(supabase, logId, {
      error_type: "api_error",
      error_code: "500",
      error_message: errorMsg.substring(0, 300),
      severity: "high",
      suspected_cause: "generation_failed",
    });
    
    // Log failure
    await logGeneration(supabase, {
      product_id: productId,
      shot_type: shotType,
      user_id: userId,
      status: "failed",
      start_time: new Date(Date.now() - duration).toISOString(),
      end_time: new Date().toISOString(),
      duration_ms: duration,
      error_code: "500",
      error_message: errorMsg.substring(0, 300),
      attempt_number: 1,
    });
    
    // Return error response
    return json({ 
      success: false, 
      error: errorMsg 
    }, { status: 500 });
  }
});
```

---

## 📊 **Visual: Before vs After**

### **BEFORE (Your current code):**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { /* ... */ };

serve(async (req: Request) => {
  // Your existing image generation code
  try {
    // Generate image
    const result = await generateImageViaGemini(...);
    
    // Return result
    return json({ success: true, image: result });
  } catch (error) {
    // Return error
    return json({ error: error.message }, { status: 500 });
  }
});
```

### **AFTER (With logging):**
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ ADD LOGGING FUNCTIONS HERE
async function logGeneration(supabase: any, logData: any) {
  try {
    await supabase.from("image_generation_logs").insert([logData]);
  } catch (err) {
    console.error("Logging failed (non-critical):", err);
  }
}

async function logError(supabase: any, logId: string, errorData: any) {
  try {
    await supabase.from("image_generation_errors").insert([
      { log_id: logId, ...errorData, user_visible: true }
    ]);
  } catch (err) {
    console.error("Error logging failed (non-critical):", err);
  }
}
// ✅ END LOGGING FUNCTIONS

const corsHeaders = { /* ... */ };

serve(async (req: Request) => {
  const startTime = Date.now();
  const logId = crypto.randomUUID();
  
  try {
    const { productId, shotType, userId } = await req.json();
    
    // ✅ LOG START
    await logGeneration(supabase, {
      product_id: productId,
      shot_type: shotType,
      user_id: userId,
      status: "started",
      start_time: new Date().toISOString(),
      attempt_number: 1,
    });
    
    // Your existing image generation code here
    const result = await generateImageViaGemini(...);
    
    // ✅ LOG SUCCESS
    const duration = Date.now() - startTime;
    await logGeneration(supabase, {
      product_id: productId,
      shot_type: shotType,
      user_id: userId,
      status: "success",
      duration_ms: duration,
      attempt_number: 1,
    });
    
    return json({ success: true, image: result });
    
  } catch (error) {
    // ✅ LOG ERROR
    const duration = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    await logError(supabase, logId, {
      error_type: "api_error",
      error_code: "500",
      error_message: errorMsg.substring(0, 300),
      severity: "high",
    });
    
    await logGeneration(supabase, {
      product_id: productId,
      shot_type: shotType,
      user_id: userId,
      status: "failed",
      duration_ms: Date.now() - startTime,
      error_message: errorMsg,
      attempt_number: 1,
    });
    
    return json({ error: error.message }, { status: 500 });
  }
});
```

---

## 🎯 **3-Step Process**

### **Step 1: Copy the logging functions**
- Copy the two functions (`logGeneration` and `logError`)
- Paste right after your imports (line 2)

### **Step 2: Wrap your serve() function**
- Add `logGeneration()` calls when generation starts
- Add `logGeneration()` calls when generation succeeds
- Add `logError()` + `logGeneration()` calls when generation fails

### **Step 3: Deploy & Test**
```bash
# Deploy the function
supabase functions deploy generate-product-image

# Trigger one generation from your app

# Check the logs
# SELECT * FROM image_generation_logs ORDER BY created_at DESC LIMIT 5;
```

---

## ✅ **What Happens After You Do This**

**Before:** "processed: 0, success: 0, failed: 0" ❌ (Nothing!)

**After:** 
```sql
SELECT * FROM image_generation_logs ORDER BY created_at DESC LIMIT 3;

-- Result:
┌──────────────┬──────────┬──────────────┬──────────────┐
│ shot_type    │ status   │ duration_ms  │ created_at   │
├──────────────┼──────────┼──────────────┼──────────────┤
│ hero         │ success  │ 2345         │ 2:30:15 PM   │
│ front        │ success  │ 1892         │ 2:30:18 PM   │
│ mannequin    │ failed   │ 4567         │ 2:30:21 PM   │
└──────────────┴──────────┴──────────────┴──────────────┘
```

✅ Now you can see **what succeeded, what failed, and how long it took!**

---

## 🚨 **Important Notes**

1. **Keep it simple** - Don't copy the entire MONITORING_QA_FRAMEWORK.md, just these two blocks
2. **Logging is non-critical** - If logging fails, it won't break your image generation
3. **Test with ONE generation first** - Trigger one try-on, then check the database
4. **Deploy immediately** - `supabase functions deploy generate-product-image`

---

That's it! Just copy blocks #1 and #2, paste them, deploy, and you're done! 🚀

