import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mockChantiers } from "../../../data/mockChantiers";
import { mockChantierReserves } from "../../../data/mockChantierTabs";
import { getAtRiskChantiers } from "../../../utils/directionDashboard";
import { RiskChantiersList } from "./RiskChantiersList";

function renderList() {
  const atRisk = getAtRiskChantiers(mockChantiers, mockChantierReserves);
  return render(
    <MemoryRouter>
      <RiskChantiersList chantiers={atRisk} />
    </MemoryRouter>,
  );
}

describe("RiskChantiersList — Phase F", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-20"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("T-F-COMP-005 — affiche les chantiers à risque avec motifs", () => {
    renderList();

    expect(screen.getByText("Chantiers à risque")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Immeuble Haussmann/ }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("En retard (RG-001)").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Réserves critiques")).toBeInTheDocument();
  });

  it("T-F-COMP-006 — lien drill-down vers fiche chantier", () => {
    renderList();

    const link = screen.getByRole("link", { name: /Immeuble Haussmann/ });
    expect(link).toHaveAttribute("href", "/chantiers/c-3");
  });
});
