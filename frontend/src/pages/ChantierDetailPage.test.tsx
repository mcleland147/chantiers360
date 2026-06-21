import { ChantierDetailPage } from "../pages/ChantierDetailPage";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";
import type { ReactNode } from "react";
import { AuthProvider } from "../contexts/AuthContext";

vi.mock("../hooks/useChantiers", () => ({
  useChantierQuery: () => ({
    data: {
      id: "c-3",
      reference: "CHT-003",
      name: "Immeuble Haussmann Rénov.",
      client: "Client",
      address: "Adresse",
      conductorName: "Marc Dupont",
      status: "Réalisation",
      startDate: "10/01/2024",
      expectedEndDate: "15/04/2025",
      openReservesCount: 2,
      budget: 100,
      budgetSpent: 0,
      description: "",
    },
    isLoading: false,
    isError: false,
  }),
  useChantierHistoryQuery: () => ({ data: [] }),
  useChangeChantierStatusMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
  }),
  chantierKeys: {
    all: ["chantiers"],
    detail: (id: string) => ["chantiers", id],
    history: (id: string) => ["chantiers", id, "history"],
  },
}));

vi.mock("../hooks/useChantierTabs", () => ({
  useChantierAssignmentsQuery: () => ({ data: [], isLoading: false }),
  useChantierProgressQuery: () => ({ data: [], isLoading: false }),
  useChantierReservesQuery: () => ({
    data: [
      {
        id: "r-4",
        chantierId: "c-3",
        reference: "RSV-042",
        title: "Fissure mur porteur nord",
        chantierReference: "CHT-003",
        chantierName: "Immeuble Haussmann Rénov.",
        priority: "Critique",
        status: "En cours",
        assigneeName: "Jean Moreau",
        createdByName: "Marc Dupont",
        createdAt: "12/05/2025",
        takenAt: "13/05/2025",
      },
    ],
    isLoading: false,
  }),
  useChantierPhotosQuery: () => ({ data: [], isLoading: false }),
  useAssignableUsersQuery: () => ({ data: [], isLoading: false }),
  useTakeReserveChargeMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useValidateReserveLeveeMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCreateAssignmentMutation: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useCreateProgressMutation: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useCreateReserveMutation: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useCreatePhotoMutation: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  chantierTabKeys: {
    assignments: (id: string) => ["chantiers", id, "assignments"],
    progress: (id: string) => ["chantiers", id, "progress"],
    reserves: (id: string) => ["chantiers", id, "reserves"],
    photos: (id: string) => ["chantiers", id, "photos"],
  },
}));

function renderWithProviders(ui: ReactNode, route = "/chantiers/c-3?tab=reserves") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/chantiers/:id" element={ui} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("ChantierDetailPage — onglets API", () => {
  it("T-G-TABS-COMP-001 — onglet réserves affiche les données API", () => {
    renderWithProviders(<ChantierDetailPage />);
    expect(screen.getByText("Fissure mur porteur nord")).toBeInTheDocument();
    expect(screen.getByText("Critique")).toBeInTheDocument();
    expect(screen.getByText("En cours")).toBeInTheDocument();
  });
});
