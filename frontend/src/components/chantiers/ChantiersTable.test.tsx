import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { ChantiersTable } from "./ChantiersTable";
import type { Chantier } from "../../types/domain";

const chantierLate: Chantier = {
  id: "c-3",
  reference: "CHT-003",
  name: "Immeuble Haussmann Rénov.",
  client: "Bouygues",
  address: "Paris",
  conductorName: "Marc Dupont",
  status: "Réalisation",
  startDate: "10/01/2024",
  expectedEndDate: "15/04/2025",
  openReservesCount: 7,
};

describe("ChantiersTable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-20"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("affiche le badge En retard calculé sans l'utiliser comme statut", () => {
    render(
      <MemoryRouter>
        <ChantiersTable chantiers={[chantierLate]} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Réalisation")).toBeInTheDocument();
    expect(screen.getByText("En retard")).toBeInTheDocument();
    expect(screen.queryByText("Exécution")).not.toBeInTheDocument();
  });
});
