import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

export const ProtectedRoute = ({ roles }: { roles?: UserRole[] }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <p>Loading...</p>;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
};
