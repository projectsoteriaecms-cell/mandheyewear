import { useProfile } from "@/hooks/useProfile";
import { useUserRole } from "@/hooks/useUserRole";
import type { AppRole } from "@/hooks/useUserRole";

const isEmpty = (val: unknown): boolean => {
  if (val == null) return true;
  if (typeof val === "object" && Object.keys(val as object).length === 0) return true;
  return false;
};

const STAFF_ROLES: AppRole[] = ["branch_staff", "branch_manager", "super_admin"];

export const useOnboardingStatus = (userId: string | undefined) => {
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: role, isLoading: roleLoading } = useUserRole();

  const isLoading = profileLoading || roleLoading;

  if (isLoading || !userId) {
    return { needsOnboarding: false, isLoading };
  }

  // Staff/admin never need onboarding
  if (role && STAFF_ROLES.includes(role)) {
    return { needsOnboarding: false, isLoading: false };
  }

  const needsOnboarding = isEmpty(profile?.face_dimensions) && isEmpty(profile?.frame_preferences);

  return { needsOnboarding, isLoading: false };
};
