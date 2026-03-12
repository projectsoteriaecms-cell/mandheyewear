

## Fix: Staff Invitation Signup Should Skip Customer Onboarding

### Problem Found
When an invited staff member (e.g., branch_staff, admin) signs up via the invitation link (`/signup?email=...`), the `Signup.tsx` page **always** redirects to `/onboarding` (line 106). This sends staff through the customer face-scan/style-quiz flow, which is irrelevant for them.

The database trigger `handle_new_user` correctly assigns the invited role, but the frontend doesn't check what role was assigned before redirecting.

### Fix

**`src/pages/Signup.tsx`** — After successful signup, query the user's assigned role before redirecting:

1. After `signUp()` succeeds, fetch the new user's session (auto-confirm is enabled per memory)
2. Query `user_roles` for the newly created user
3. If the role is a staff/admin role (`branch_staff`, `branch_manager`, `admin`, `super_admin`), redirect to `/admin` instead of `/onboarding`
4. If the role is `customer` or `user`, redirect to `/onboarding` as before

The logic mirrors what `Login.tsx` already does (lines 72-106) — fetch role + profile, then route accordingly.

### Code Change (single file)

```typescript
// In handleSubmit, after successful signUp:
const { data: sessionData } = await supabase.auth.getSession();
const userId = sessionData?.session?.user?.id;

if (userId) {
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (roleData?.role && hasAdminAccess(roleData.role as AppRole)) {
    navigate("/admin");
  } else {
    navigate("/onboarding");
  }
} else {
  // Fallback if session not immediately available (email confirmation pending)
  navigate("/onboarding");
}
```

### Files Changed
- `src/pages/Signup.tsx` — add post-signup role check and conditional redirect

### What Stays the Same
- No database changes
- Invitation email flow unchanged
- `handle_new_user` trigger unchanged
- Customer onboarding flow unchanged
- Login flow unchanged

