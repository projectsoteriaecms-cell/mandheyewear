

## Phase 4: Create Auth Module and Reorganize Admin Layout

### What we will do

**Part A — Create `modules/auth/`** containing authentication hooks and page components:

| Source | Destination |
|---|---|
| `shared/hooks/useAuth.ts` | `modules/auth/hooks/useAuth.ts` |
| `shared/hooks/useUserRole.ts` | `modules/auth/hooks/useUserRole.ts` |
| `shared/components/admin/RoleGuard.tsx` | `modules/auth/components/RoleGuard.tsx` |
| `pages/Login.tsx` | `modules/auth/pages/Login.tsx` |
| `pages/Signup.tsx` | `modules/auth/pages/Signup.tsx` |

Re-export shims left at original locations (41 files import `useAuth`, 21 import `useUserRole`).

**Part B — Move admin layout to `shared/layouts/admin/`**:

| Source | Destination |
|---|---|
| `shared/components/admin/AdminLayout.tsx` | `shared/layouts/admin/AdminLayout.tsx` |
| `shared/components/admin/AdminHeader.tsx` | `shared/layouts/admin/AdminHeader.tsx` |
| `shared/components/admin/AdminSidebar.tsx` | `shared/layouts/admin/AdminSidebar.tsx` |
| `shared/components/admin/AdminMobileNav.tsx` | `shared/layouts/admin/AdminMobileNav.tsx` |
| `shared/components/admin/sidebar/` (3 files) | `shared/layouts/admin/sidebar/` |
| `shared/components/admin/dashboard/` (5 files) | `shared/layouts/admin/dashboard/` |

Re-export shims left at `shared/components/admin/` so existing imports (12+ admin pages) keep working.

### Files created (~15)

- `src/modules/auth/hooks/useAuth.ts` (copy from shared)
- `src/modules/auth/hooks/useUserRole.ts` (copy, update relative import)
- `src/modules/auth/hooks/index.ts` (barrel)
- `src/modules/auth/components/RoleGuard.tsx` (copy, update imports)
- `src/modules/auth/components/index.ts` (barrel)
- `src/modules/auth/pages/Login.tsx` (copy)
- `src/modules/auth/pages/Signup.tsx` (copy)
- `src/modules/auth/pages/index.ts` (barrel)
- `src/modules/auth/index.ts` (module barrel)
- `src/shared/layouts/admin/AdminLayout.tsx`, `AdminHeader.tsx`, `AdminSidebar.tsx`, `AdminMobileNav.tsx`
- `src/shared/layouts/admin/sidebar/` (3 files copied)
- `src/shared/layouts/admin/dashboard/` (5+1 files copied)
- `src/shared/layouts/admin/index.ts` (barrel)

### Files modified (~15 re-export shims)

- `src/shared/hooks/useAuth.ts` → re-export from `@/modules/auth`
- `src/shared/hooks/useUserRole.ts` → re-export from `@/modules/auth`
- `src/shared/components/admin/RoleGuard.tsx` → re-export from `@/modules/auth`
- `src/shared/components/admin/AdminLayout.tsx` → re-export from `@/shared/layouts/admin`
- `src/shared/components/admin/AdminHeader.tsx` → re-export
- `src/shared/components/admin/AdminSidebar.tsx` → re-export
- `src/shared/components/admin/AdminMobileNav.tsx` → re-export
- `src/shared/components/admin/sidebar/*.ts` → re-exports
- `src/shared/components/admin/dashboard/*.tsx` → re-exports
- `src/shared/components/admin/index.ts` → updated barrel
- `src/pages/Login.tsx` → re-export from `@/modules/auth/pages`
- `src/pages/Signup.tsx` → re-export from `@/modules/auth/pages`
- `src/shared/hooks/index.ts` → update to re-export from auth module

### No database or logic changes

Purely file moves and import path updates.

