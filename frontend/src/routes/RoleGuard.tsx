import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getDefaultRouteForRole } from "../config/navigation";
import { isRouteAllowed } from "../config/routeAccess";
import { useAuth } from "../contexts/AuthContext";

/** Redirige vers la route par défaut du rôle si accès non autorisé */
export function RoleGuard() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  if (!isRouteAllowed(user.role, location.pathname)) {
    return (
      <Navigate
        to={getDefaultRouteForRole(user.role)}
        replace
        state={{ unauthorized: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
