
# Fix Branch Manager Onboarding & RLS Issues

## Problem Summary

There are two related issues occurring when a Branch Manager logs in:

1. **Onboarding Wizard Appears Incorrectly**: The wizard prompts the manager to select a branch even though they already have an assignment in the database (Lagos Lekki branch assigned on Jan 28)
2. **RLS INSERT Error**: When the wizard tries to save, it fails with "new row violates row-level security policy for table 'branch_assignments'" because the manager cannot insert their own assignments

## Root Cause Analysis

**Database State**: The manager `manager@soteriaeyeclinic.com` already has a branch assignment:
- Branch: Lagos Lekki (c97eae31-e697-44ca-be19-57745142cfaf)
- is_primary: false

**RLS Policy Gap**: The `branch_assignments` table has these policies:
- `Super admins full access` - ALL commands for super_admin only
- `Branch managers can view branch assignments` - SELECT only, for viewing their branch's assignments
- `Users can view own assignments` - SELECT only, for viewing own record

**Missing Policy**: There is NO INSERT policy for staff/managers. Only Super Admins can insert assignments.

**Why Wizard Appears**: The `useBranchAssignments` hook query may be returning empty because of an RLS/timing issue, causing the Dashboard to show the wizard.

## Solution

### 1. Remove Self-Onboarding from Staff/Managers

The onboarding wizard allowing staff to assign themselves to branches is a **security risk** - users should not self-assign branch access. Branch assignments should ONLY be managed by:
- Super Admins (via User Management → Manage Branches)
- Branch Managers (for their staff, within their authorized branches)

**Changes**:
- Remove the `StaffOnboardingWizard` component from the Dashboard entirely
- Staff/managers without branch assignments should see a friendly message instead: "Please contact your administrator to assign you to a branch"

### 2. Fix the Dashboard Experience

Instead of showing an onboarding wizard, show an informative state when no branch is assigned:

```text
╔════════════════════════════════════════════╗
║  No Branch Assignment                       ║
║                                            ║
║  You haven't been assigned to a branch     ║
║  yet. Please contact your administrator    ║
║  to complete your setup.                   ║
║                                            ║
║  [Contact Admin]  (links to email/support) ║
╚════════════════════════════════════════════╝
```

### 3. Ensure Existing Assignments Load Correctly

Add error handling and retry logic to the branch assignments query to handle any edge cases.

## Implementation Steps

### Step 1: Update Dashboard Component
- Remove the `StaffOnboardingWizard` import and usage
- Add a "No Branch Assignment" state that displays when `branchAssignments` is empty
- Show a helpful message directing users to contact their administrator

### Step 2: Delete or Archive the StaffOnboardingWizard
- Remove `src/components/admin/onboarding/StaffOnboardingWizard.tsx`
- Clean up any remaining references

### Step 3: Update the `is_primary` Flag for Existing Assignment
- Run a database migration to set `is_primary = true` for the manager's existing assignment since they only have one branch

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/admin/Dashboard.tsx` | Remove wizard, add "No Assignment" state |
| `src/components/admin/onboarding/StaffOnboardingWizard.tsx` | Delete file |

## Database Change

Set the existing manager's branch assignment to primary:

```sql
UPDATE branch_assignments 
SET is_primary = true 
WHERE user_id = 'eaacf842-52b0-427e-92b4-375703138a0d' 
  AND branch_id = 'c97eae31-e697-44ca-be19-57745142cfaf';
```

## Security Benefits

- Prevents unauthorized self-assignment of branch access
- Enforces proper chain of command for access provisioning
- Super Admins assign managers → Managers assign staff
- Maintains audit trail of who assigned whom

## Expected Outcome

After implementation:
- Branch Manager logs in → sees Dashboard with their branch data (no wizard)
- Staff without assignment → sees friendly "Contact Admin" message
- No RLS errors since users won't attempt to insert their own assignments
- Clean, secure branch assignment workflow maintained
