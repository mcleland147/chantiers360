import type { Chantier, ChantierDetail } from "../types/domain";
import { CHANTIER_STATUSES } from "../config/chantierStatuses";

export { CHANTIER_STATUSES };

export const mockChantiers: ChantierDetail[] = [
  {
    id: "c-1",
    reference: "CHT-001",
    name: "Résidence Les Oliviers",
    client: "Mairie de Lyon",
    address: "12 rue des Oliviers, Lyon 69003",
    conductorName: "Marc Dupont",
    status: "Réalisation",
    startDate: "01/03/2024",
    expectedEndDate: "30/09/2025",
    openReservesCount: 3,
    progressPercent: 67,
    budget: 2_450_000,
    budgetSpent: 1_640_000,
    description:
      "Construction de 48 logements collectifs BBC avec parking souterrain et espaces verts.",
    assignedChefIds: ["u-chef-1"],
  },
  {
    id: "c-2",
    reference: "CHT-002",
    name: "Centre Commercial Nord",
    client: "SCI Galeries Partenaires",
    address: "45 avenue du Nord, Paris 75018",
    conductorName: "Sophie Martin",
    status: "Planification",
    startDate: "15/06/2024",
    expectedEndDate: "28/02/2026",
    openReservesCount: 1,
    progressPercent: 23,
    budget: 8_200_000,
    budgetSpent: 890_000,
    description:
      "Rénovation et extension d'un centre commercial de 12 000 m² sur 2 niveaux.",
    assignedChefIds: ["u-chef-2"],
  },
  {
    id: "c-3",
    reference: "CHT-003",
    name: "Immeuble Haussmann Rénov.",
    client: "Bouygues Immobilier",
    address: "8 boulevard Haussmann, Paris 75008",
    conductorName: "Marc Dupont",
    status: "Réalisation",
    startDate: "10/01/2024",
    expectedEndDate: "15/04/2025",
    openReservesCount: 7,
    progressPercent: 45,
    budget: 5_800_000,
    budgetSpent: 3_200_000,
    description:
      "Rénovation complète d'un immeuble haussmannien : ravalement, toiture, ascenseurs.",
    assignedChefIds: ["u-chef-1", "u-chef-3"],
  },
  {
    id: "c-4",
    reference: "CHT-004",
    name: "Parking Souterrain Opéra",
    client: "Ville de Marseille",
    address: "Place de l'Opéra, Marseille 13001",
    conductorName: "Luc Bernard",
    status: "Réception",
    startDate: "01/11/2023",
    expectedEndDate: "30/06/2025",
    openReservesCount: 2,
    progressPercent: 89,
    budget: 3_100_000,
    budgetSpent: 2_780_000,
    receptionDate: "15/07/2025",
    description:
      "Construction d'un parking souterrain de 280 places avec ventilation et sécurité incendie.",
    assignedChefIds: ["u-chef-4"],
  },
  {
    id: "c-5",
    reference: "CHT-005",
    name: "École Primaire Les Tilleuls",
    client: "Conseil Départemental 69",
    address: "Rue des Tilleuls, Villeurbanne 69100",
    conductorName: "Marc Dupont",
    status: "Démarrage",
    startDate: "01/09/2025",
    expectedEndDate: "31/08/2026",
    openReservesCount: 0,
    progressPercent: 12,
    budget: 1_850_000,
    budgetSpent: 220_000,
    description:
      "Extension et mise aux normes PMR d'une école primaire de 12 classes.",
    assignedChefIds: ["u-chef-1"],
  },
  {
    id: "c-6",
    reference: "CHT-006",
    name: "Pont Route Nationale 7",
    client: "DIR Centre-Est",
    address: "RN7, Valence 26000",
    conductorName: "Sophie Martin",
    status: "Réalisation",
    startDate: "15/04/2024",
    expectedEndDate: "01/03/2025",
    openReservesCount: 4,
    progressPercent: 78,
    budget: 12_500_000,
    budgetSpent: 9_800_000,
    description:
      "Réfection du tablier et renforcement structurel du pont sur la RN7.",
    assignedChefIds: ["u-chef-2"],
  },
  {
    id: "c-7",
    reference: "CHT-007",
    name: "Résidence Le Parc",
    client: "Nexity",
    address: "Avenue du Parc, Bordeaux 33000",
    conductorName: "Luc Bernard",
    status: "Préparation",
    startDate: "01/01/2026",
    expectedEndDate: "30/12/2027",
    openReservesCount: 0,
    progressPercent: 0,
    budget: 4_200_000,
    budgetSpent: 45_000,
    description:
      "Programme neuf de 32 logements intermédiaires avec commerces en RDC.",
    assignedChefIds: [],
  },
  {
    id: "c-8",
    reference: "CHT-008",
    name: "Hôpital Sud — Aile B",
    client: "CHU Toulouse",
    address: "Rue de l'Hôpital, Toulouse 31000",
    conductorName: "Marc Dupont",
    status: "Clôture",
    startDate: "01/06/2022",
    expectedEndDate: "31/12/2024",
    openReservesCount: 0,
    progressPercent: 100,
    budget: 6_700_000,
    budgetSpent: 6_550_000,
    receptionDate: "20/01/2025",
    description:
      "Réhabilitation de l'aile B : blocs opératoires, salles de soins et locaux techniques.",
    assignedChefIds: ["u-chef-1"],
  },
];

const chefAssignments: Record<string, string[]> = {
  "u-chef-1": ["c-1", "c-3", "c-5", "c-8"],
};

export function getChantierById(id: string): ChantierDetail | undefined {
  return mockChantiers.find((c) => c.id === id);
}

export function getChantiersForRole(
  role: string,
  chefUserId = "u-chef-1",
): Chantier[] {
  if (role === "CHEF_CHANTIER") {
    const ids = chefAssignments[chefUserId] ?? [];
    return mockChantiers.filter((c) => ids.includes(c.id));
  }
  return mockChantiers;
}

export function getConductorNames(): string[] {
  return [...new Set(mockChantiers.map((c) => c.conductorName))].sort();
}
