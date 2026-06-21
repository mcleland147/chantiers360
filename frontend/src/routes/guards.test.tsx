import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import { saveAuthSession } from "../services/authStorage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleGuard } from "./RoleGuard";
import { GuestGuard } from "./GuestGuard";
import type { User } from "../types/domain";

const conducteur: User = {
  id: "u-conducteur",
  firstName: "Marc",
  lastName: "Dupont",
  email: "conducteur@batinova.fr",
  role: "CONDUCTEUR_TRAVAUX",
};

function renderGuardTree(initialEntry: string) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestGuard>
                <div>Page login</div>
              </GuestGuard>
            }
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard />}>
              <Route path="/dashboard" element={<div>Dashboard conducteur</div>} />
              <Route
                path="/dashboard/direction"
                element={<div>Dashboard direction</div>}
              />
              <Route path="/chantiers" element={<div>Liste chantiers</div>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("guards navigation", () => {
  it("redirige vers /login si non authentifié", async () => {
    renderGuardTree("/dashboard");
    await waitFor(() => {
      expect(screen.getByText("Page login")).toBeInTheDocument();
    });
  });

  it("redirige un conducteur hors de /dashboard/direction", async () => {
    saveAuthSession({ token: "jwt", user: conducteur });
    renderGuardTree("/dashboard/direction");
    await waitFor(() => {
      expect(screen.getByText("Dashboard conducteur")).toBeInTheDocument();
    });
  });

  it("autorise un conducteur sur /dashboard", async () => {
    saveAuthSession({ token: "jwt", user: conducteur });
    renderGuardTree("/dashboard");
    await waitFor(() => {
      expect(screen.getByText("Dashboard conducteur")).toBeInTheDocument();
    });
  });

  it("redirige un utilisateur connecté hors de /login", async () => {
    saveAuthSession({ token: "jwt", user: conducteur });
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestGuard>
                  <div>Page login</div>
                </GuestGuard>
              }
            />
            <Route path="/dashboard" element={<div>Dashboard conducteur</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText("Dashboard conducteur")).toBeInTheDocument();
    });
  });
});
