import { describe, expect, it } from "vitest";
import type { Chantier, User } from "../types/domain";
import { filterChantiersForPlanningScope } from "./planningChantiers";

const conducteur: User = {
  id: "u-conducteur",
  firstName: "Marc",
  lastName: "Dupont",
  email: "conducteur@batinova.fr",
  role: "CONDUCTEUR_TRAVAUX",
};

const chantiers: Chantier[] = [
  {
    id: "c-1",
    reference: "CHT-001",
    name: "Oliviers",
    client: "X",
    address: "Y",
    conductorName: "Marc Dupont",
    conductorId: "u-conducteur",
    status: "Réalisation",
    startDate: "2024-01-01",
    expectedEndDate: "2025-01-01",
    openReservesCount: 0,
  },
  {
    id: "c-2",
    reference: "CHT-002",
    name: "Centre Commercial Nord",
    client: "X",
    address: "Y",
    conductorName: "Sophie Martin",
    conductorId: "u-conducteur-2",
    status: "Planification",
    startDate: "2024-01-01",
    expectedEndDate: "2026-01-01",
    openReservesCount: 0,
  },
];

describe("filterChantiersForPlanningScope (TST-EVOL-002-09 / RG-PLA-04)", () => {
  it("conducteur — uniquement ses chantiers", () => {
    const result = filterChantiersForPlanningScope(chantiers, conducteur);
    expect(result.map((c) => c.reference)).toEqual(["CHT-001"]);
  });

  it("direction — tous les chantiers", () => {
    const result = filterChantiersForPlanningScope(chantiers, {
      ...conducteur,
      id: "u-direction",
      role: "DIRECTION",
    });
    expect(result).toHaveLength(2);
  });

  it("chef — chantiers affectés uniquement", () => {
    const result = filterChantiersForPlanningScope(
      chantiers,
      {
        ...conducteur,
        id: "u-chef",
        role: "CHEF_CHANTIER",
      },
      new Set(["c-2"]),
    );
    expect(result.map((c) => c.reference)).toEqual(["CHT-002"]);
  });
});
