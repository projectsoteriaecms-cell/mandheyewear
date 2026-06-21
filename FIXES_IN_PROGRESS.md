# M&H Eyewear: Critical Fixes — Status Report

**Date**: June 9, 2026  
**Status**: 🔄 IN PROGRESS  
**Total Issues**: 4 (3 🔴 CRITICAL, 1 🟡 HIGH)

---

## ✅ COMPLETED FIXES

### Fix #3: False Payment Claims (HMO/Insurance) — ✅ DONE

**Files Modified**:
- `src/pages/EyeCare.tsx`

**Changes**:
1. ✅ Removed "HMO & Health Insurance Accepted" from features list (line 68)
2. ✅ Removed entire "Insurance & Payment" section with false claims (lines 172-190)
3. ✅ Replaced with honest "Transparent Pricing & Payment Plans" feature
4. ✅ Kept "What to Expect" section (useful for users)

**Result**: Website no longer falsely advertises HMO/Insurance acceptance. Can be re-added when store is actually ready.

**Next Step**: Deploy to production

---

## ⏳ PENDING FIXES

### Fix #2: Eye Exam Price Mismatch — 🔄 PENDING

**Issue**: Website shows ₦25,000 but store charges ₦20,000

**Files Created**:
- `FIX_CRITICAL_ISSUES.sql` ← Run this in Supabase dashboard

**Required Action**:
1. Go to **Supabase Dashboard** → Project `znhrwzxthusqtqreawwq` → **SQL Editor**
2. Copy and paste the SQL from `FIX_CRITICAL_ISSUES.sql`
3. Execute the queries in this order:
   - First query: Check current prices (SELECT)
   - Second query: Update prices (UPDATE)
   - Third query: Verify update worked (SELECT)

**Expected Result**:
```
Before: Comprehensive Eye Exams = ₦25,000
After:  Comprehensive Eye Exams = ₦20,000
```

**Estimated Time**: 5 minutes

---

### Fix #1: Empty Product Categories (Sunglasses/Accessories) — 🔄 PENDING

**Issue**: Users can't find sunglasses or accessories (returns 0 products)

**Root Cause**: Database seeded with only M&H branded frames, no sunglasses or accessories

**Diagnostic SQL** (in `FIX_CRITICAL_ISSUES.sql`):
```sql
-- This query shows what we actually have
SELECT category, COUNT(*) as count
FROM products ...
```

**Two Options**:

**Option A: Hide Empty Categories** (Quick, 10 min)
- Remove "Sunglasses" and "Accessories" from category filters
- Show only available categories
- File: Likely `src/modules/storefront/components/Filters.tsx` or Shop page

**Option B: Add Missing Products** (Proper, 2-4 hours)
- Source sunglasses data (non-M&H brands)
- Source accessories data
- Import into products table
- Update category filters
- Test filters work

**Recommendation**: Option A for now (stop showing empty categories), then schedule Option B for next sprint

**Estimated Time**: 
- Option A: 10 min
- Option B: 2-4 hours

---

### Fix #4: Mobile Scroll Broken — 🔄 PENDING

**Issue**: Pages don't scroll on mobile (video shows user can't see content)

**Suspected Location**: `src/modules/storefront/components/home/HeroSection.tsx`

**Potential CSS Issues Found**:
- Line 197: `className="section-ink-grain relative overflow-hidden min-h-0 ..."`
- Might have nested overflow issues on mobile

**Investigation Needed**:
1. Run app on mobile device or mobile emulator
2. Try to scroll on home page
3. Check browser DevTools console for errors
4. Look for:
   - `overflow: hidden` on scrollable containers
   - `height: 100vh` locking elements
   - Nested fixed positioning

**Quick Fix Options**:
```tsx
// Option 1: Remove overflow-hidden from parent
// Before: className="... overflow-hidden ..."
// After:  className="... overflow-visible ..."

// Option 2: Add overflow-y-auto to scrollable section
// <section className="overflow-y-auto">

// Option 3: Remove min-h-0 constraint
// Before: min-h-0
// After:  min-h-screen (if appropriate)
```

**Estimated Time**: 30-60 min (diagnosis + fix)

---

## Next Steps (Priority Order)

### 🚨 TODAY (Within 2 hours)

1. ✅ **Payment claims fixed** — Code change done, ready to deploy
2. ⏳ **Price data** — Run SQL in Supabase dashboard (5 min)
3. ⏳ **Categories** — Decide Option A or B, implement Option A (10 min)

### 📋 THIS WEEK

4. ⏳ **Mobile scroll** — Test on device, diagnose, fix CSS (30-60 min)
5. ⏳ **QA Audit update** — Add mobile responsiveness + price validation checks

---

## Testing Checklist

After fixing, test these scenarios:

**Fix #2 (Price)**:
- [ ] Visit `/eye-care` page
- [ ] Check "Comprehensive Eye Exams" shows ₦20,000
- [ ] Not ₦25,000

**Fix #3 (Payment)**:
- [ ] Visit `/eye-care` page
- [ ] Scroll down
- [ ] Confirm no mention of "HMO" or "Health Insurance accepted"
- [ ] See "What to Expect" section instead

**Fix #1 (Categories)**:
- [ ] Visit `/shop`
- [ ] Check category filters
- [ ] Only show categories with products
- [ ] No "0 products" empty states

**Fix #4 (Mobile)**:
- [ ] Open site on iPhone/Android
- [ ] Home page scrolls smoothly
- [ ] All sections visible
- [ ] No stuck scroll behavior

---

## SQL Execution Instructions

**File**: `FIX_CRITICAL_ISSUES.sql`

**Steps**:
1. Open Supabase Dashboard: https://app.supabase.com
2. Login with your account
3. Select project "znhrwzxthusqtqreawwq"
4. Click "SQL Editor" in left sidebar
5. Click "+" to create new query
6. Copy and paste the UPDATE statement:
```sql
UPDATE products
SET price = 20000
WHERE item_type = 'services'
  AND name ILIKE '%Comprehensive%Exam%';
```
7. Click "Run"
8. Verify result shows "1 row updated" (or however many rows matched)

---

## Files Changed This Session

| File | Change | Status |
|------|--------|--------|
| `src/pages/EyeCare.tsx` | Removed HMO claims | ✅ Done |
| `FIX_CRITICAL_ISSUES.sql` | SQL for price fix | Created |
| `FIXES_IN_PROGRESS.md` | This file | Created |

---

## Risk Assessment

| Fix | Risk | Mitigation |
|-----|------|-----------|
| Payment claims removed | None — improvement | N/A |
| Price updated | Low — just a number change | Verify before/after in Supabase |
| Hide empty categories | Low — removes confusion | Clear messaging to users |
| Mobile scroll fix | Low — CSS fix | Test on real device before deploy |

---

## Communication to Users

Once fixed, consider a brief message:

> **We've fixed some issues:**
> - Corrected eye exam prices (₦20,000 not ₦25,000)
> - Removed unavailable payment method claims
> - Improved category browsing

---

## Related Documentation

- `FEEDBACK_ANALYSIS_REPORT.md` — Full analysis of all 4 issues
- `QA_AUDIT_SUITE.md` — How to run automated checks
- `ANALYTICS_SETUP.md` — Track these metrics going forward

---

## Next Phase: Automation

Once manual fixes are done, add to **QA Audit**:
- [ ] Price validation check (compare web prices vs store CSV)
- [ ] Payment methods check (verify what's actually accepted)
- [ ] Mobile responsiveness test (run on mobile viewport)
- [ ] Category availability check (no empty categories)

These automated checks prevent regression.
