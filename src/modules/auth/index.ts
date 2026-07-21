// Auth module barrel export
export { useAuth } from "./hooks/useAuth";
export { useEmailVerification } from "./hooks/useEmailVerification";
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
export { default as VerifyEmail } from "./pages/VerifyEmail";
export { default as ForgotPassword } from "./pages/ForgotPassword";
