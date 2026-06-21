import type { Page } from "@playwright/test";

/** Données alignées sur frontend/src/data/mockDashboard.ts + directionDashboard */
const CONDUCTEUR_DATA = {
  kpis: {
    activeChantiers: 12,
    lateChantiers: 3,
    openReserves: 28,
    criticalReserves: 6,
  },
  alerts: [
    {
      id: "a-1",
      type: "RETARD_CHANTIER",
      message: "Date de fin prévue dépassée",
      chantierReference: "CHT-003",
      chantierName: "Immeuble Haussmann Rénov.",
      createdAt: "15/05/2025",
    },
    {
      id: "a-3",
      type: "RESERVE_CRITIQUE",
      message: "Réserve critique non levée",
      chantierReference: "CHT-003",
      chantierName: "Immeuble Haussmann Rénov.",
      createdAt: "12/05/2025",
    },
  ],
  recentChantiers: [
    {
      id: "c-1",
      reference: "CHT-001",
      name: "Résidence Les Oliviers",
      client: "Mairie de Lyon",
      address: "Lyon, 69003",
      conductorName: "Marc Dupont",
      status: "Réalisation",
      startDate: "01/03/2024",
      expectedEndDate: "30/09/2025",
      openReservesCount: 3,
      progressPercent: 67,
    },
    {
      id: "c-3",
      reference: "CHT-003",
      name: "Immeuble Haussmann Rénov.",
      client: "Bouygues Immobilier",
      address: "Paris, 75008",
      conductorName: "Marc Dupont",
      status: "Réalisation",
      startDate: "10/01/2024",
      expectedEndDate: "15/04/2025",
      openReservesCount: 7,
      progressPercent: 45,
    },
  ],
  recentReserves: [
    {
      id: "r-2",
      reference: "RSV-042",
      title: "Fissure mur porteur nord",
      chantierReference: "CHT-003",
      chantierName: "Immeuble Haussmann Rénov.",
      priority: "Critique",
      status: "En cours",
      assigneeName: "Jean Moreau",
      createdAt: "12/05/2025",
    },
    {
      id: "r-3",
      reference: "RSV-044",
      title: "Non-conformité électrique NF C15-100",
      chantierReference: "CHT-003",
      chantierName: "Immeuble Haussmann Rénov.",
      priority: "Critique",
      status: "En cours",
      assigneeName: "Paul Lefèvre",
      createdAt: "10/05/2025",
    },
  ],
};

const DIRECTION_DATA = {
  kpis: {
    totalChantiers: 8,
    lateChantiers: 2,
    openReserves: 5,
    criticalReserves: 2,
  },
  atRiskChantiers: [
    {
      id: "c-3",
      reference: "CHT-003",
      name: "Immeuble Haussmann Rénov.",
      client: "Bouygues Immobilier",
      address: "Paris, 75008",
      conductorName: "Marc Dupont",
      status: "Réalisation",
      startDate: "10/01/2024",
      expectedEndDate: "15/04/2025",
      openReservesCount: 7,
      progressPercent: 45,
      budget: 5_800_000,
      budgetSpent: 3_200_000,
      reasons: ["RETARD", "RESERVE_CRITIQUE"],
      criticalReservesCount: 2,
    },
    {
      id: "c-6",
      reference: "CHT-006",
      name: "Pont Route Nationale 7",
      client: "DIR Sud",
      address: "RN7, Avignon",
      conductorName: "Marc Dupont",
      status: "Réalisation",
      startDate: "01/02/2024",
      expectedEndDate: "01/05/2025",
      openReservesCount: 0,
      progressPercent: 72,
      reasons: ["RETARD"],
      criticalReservesCount: 0,
    },
  ],
  statusDistribution: [
    { status: "Préparation", count: 1 },
    { status: "Planification", count: 1 },
    { status: "Démarrage", count: 1 },
    { status: "Réalisation", count: 3 },
    { status: "Réception", count: 1 },
    { status: "Clôture", count: 1 },
  ],
  conductorDistribution: [
    {
      conductorName: "Marc Dupont",
      chantierCount: 4,
      lateCount: 2,
      openReservesCount: 10,
    },
    {
      conductorName: "Sophie Martin",
      chantierCount: 2,
      lateCount: 0,
      openReservesCount: 1,
    },
    {
      conductorName: "Luc Bernard",
      chantierCount: 2,
      lateCount: 0,
      openReservesCount: 2,
    },
  ],
  monthlyTrend: [
    { label: "Avr 2025", activeChantiers: 7, openReserves: 6 },
    { label: "Mai 2025", activeChantiers: 7, openReserves: 5 },
    { label: "Juin 2025", activeChantiers: 7, openReserves: 5 },
  ],
  budget: {
    totalBudget: 32_650_000,
    totalSpent: 18_420_000,
    chantierCount: 8,
  },
};

export async function installDashboardApiMock(page: Page): Promise<void> {
  await page.route("**/api/dashboard/conducteur", async (route) => {
    await route.fulfill({ json: CONDUCTEUR_DATA });
  });

  await page.route("**/api/dashboard/direction**", async (route) => {
    await route.fulfill({ json: DIRECTION_DATA });
  });
}

export { CONDUCTEUR_DATA, DIRECTION_DATA };
