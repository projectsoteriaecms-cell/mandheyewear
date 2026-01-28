

# Increase Product Image Upload Limit to 7MB

## Overview

A simple change to increase the maximum file size limit for product image uploads from 5MB to 7MB.

---

## Files to Modify

### 1. `src/modules/products/hooks/useProductImageUpload.ts`

**Line 5** - Update the constant:
```typescript
// From:
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// To:
const MAX_FILE_SIZE = 7 * 1024 * 1024; // 7MB
```

**Line 14** - Update the error message:
```typescript
// From:
return "File size exceeds 5MB limit.";

// To:
return "File size exceeds 7MB limit.";
```

### 2. `src/components/admin/products/QuickImageUploadModal.tsx`

Update the UI text that shows "5MB" to "7MB" in the upload zone instructions.

---

## Summary

| Change | Location |
|--------|----------|
| Update `MAX_FILE_SIZE` constant | useProductImageUpload.ts line 5 |
| Update error message | useProductImageUpload.ts line 14 |
| Update UI help text | QuickImageUploadModal.tsx |

