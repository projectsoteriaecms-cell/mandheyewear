# Gemini API Integration — Complete Verification Checklist

**Date**: June 10, 2026  
**Goal**: Ensure image generation works end-to-end with zero failures

---

## ✅ STEP 1: Verify Supabase Configuration

### 1.1 Check Environment Variables

**Go to:**
- Supabase Dashboard → Project Settings → Edge Functions → Secrets

**Look for:**
- ✅ `GEMINI_API_KEY` is set
- ✅ Value starts with `AIza...` (Google API key format)
- ✅ Key is not empty or placeholder

**Screenshot what you see:**
```
Name: GEMINI_API_KEY
Value: AIza... (should be 39-40 chars)
Status: Active/Enabled
```

### 1.2 Verify Function is Deployed

**Go to:**
- Supabase Dashboard → Edge Functions → `generate-product-image`

**Check:**
- ✅ Status shows "Active" or "Deployed"
- ✅ Function is enabled (toggle is ON)
- ✅ No red error indicators

---

## ✅ STEP 2: Check Edge Function Logs for Errors

### 2.1 View Recent Logs

**Go to:**
- Supabase Dashboard → Edge Functions → `generate-product-image` → **Logs** tab

**Look for:**
- ✅ Recent invocations (within last 30 min)
- ✅ Check for "GEMINI_API_KEY not found" errors
- ✅ Check for "API rate limit" errors (429)
- ✅ Check for "Invalid API key" errors (401/403)

**If you see errors, report:**
- Error message (full text)
- Timestamp
- Request parameters if visible

---

## ✅ STEP 3: Test Image Generation (Safe Test)

### 3.1 Trigger a Single Product

**Go to:**
1. Supabase Dashboard → Table Editor → **products** table
2. Find a product with `item_type = 'frames'` (e.g., a sunglasses product you added earlier)
3. Note the product ID

### 3.2 Manually Invoke the Function (Advanced Test)

**Go to:**
- Supabase Dashboard → Edge Functions → `generate-product-image`
- Click **"Invoke Function"** button (if available)

**Pass this test body:**
```json
{
  "productId": "[PASTE_PRODUCT_ID_HERE]"
}
```

**Expected response:**
```json
{
  "processed": 1,
  "succeeded": 1,
  "failed": 0,
  "results": [
    {
      "productId": "...",
      "sku": "...",
      "success": true,
      "shots": 5
    }
  ]
}
```

---

## ✅ STEP 4: Test via UI (Real User Flow)

### 4.1 Open Admin Dashboard

1. Go to your app → Admin section
2. Navigate to **Products** → **Manage Product Images**
3. Should see the modal: "Generate Product Images"

### 4.2 Select and Generate

1. Click **"Select Products"** or **"Generate AI Images"** button
2. Select **1-2 products** (start small)
3. Click **"Start Generation"**

**Watch for:**
- ✅ Progress bar moves
- ✅ Status shows "Generating..." (not instant "complete!")
- ✅ Processed count increases (from 0 → 1 → 2, etc.)
- ✅ Succeeded count increases
- ✅ No red error messages

### 4.3 Expected Timeline

- **1 product**: ~1-2 minutes (6 shots per frame)
- **5 products**: ~5-10 minutes
- **Don't cancel** — let it run to completion

---

## ✅ STEP 5: Verify Generated Images in Database

### 5.1 Check Products Table

**Run this SQL query in Supabase SQL Editor:**

```sql
SELECT 
  id,
  sku,
  name,
  item_type,
  image_url,
  additional_images,
  updated_at
FROM products
WHERE item_type = 'frames'
  AND updated_at > now() - interval '1 hour'
ORDER BY updated_at DESC
LIMIT 10;
```

**Expected:**
- ✅ `image_url` is populated (not NULL)
- ✅ `additional_images` has 4-5 images (as JSONB array)
- ✅ `updated_at` shows recent timestamp (last 10 minutes)

### 5.2 Sample Output
```
id            | sku        | image_url                          | additional_images                    | updated_at
--------------|------------|------------------------------------|------------------------------------|---
abc-123       | RB-WAY-001 | https://storage.../abc-123/hero... | ["shot1.jpg", "shot2.jpg", ...]  | 2026-06-10 14:32:15
```

---

## 🚨 STEP 6: Troubleshooting Common Issues

### Issue A: "processed: 0, succeeded: 0"

**Causes:**
1. ❌ Gemini API key not set or invalid
2. ❌ Function can't find products to process
3. ❌ Supabase auth/permissions issue

**Fix:**
```bash
# Option 1: Verify API key format
# Go to https://aistudio.google.com/app/apikeys
# Copy the key again (39-40 chars, starts with AIza...)

# Option 2: Re-add the secret
# Supabase → Settings → Edge Functions → Secrets
# Delete GEMINI_API_KEY and re-add it
# Redeploy the function
```

### Issue B: "API rate limit exceeded (429)"

**Causes:**
- ❌ Too many API calls to Google Gemini in short time
- ❌ Free tier quota exhausted

**Fix:**
```
1. Wait 60 seconds before retrying
2. Check Google Cloud Console → Gemini API quota
3. Consider upgrading from free to paid tier
4. Space out generation (generate 5 at a time, not 50)
```

### Issue C: "Invalid API key (401)"

**Causes:**
- ❌ API key is wrong or expired
- ❌ API key doesn't have Image Generation permission

**Fix:**
```
1. Go to https://aistudio.google.com/app/apikeys
2. Create NEW API key
3. Delete old one from Supabase
4. Add new key
5. Redeploy function
```

### Issue D: Still showing "0 processed" after all fixes

**Last resort:**
1. Check Supabase function logs for exact error
2. Copy the error message
3. Report it to me with:
   - Full error text
   - Product SKU being tested
   - Timestamp of error
   - API key format (first 10 chars + "...")

---

## 📋 VERIFICATION REPORT FORMAT

**When you've completed all steps, report back:**

```
✅ GEMINI API Setup Verification

1. Environment Variables:
   - GEMINI_API_KEY set? YES/NO
   - Key starts with AIza? YES/NO

2. Function Status:
   - Function deployed? YES/NO
   - Enabled? YES/NO
   - Errors in logs? YES/NO (if yes, what error?)

3. Manual Function Test:
   - Test invocation succeeded? YES/NO
   - Response showed processed: 1? YES/NO

4. UI Test (from admin dashboard):
   - Progress moved from 0%? YES/NO
   - Processed count increased? YES/NO
   - Final succeeded count: [number]
   - Final failed count: [number]

5. Database Check:
   - Products have image_url? YES/NO
   - Products have additional_images? YES/NO

Overall Status:
- 🟢 All working (ready for production)
- 🟡 Partially working (some products generate, others fail)
- 🔴 Not working (0 processed, 0 succeeded)

If issues: [describe what happened]
```

---

## 🚀 Next Steps After Verification

Once verified:
1. ✅ Test with 10 products (batch)
2. ✅ Monitor for 24 hours for any errors
3. ✅ Gather user feedback
4. ✅ If all good → deploy to production
5. ✅ Set up automated image generation for new products

---

## 📞 Support

If you get stuck:
1. Show me the **exact error message** from logs
2. Tell me the **product SKU** you're testing
3. Show me the **Supabase function response** (if you ran manual test)

Let's make sure this works perfectly! 💪
