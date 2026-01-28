
# User Management Enhancement Plan

## Overview

This plan implements three key improvements to the User Management system:

1. **Add a new "user" role** for unverified signups (can only browse)
2. **Auto-assign "user" role** to all new signups via database trigger
3. **Update Admin Users page** to show all profiles and organize by role categories
4. **Hide Super Admin** from the general stats (only show one admin)

---

## Role Hierarchy (Updated)

| Role | Description | Access Level |
|------|-------------|--------------|
| **user** | Unverified signup | Browse products only |
| **customer** | Verified user | Purchase, book appointments, wishlist, dashboard |
| **branch_staff** | Store employee | Inventory operations, view orders |
| **branch_manager** | Store manager | Approve orders, manage products |
| **super_admin** | Platform owner | Full system access (hidden from user list) |

---

## Changes Summary

### Phase 1: Database Changes

**1. Add new "user" role to the enum**
```sql
ALTER TYPE app_role ADD VALUE 'user' BEFORE 'customer';
```

**2. Update handle_new_user trigger**
- New signups get "user" role instead of "customer"
- Only invited users with pending invitation get their specified role

**3. Backfill existing profiles without roles**
- Any profiles without a user_role entry get assigned "user" role

---

### Phase 2: Update User Manager UI

**Modified file: `src/pages/admin/AdminUsers.tsx`**

Changes:
- Query from `profiles` table with LEFT JOIN to `user_roles`
- Show all users including those without explicit roles
- Update stats cards to show:
  - **Staff** (branch_staff + branch_manager count)
  - **Verified Customers** (customer role)
  - **Unverified Users** (user role)
  - *(Remove Super Admins stat card)*
- Filter dropdown options:
  - All Users
  - Branch Managers
  - Branch Staff  
  - Customers (Verified)
  - Users (Unverified)
- Add "Verify User" action to convert user to customer
- Super Admin row hidden from list (or shown with special styling at top)

---

### Phase 3: Update Permissions System

**Modified file: `src/shared/lib/permissions.ts`**

Changes:
- Add "user" to AppRole type
- Update role hierarchy to include user at level 0
- Add helper: `canPurchase(role)` - requires customer or above
- Add helper: `canBookAppointments(role)` - requires customer or above

---

### Phase 4: Update Frontend Access Control

**Files to modify:**
- `src/pages/Dashboard.tsx` - Show limited view for "user" role with verification prompt
- `src/pages/Checkout.tsx` - Block checkout for unverified users
- `src/pages/Booking.tsx` - Block appointment booking for unverified users
- `src/hooks/useCart.ts` - Prevent adding to cart for unverified users

---

## Verification Flow

When a "user" needs to become a "customer":

1. **Admin Action**: In User Manager, admin clicks "Verify User" → updates role to "customer"
2. **Future Enhancement**: Could add email verification or profile completion requirements

---

## Database Migration SQL

```sql
-- Add 'user' role to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'user' BEFORE 'customer';

-- Update trigger to assign 'user' role by default (not 'customer')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  assigned_role app_role;
  invitation_record RECORD;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Check for pending invitation first
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE email = NEW.email
    AND accepted_at IS NULL
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF invitation_record IS NOT NULL THEN
    -- Use the invited role
    assigned_role := invitation_record.role;
    
    -- Mark invitation as accepted
    UPDATE public.user_invitations
    SET accepted_at = now()
    WHERE id = invitation_record.id;
  ELSE
    -- Default to 'user' (unverified) for public signups
    assigned_role := 'user'::app_role;
  END IF;
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;

-- Backfill: assign 'user' role to any profiles without a role
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'user'::app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.id IS NULL;
```

---

## UI Mockup - Updated Stats Cards

```text
+------------------+  +------------------+  +------------------+
|  Staff Members   |  | Verified         |  | Unverified      |
|        3         |  | Customers        |  | Users           |
|                  |  |       45         |  |       12        |
+------------------+  +------------------+  +------------------+
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| Database migration | Create | Add 'user' role, update trigger |
| `src/pages/admin/AdminUsers.tsx` | Modify | Updated UI with new role handling |
| `src/shared/lib/permissions.ts` | Modify | Add user role and new permission helpers |
| `src/integrations/supabase/types.ts` | Auto-update | Will reflect new enum value |
| `src/pages/Dashboard.tsx` | Modify | Handle unverified user view |
| `src/pages/Checkout.tsx` | Modify | Block unverified users |
| `src/pages/Booking.tsx` | Modify | Block unverified users |

---

## Technical Notes

- The Super Admin account (admin@soteriaeyeclinic.com) will still function but won't appear in the regular user list
- RLS policies remain unchanged as they already use `has_role()` function
- Existing customers with the "customer" role are unaffected
- The "Verify User" action is essentially a role change from "user" to "customer"
