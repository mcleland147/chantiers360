import { describe, expect, it } from "vitest";
import { getDefaultRouteForRole } from "./navigation";
import { isRouteAllowed } from "./routeAccess";

describe("routeAccess", () => {
  it("autorise le conducteur sur /dashboard uniquement", () => {
    expect(isRouteAllowed("CONDUCTEUR_TRAVAUX", "/dashboard")).toBe(true);
    expect(isRouteAllowed("CONDUCTEUR_TRAVAUX", "/dashboard/direction")).toBe(
      false,
    );
  });

  it("autorise la direction sur /dashboard/direction", () => {
    expect(isRouteAllowed("DIRECTION", "/dashboard/direction")).toBe(true);
    expect(isRouteAllowed("DIRECTION", "/dashboard")).toBe(false);
  });

  it("autorise l'assistante sur /chantiers mais pas /dashboard", () => {
    expect(isRouteAllowed("ASSISTANTE_ADMINISTRATIVE", "/chantiers")).toBe(
      true,
    );
    expect(isRouteAllowed("ASSISTANTE_ADMINISTRATIVE", "/dashboard")).toBe(
      false,
    );
  });

  it("autorise le chef sur /mobile uniquement parmi les dashboards", () => {
    expect(isRouteAllowed("CHEF_CHANTIER", "/mobile")).toBe(true);
    expect(isRouteAllowed("CHEF_CHANTIER", "/dashboard")).toBe(false);
  });

  it("bloque /reports et /admin pour tous les rôles MVP", () => {
    expect(isRouteAllowed("CONDUCTEUR_TRAVAUX", "/reports")).toBe(false);
    expect(isRouteAllowed("DIRECTION", "/admin")).toBe(false);
  });

  it("T-F-ROLE-001 — /dashboard/direction réservé à la Direction", () => {
    expect(isRouteAllowed("DIRECTION", "/dashboard/direction")).toBe(true);
    expect(isRouteAllowed("CONDUCTEUR_TRAVAUX", "/dashboard/direction")).toBe(
      false,
    );
    expect(
      isRouteAllowed("ASSISTANTE_ADMINISTRATIVE", "/dashboard/direction"),
    ).toBe(false);
    expect(isRouteAllowed("CHEF_CHANTIER", "/dashboard/direction")).toBe(false);
  });

  it("redirection par défaut alignée SPEC-UI", () => {
    expect(getDefaultRouteForRole("DIRECTION")).toBe("/dashboard/direction");
    expect(getDefaultRouteForRole("ASSISTANTE_ADMINISTRATIVE")).toBe(
      "/chantiers",
    );
    expect(getDefaultRouteForRole("CHEF_CHANTIER")).toBe("/mobile");
    expect(getDefaultRouteForRole("CONDUCTEUR_TRAVAUX")).toBe("/dashboard");
  });
});
