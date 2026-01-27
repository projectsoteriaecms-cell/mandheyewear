// Re-export from shared for backwards compatibility
// TODO: Update imports across codebase to use @/shared directly
export { 
  useUserRole, 
  useIsStaff, 
  useIsManager, 
  useIsSuperAdmin,
  type AppRole 
} from "@/shared/hooks/useUserRole";
