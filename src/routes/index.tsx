import { Routes } from "react-router-dom";
import { publicRoutes } from "./public.routes";
import { adminRoutes } from "./admin.routes";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin routes */}
      {adminRoutes}
      
      {/* Public routes - NotFound should come last */}
      {publicRoutes}
    </Routes>
  );
};
