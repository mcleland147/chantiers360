import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mockChantiers } from "../data/mockChantiers";
import { mockChantierReserves } from "../data/mockChantierTabs";
import { DashboardDirectionPage } from "./DashboardDirectionPage";
import {
  computeBudgetOverview,
  computeDirectionKpis,
  getAtRiskChantiers,
  groupChantiersByConductor,
  groupChantiersByStatus,
} from "../utils/directionDashboard";

vi.mock("../hooks/useDashboard", () => ({
  useDirectionDashboardQuery: vi.fn(),
}));

import { useDirectionDashboardQuery } from "../hooks/useDashboard";

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DashboardDirectionPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("DashboardDirectionPage — Phase F/H", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-20"));
    vi.mocked(useDirectionDashboardQuery).mockReturnValue({
      data: {
        kpis: computeDirectionKpis(mockChantiers, mockChantierReserves),
        atRiskChantiers: getAtRiskChantiers(mockChantiers, mockChantierReserves),
        statusDistribution: groupChantiersByStatus(mockChantiers),
        conductorDistribution: groupChantiersByConductor(mockChantiers),
        monthlyTrend: [
          { label: "Avr 2025", activeChantiers: 7, openReserves: 6 },
          { label: "Mai 2025", activeChantiers: 7, openReserves: 5 },
          { label: "Juin 2025", activeChantiers: 7, openReserves: 5 },
        ],
        budget: computeBudgetOverview(mockChantiers),
      },
      isLoading: false,
      isError: false,
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("T-F-COMP-007 — affiche les KPI direction consolidés", () => {
    renderPage();

    expect(screen.getByText("Total chantiers")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-direction")).toBeInTheDocument();
    expect(screen.getByText("Chantiers en retard")).toBeInTheDocument();
    expect(screen.getAllByText("Réserves ouvertes").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Réserves critiques").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId("risk-chantiers-list")).toBeInTheDocument();
  });

  it("T-F-COMP-008 — consultation seule sans actions de modification", () => {
    renderPage();

    expect(screen.getByText(/Consultation seule/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Créer|Modifier|Supprimer|Ajouter/i }),
    ).not.toBeInTheDocument();
  });
});
