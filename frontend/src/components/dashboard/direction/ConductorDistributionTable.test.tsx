import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConductorDistributionTable } from "./ConductorDistributionTable";

describe("ConductorDistributionTable — Phase F", () => {
  it("T-F-COMP-002 — affiche la répartition par conducteur", () => {
    render(
      <ConductorDistributionTable
        rows={[
          {
            conductorName: "Marc Dupont",
            chantierCount: 4,
            lateCount: 1,
            openReservesCount: 10,
          },
        ]}
      />,
    );

    expect(screen.getByText("Répartition par conducteur")).toBeInTheDocument();
    expect(screen.getByText("Marc Dupont")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
