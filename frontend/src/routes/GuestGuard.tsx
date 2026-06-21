import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { getDefaultRouteForRole } from "../config/navigation";
import { useAuth } from "../contexts/AuthContext";

interface GuestGuardProps {
  children: ReactNode;
}

/** Redirige vers l'app si déjà connecté */
export function GuestGuard({ children }: GuestGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-sm text-muted">Chargement…</p>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return children;
}
