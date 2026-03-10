

# Add "Admin" Role to User Management Page

After reviewing the code, the "Admin" role **can already be assigned** by Super Admin in the role change dialog — `getInvitableRoles` already includes it. However, there are a few gaps that make the Admin role feel incomplete on this page:

## Issues Found

1. **RoleGuard** (line 215): The Users page only allows `super_admin` and `branch_manager` — Admin users **cannot access** this page even though they should be able to manage users.
2. **Role filter dropdown** (lines 289-296): Missing "Admin" as a filter option.
3. **Visible users filter** (lines 190-197): When a `branch_manager` is viewing, admin-role users are hidden. Admin-role users should also be able to see relevant users.
4. **Stats cards**: Don't account for admin-role users in the counts.

## Changes

### 1. `src/pages/admin/AdminUsers.tsx`
- Add `"admin"` to the RoleGuard's `allowedRoles` array
- Add `<SelectItem value="admin">Admin</SelectItem>` to the role filter dropdown
- Update the `managerVisibleUsers` logic to handle the `admin` role (admin users should see staff, customers, managers, and unverified users — but not other admins or super_admin)
- Include admin users in the staff stats count

### 2. `src/shared/components/admin/sidebar/nav-config.ts`
- The Users nav item currently has `requiresManager: true` — update to also be visible for admin-role users (this already works since the `filterNavItems` function checks `isManager` which includes admin in most implementations). Verify no changes needed here.

These are minor UI-level additions — no database or RLS changes required since the permissions system already supports the admin role.

