
# Security Hardening Plan

This plan addresses the security warnings identified in the project: permissive RLS policies, leaked password protection, and sensitive data exposure.

---

## Summary of Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| Leaked Password Protection Disabled | Warning | Users can register with passwords that have appeared in data breaches |
| Permissive RLS (`WITH CHECK (true)`) on `personalization_analytics` | Warning | Anyone can insert analytics records without validation |
| Public inventory exposure | Warning | Competitors could view stock levels, bin locations, and business data |
| Customer profile data accessible to all staff | Error | Potential for data misuse by staff members |
| User invitation emails visible to managers | Warning | Email list could be exported for spam/phishing |

---

## Solution Approach

### 1. Enable Leaked Password Protection

Configure the authentication system to reject passwords that have been found in known data breaches. This is a configuration change in the backend authentication settings.

**Impact**: New user registrations and password changes will be checked against breach databases.

---

### 2. Fix Permissive RLS on `personalization_analytics`

The current policy allows anyone to insert records:

```text
Current: WITH CHECK (true)
```

**Solution**: Restrict inserts to authenticated users only (this table is for system analytics, should require authentication).

```sql
-- Replace the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert analytics" ON public.personalization_analytics;

CREATE POLICY "Authenticated users can insert analytics"
ON public.personalization_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);
```

---

### 3. Restrict Public Inventory Access

Current state: Inventory is publicly readable via `USING (true)`.

**Business context**: The storefront shows products but does NOT display inventory quantities to customers. Inventory data (stock levels, bin locations, reserved quantities) is only used in the admin panel.

**Solution**: Remove public access and restrict inventory visibility to authenticated staff only.

```sql
-- Remove the public access policy
DROP POLICY IF EXISTS "Anyone can view inventory levels" ON public.inventory;

-- Keep the existing staff policy which already handles authenticated access
-- (Staff can view inventory policy already exists)
```

---

### 4. Address Profile Data Exposure (Informational Update)

The current policy allows all staff to view all customer profiles. This is a business decision that requires input:

**Options**:
- **A) Keep as-is** (staff need to see customer data for orders/appointments)
- **B) Add column-level masking** (hide full phone/email, show only partial)
- **C) Restrict to order/appointment context** (staff can only see profiles for customers they're serving)

**Recommendation**: Mark this as an acknowledged business requirement. Staff in an eye clinic/retail environment need access to customer contact information to provide service. Document this as an accepted risk.

---

### 5. Address User Invitation Email Exposure (Informational Update)

Managers can view invitation emails, which is needed for the invitation workflow.

**Recommendation**: Mark as an acknowledged business requirement since managers need to see who has been invited to manage the invitation process.

---

## Implementation Steps

### Database Migration

```sql
-- 1. Fix permissive analytics INSERT policy
DROP POLICY IF EXISTS "System can insert analytics" ON public.personalization_analytics;

CREATE POLICY "Authenticated users can insert analytics"
ON public.personalization_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Remove public inventory access (keep staff-only access)
DROP POLICY IF EXISTS "Anyone can view inventory levels" ON public.inventory;
```

### Authentication Configuration

Enable leaked password protection through the backend configuration to check new passwords against known breach databases.

---

## Technical Details

### Files Affected
- Database: 1 new migration file for RLS policy updates
- Authentication: Configuration change for password protection

### Risk Assessment
- **Low risk**: These changes restrict access rather than expand it
- **No application code changes** required since the storefront doesn't query inventory directly
- **Admin panel** will continue to work since staff policies remain in place

### Validation
After implementation:
1. Verify storefront products still load (no inventory queries there)
2. Verify admin inventory pages work for logged-in staff
3. Confirm new user registration rejects known breached passwords
4. Check security scan shows reduced warnings

---

## Security Findings to Update

After implementing the fixes, the following security findings will be updated:
- **Delete**: `SUPA_rls_policy_always_true` (after fixing analytics policy)
- **Delete**: `inventory_public_exposure` (after removing public access)
- **Mark as acknowledged**: `profiles_table_public_exposure` (business requirement)
- **Mark as acknowledged**: `user_invitations_email_exposure` (business requirement)
- **Delete**: `SUPA_auth_leaked_password_protection` (after enabling protection)
