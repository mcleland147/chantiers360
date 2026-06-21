import type {
  Alert,
  Chantier,
  DashboardKpis,
  Reserve,
  User,
} from "../types/domain";

/** Données statiques — conservé pour mocks E2E. Dashboards connectés API Phase H. */

export const mockUser: User = {
  id: "u-1",
  firstName: "Marc",
  lastName: "Dupont",
  email: "m.dupont@batinova.fr",
  role: "CONDUCTEUR_TRAVAUX",
};

export const mockKpis: DashboardKpis = {
  activeChantiers: 12,
  lateChantiers: 3,
  openReserves: 28,
  criticalReserves: 6,
};

export const mockRecentChantiers: Chantier[] = [
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
    id: "c-2",
    reference: "CHT-002",
    name: "Centre Commercial Nord",
    client: "SCI Galeries Partenaires",
    address: "Paris, 75018",
    conductorName: "Sophie Martin",
    status: "Planification",
    startDate: "15/06/2024",
    expectedEndDate: "28/02/2026",
    openReservesCount: 1,
    progressPercent: 23,
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
  {
    id: "c-4",
    reference: "CHT-004",
    name: "Parking Souterrain Opéra",
    client: "Ville de Marseille",
    address: "Marseille, 13001",
    conductorName: "Luc Bernard",
    status: "Réception",
    startDate: "01/11/2023",
    expectedEndDate: "30/06/2025",
    openReservesCount: 2,
    progressPercent: 89,
  },
];

export const mockRecentReserves: Reserve[] = [
  {
    id: "r-1",
    reference: "RSV-043",
    title: "Retard livraison béton B30",
    chantierReference: "CHT-001",
    chantierName: "Résidence Les Oliviers",
    priority: "Haute",
    status: "Ouverte",
    assigneeName: "Marc Dupont",
    createdAt: "14/05/2025",
  },
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
];

export const mockAlerts: Alert[] = [
  {
    id: "a-1",
    type: "RETARD_CHANTIER",
    message: "Date de fin prévue dépassée",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    createdAt: "15/05/2025",
  },
  {
    id: "a-2",
    type: "RETARD_CHANTIER",
    message: "Date de fin prévue dépassée",
    chantierReference: "CHT-006",
    chantierName: "Pont Route Nationale 7",
    createdAt: "14/05/2025",
  },
  {
    id: "a-3",
    type: "RESERVE_CRITIQUE",
    message: "Réserve critique non levée",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    createdAt: "12/05/2025",
  },
];
