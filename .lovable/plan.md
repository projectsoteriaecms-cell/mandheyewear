

# Fix: "Attribute callback must be a valid function" Error

## Root Cause
In `src/pages/Checkout.tsx` (line 172), the `callback` passed to `PaystackPop.setup()` is declared as `async (response) => {...}`. Paystack's JavaScript SDK does a type check on the callback and rejects async functions. This likely worked with the live key previously due to a different SDK version or caching, but fails now.

## Solution
Wrap the async logic inside a synchronous callback function. The callback itself will be a regular function, but internally it will call an async helper.

## File Change: `src/pages/Checkout.tsx`

**Line 172** -- Change from:
```typescript
callback: async (response) => {
```

To:
```typescript
callback: (response) => {
  (async () => {
```

And wrap the closing of the async block before the `finally` block ends (around line 206), changing:
```typescript
},
```
To:
```typescript
  })();
},
```

This keeps the callback synchronous (satisfying Paystack's validation) while still running the async verification logic inside it.

## Technical Summary
- **File:** `src/pages/Checkout.tsx`
- **Change:** Convert async callback to synchronous wrapper with internal async IIFE
- **Risk:** None -- behavior is identical, only the function signature changes

