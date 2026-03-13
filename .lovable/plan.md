

## Root Cause: JWT Verification Incompatibility

The `analyze-face` edge function is returning **401 "Invalid JWT"** before the function code even executes. The network logs confirm this — every request gets `{"code":401,"message":"Invalid JWT"}` and the edge function logs show zero request activity (only boot events).

The cause: `verify_jwt = true` in `supabase/config.toml` for `analyze-face`. This project uses Lovable Cloud auth which issues ES256-signed JWTs. The edge function runtime's built-in JWT verification expects HS256 tokens signed with the project's JWT secret, so it rejects the token before the function code runs.

## Fix

**1. Set `verify_jwt = false` in `supabase/config.toml`**

This disables the infrastructure-level JWT check that's rejecting ES256 tokens.

**2. Add manual auth validation inside the edge function**

Import the Supabase client in the function and validate the user from the Authorization header. This ensures the function still requires authentication but accepts the ES256 tokens from Lovable Cloud auth.

```typescript
// Inside analyze-face/index.ts, after parsing the request body:
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);
const authHeader = req.headers.get("Authorization");
const { data: { user }, error: authError } = await supabase.auth.getUser(
  authHeader?.replace("Bearer ", "")
);
if (authError || !user) {
  return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
}
```

### Files to modify
- `supabase/config.toml` — change `verify_jwt` to `false` for `analyze-face`
- `supabase/functions/analyze-face/index.ts` — add manual auth check at the start of the request handler

