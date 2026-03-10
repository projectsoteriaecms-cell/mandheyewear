

# Add "Admin" Role Between Branch Manager and Super Admin

## Problem
You want a new role level called `admin` that sits between `branch_manager` and `super_admin`. This role can generate product images, sync Zoho products, and manage most admin features — but branch managers should NOT have access to Zoho sync or image generation.

## Current Role Hierarchy
`user (0) < customer (1) < branch_staff (2) < branch_manager (3) < super_admin (4)`

## New Role Hierarchy
`user (0) < customer (1) < branch_staff (2) < branch_manager (3) < admin (4) < super_admin (5)`

## Changes Required

### 1. Database Migration — Add `admin` to `app_role` enum
```sql
ALTER TYPE public.app_role ADD VALUE 'admin' BEFORE 'super_admin';
```

### 2. Database Migration — Update RLS Policies
Update the following tables' RLS policies to include `admin` where `super_admin` is currently used:

- **products** — "Super admins can manage products" → include `admin`
- **zoho_sync_log** — "Only super_admin can insert sync logs" → include `admin`
- **categories** — "Super admins can manage categories" → include `admin`
- **branches** — keep super_admin only
- **user_roles** — "Super admins can manage all roles" → include `admin` (with restriction: admins can only assign roles up to branch_manager)
- **user_invitations** — INSERT/UPDATE/DELETE → include `admin`

### 3. Frontend — Permissions (`src/shared/lib/permissions.ts`)
- Add `admin` to the role hierarchy at level 4, bump `super_admin` to 5
- Update `canManageUsers` to include `admin`
- Add new permission: `canSyncZoho` — requires `admin` or `super_admin`
- Add new permission: `canGenerateImages` — requires `admin` or `super_admin`
- Update `getInvitableRoles` for `admin` (can invite up to `branch_manager`)
- Update `canChangeUserRole` for `admin`

### 4. Frontend — User Role Hooks (`src/shared/hooks/useUserRole.ts`)
- Add `useIsAdmin` hook (admin or super_admin)
- Update `useIsManager` to include `admin`

### 5. Frontend — Products Page (`src/pages/admin/Products.tsx`)
- Replace `useIsSuperAdmin` with `useIsAdmin` for Zoho Sync and Link to Zoho buttons

### 6. Frontend — Product Images Page (`src/pages/admin/ProductImages.tsx`)
- Gate the "Generate Images" button behind `useIsAdmin` (not just manager)

### 7. Frontend — Nav Config (`src/shared/components/admin/sidebar/nav-config.ts`)
- Add `requiresAdmin?: boolean` to NavItem interface
- Mark Zoho-related items if needed
- Update `filterNavItems` to handle admin-level items

### 8. Frontend — RoleGuard & Route Guards (`src/routes/admin.routes.tsx`)
- Add `admin` to `allowedRoles` arrays where appropriate

### 9. Frontend — Role Labels & Display
- Update `getRoleLabel` to include `admin: "Admin"`
- Update any role selection dropdowns (InviteUserDialog, user management) to show Admin option

### 10. Frontend — AdminSidebar
- Update sidebar to recognize `admin` role for filtering nav items

## Files Modified
- **Database**: 1 migration (enum + RLS policy updates)
- **`src/shared/lib/permissions.ts`** — Add admin to hierarchy + new permission functions
- **`src/shared/hooks/useUserRole.ts`** — Add `useIsAdmin` hook
- **`src/hooks/useUserRole.ts`** — Re-export `useIsAdmin`
- **`src/pages/admin/Products.tsx`** — Use `useIsAdmin` for Zoho/sync buttons
- **`src/pages/admin/ProductImages.tsx`** — Gate Generate Images behind admin
- **`src/shared/components/admin/sidebar/nav-config.ts`** — Handle admin role
- **`src/routes/admin.routes.tsx`** — Add `admin` to allowedRoles
- **`src/shared/components/admin/RoleGuard.tsx`** — No changes needed (already role-array based)
- **`src/components/admin/users/InviteUserDialog.tsx`** — Add admin to invitable roles

