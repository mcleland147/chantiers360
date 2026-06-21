import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../config/navigation";
import { useAuth } from "../contexts/AuthContext";

export function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
}
