import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ROLE_HOME } from "../roleRoutes";
import type { UserRole } from "../types";

export const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <p>Loading...</p>;
  if (!user) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }
  if (roles && !roles.includes(user.role))
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  return <Outlet />;
};
