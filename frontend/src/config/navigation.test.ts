import { describe, expect, it } from "vitest";
import { getNavItemsForRole } from "./navigation";

describe("navigation MVP", () => {
  it("masque Rapports, Administration et Équipes pour tous les rôles", () => {
    const roles = [
      "DIRECTION",
      "ASSISTANTE_ADMINISTRATIVE",
      "CONDUCTEUR_TRAVAUX",
      "CHEF_CHANTIER",
    ] as const;

    for (const role of roles) {
      const labels = getNavItemsForRole(role).map((i) => i.label);
      expect(labels).not.toContain("Rapports");
      expect(labels).not.toContain("Administration");
      expect(labels).not.toContain("Équipes");
    }
  });

  it("expose 5 entrées pour le conducteur dont Planning", () => {
    const items = getNavItemsForRole("CONDUCTEUR_TRAVAUX");
    expect(items).toHaveLength(5);
    expect(items.map((i) => i.path)).toEqual([
      "/dashboard",
      "/chantiers",
      "/reserves",
      "/photos",
      "/planning",
    ]);
  });

  it("expose Planning pour Direction, Assistante et Chef", () => {
    for (const role of [
      "DIRECTION",
      "ASSISTANTE_ADMINISTRATIVE",
      "CHEF_CHANTIER",
    ] as const) {
      expect(getNavItemsForRole(role).some((i) => i.path === "/planning")).toBe(
        true,
      );
    }
  });

  it("expose la vue mobile uniquement pour le chef de chantier", () => {
    const chefItems = getNavItemsForRole("CHEF_CHANTIER");
    expect(chefItems.some((i) => i.path === "/mobile")).toBe(true);

    const conducteurItems = getNavItemsForRole("CONDUCTEUR_TRAVAUX");
    expect(conducteurItems.some((i) => i.path === "/mobile")).toBe(false);
  });
});
