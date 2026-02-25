

# Prompt Returning Users to Complete Onboarding

## Overview
When a user logs in, we check if their profile has `frame_preferences` and `face_dimensions` populated. If both are empty (meaning they never completed onboarding), we redirect them to `/onboarding` instead of the dashboard. This ensures every customer eventually completes the personalization flow.

## How It Works

### Detection Logic
The `profiles` table already stores `face_dimensions` (jsonb, defaults to `{}`) and `frame_preferences` (jsonb, defaults to `{}`). A user is considered "onboarding incomplete" if both fields are empty objects or null. Admin/staff users are excluded from this check -- it only applies to regular customers.

### Changes

**1. Create a reusable hook: `src/hooks/useOnboardingStatus.ts`**
- Accepts a user ID
- Fetches the profile and user role
- Returns `{ needsOnboarding: boolean, isLoading: boolean }`
- Logic: `needsOnboarding = true` when role is `customer` or `user`, AND both `face_dimensions` and `frame_preferences` are empty/null
- Admin/staff roles always return `needsOnboarding = false`

**2. Update `src/pages/Login.tsx`**
- After successful email login, before navigating, check the profile's `face_dimensions` and `frame_preferences` columns
- If both are empty and the user is not admin/staff, redirect to `/onboarding` instead of `/dashboard`
- This is a one-time query right after login (no extra hook needed here since we already fetch role)

**3. Update `src/pages/Dashboard.tsx`**
- Add a check using the new `useOnboardingStatus` hook
- If `needsOnboarding` is true, show a prominent banner at the top of the dashboard:
  - "Complete Your Profile" card with a CTA button linking to `/onboarding`
  - Not blocking -- they can still use the dashboard, but the banner is persistent and eye-catching
- This catches users who land on the dashboard via direct URL, Google OAuth, or bookmark

**4. Update `src/components/onboarding/OnboardingWizard.tsx`**
- The current wizard redirects to `/login` if no user. This stays the same.
- The "Skip for now" button currently calls `handleComplete` which navigates to `/eyewear`. This also stays -- but since the dashboard will show the banner on next visit, they'll keep being reminded.

### What This Does NOT Do
- Does not force-block users from browsing (they can dismiss/ignore the banner)
- Does not affect admin/staff users
- Does not require any database changes -- uses existing `profiles` columns

### User Experience
1. **New signup** --> Goes to `/onboarding` (existing behavior, no change)
2. **Returning user who skipped onboarding** --> Login redirects to `/onboarding`; if they skip again, dashboard shows a reminder banner
3. **Returning user who completed onboarding** --> Normal login to dashboard (no banner)
4. **Google OAuth new user** --> Lands on dashboard, sees onboarding banner prompting them to complete their profile
5. **Admin/staff** --> No onboarding prompt ever

