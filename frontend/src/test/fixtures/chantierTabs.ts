import type {
  Assignment,
  ChantierPhoto,
  ChantierReserve,
  HistoryEntry,
  ProgressUpdate,
} from "../../types/domain";

export const sampleAssignments: Assignment[] = [
  {
    id: "a-1",
    chantierId: "c-1",
    collaboratorName: "Jean Moreau",
    jobTitle: "Chef de chantier",
    assignedAt: "01/03/2024",
    isActive: true,
  },
  {
    id: "a-2",
    chantierId: "c-1",
    collaboratorName: "Michel Durand",
    jobTitle: "Maçon",
    assignedAt: "01/06/2024",
    isActive: false,
  },
];

export const sampleProgressUpdates: ProgressUpdate[] = [
  {
    id: "p-1",
    chantierId: "c-1",
    date: "14/05/2025",
    authorName: "Jean Moreau",
    comment: "Coulage dalle niveau R+3 terminé.",
    percent: 67,
  },
  {
    id: "p-2",
    chantierId: "c-1",
    date: "07/05/2025",
    authorName: "Marc Dupont",
    comment: "Réunion de coordination avec les sous-traitants.",
  },
];

export const sampleReserves: ChantierReserve[] = [
  {
    id: "r-1",
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
  {
    id: "r-2",
    chantierId: "c-3",
    reference: "RSV-035",
    title: "Défaut étanchéité balcon",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Haute",
    status: "Ouverte",
    assigneeName: "Non assigné",
    createdByName: "Pierre Garnier",
    createdAt: "28/04/2025",
  },
  {
    id: "r-3",
    chantierId: "c-3",
    reference: "RSV-028",
    title: "Retard menuiseries",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Faible",
    status: "Levée",
    assigneeName: "Marc Dupont",
    createdByName: "Marc Dupont",
    createdAt: "10/04/2025",
    closedAt: "15/04/2025",
  },
  {
    id: "r-4",
    chantierId: "c-3",
    reference: "RSV-030",
    title: "Non-conformité peinture",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Moyenne",
    status: "Ouverte",
    assigneeName: "Non assigné",
    createdByName: "Paul Lefèvre",
    createdAt: "20/04/2025",
  },
];

export const samplePhotos: ChantierPhoto[] = [
  {
    id: "ph-1",
    chantierId: "c-1",
    category: "Avant travaux",
    fileName: "terrain_initial.jpg",
    authorName: "Marc Dupont",
    date: "28/02/2024",
    comment: "État initial.",
  },
  {
    id: "ph-2",
    chantierId: "c-1",
    category: "Pendant travaux",
    fileName: "coulage_dalle.jpg",
    authorName: "Jean Moreau",
    date: "14/05/2025",
  },
  {
    id: "ph-3",
    chantierId: "c-4",
    category: "Après travaux",
    fileName: "parking_fini.jpg",
    authorName: "François Mercier",
    date: "10/07/2025",
  },
];

export const sampleHistoryEntries: HistoryEntry[] = [
  {
    id: "h-1",
    chantierId: "c-3",
    date: "20/03/2024 15:30",
    authorName: "Marc Dupont",
    action: "Changement de statut",
    oldValue: "Réalisation",
    newValue: "Démarrage",
    reason: "Retard livraison matériaux — reprise planification",
  },
  {
    id: "h-2",
    chantierId: "c-3",
    date: "10/04/2025 17:00",
    authorName: "Marc Dupont",
    action: "Validation levée réserve",
    oldValue: "RSV-028 — En cours",
    newValue: "RSV-028 — Levée",
  },
];
