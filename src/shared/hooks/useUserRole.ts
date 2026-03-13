// Re-export from auth module for backward compatibility
export {
  useUserRole,
  useIsStaff,
  useIsManager,
  useIsAdmin,
  useIsSuperAdmin,
  type AppRole,
} from "@/modules/auth/hooks/useUserRole";
