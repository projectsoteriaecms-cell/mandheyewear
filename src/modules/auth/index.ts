// Auth module barrel export
export { useAuth } from "./hooks/useAuth";
export {
  useUserRole,
  useIsStaff,
  useIsManager,
  useIsAdmin,
  useIsSuperAdmin,
  type AppRole,
} from "./hooks/useUserRole";
export { RoleGuard } from "./components/RoleGuard";
export { default as Login } from "./pages/Login";
export { default as Signup } from "./pages/Signup";
