import type {
  Assignment,
  ChantierPhoto,
  HistoryEntry,
  ProgressUpdate,
  ChantierReserve,
} from "../types/domain";

export const mockAssignments: Assignment[] = [
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
    collaboratorName: "Paul Lefèvre",
    jobTitle: "Électricien",
    assignedAt: "15/03/2024",
    isActive: true,
  },
  {
    id: "a-3",
    chantierId: "c-1",
    collaboratorName: "Sophie Renard",
    jobTitle: "Conductrice de travaux adjointe",
    assignedAt: "01/03/2024",
    isActive: true,
  },
  {
    id: "a-4",
    chantierId: "c-1",
    collaboratorName: "Michel Durand",
    jobTitle: "Maçon",
    assignedAt: "01/06/2024",
    isActive: false,
  },
  {
    id: "a-5",
    chantierId: "c-3",
    collaboratorName: "Jean Moreau",
    jobTitle: "Chef de chantier",
    assignedAt: "10/01/2024",
    isActive: true,
  },
  {
    id: "a-6",
    chantierId: "c-3",
    collaboratorName: "Pierre Garnier",
    jobTitle: "Couvreur",
    assignedAt: "20/01/2024",
    isActive: true,
  },
  {
    id: "a-7",
    chantierId: "c-3",
    collaboratorName: "Luc Bernard",
    jobTitle: "Grutier",
    assignedAt: "15/02/2024",
    isActive: false,
  },
  {
    id: "a-8",
    chantierId: "c-2",
    collaboratorName: "Thomas Vidal",
    jobTitle: "Chef de chantier",
    assignedAt: "15/06/2024",
    isActive: true,
  },
  {
    id: "a-9",
    chantierId: "c-4",
    collaboratorName: "François Mercier",
    jobTitle: "Chef de chantier",
    assignedAt: "01/11/2023",
    isActive: true,
  },
];

export const mockProgressUpdates: ProgressUpdate[] = [
  {
    id: "p-1",
    chantierId: "c-1",
    date: "14/05/2025",
    authorName: "Jean Moreau",
    comment:
      "Coulage dalle niveau R+3 terminé. Prochaine étape : montage ossature bois.",
    percent: 67,
  },
  {
    id: "p-2",
    chantierId: "c-1",
    date: "07/05/2025",
    authorName: "Marc Dupont",
    comment:
      "Réunion de coordination avec les sous-traitants. Planning maintenu malgré intempéries.",
    percent: 64,
  },
  {
    id: "p-3",
    chantierId: "c-1",
    date: "28/04/2025",
    authorName: "Jean Moreau",
    comment: "Finitions façades sud — 80 % des bardages posés.",
    percent: 61,
  },
  {
    id: "p-4",
    chantierId: "c-3",
    date: "13/05/2025",
    authorName: "Jean Moreau",
    comment:
      "Ravalement façade nord en pause — attente validation architecte sur teinte.",
    percent: 45,
  },
  {
    id: "p-5",
    chantierId: "c-3",
    date: "05/05/2025",
    authorName: "Marc Dupont",
    comment: "Inspection toiture : remplacement tuiles zone est programmé semaine 20.",
    percent: 43,
  },
  {
    id: "p-6",
    chantierId: "c-3",
    date: "22/04/2025",
    authorName: "Pierre Garnier",
    comment: "Dépose ancienne couverture terminée côté cour.",
    percent: 40,
  },
];

export const mockChantierReserves: ChantierReserve[] = [
  {
    id: "r-1",
    chantierId: "c-1",
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
    chantierId: "c-1",
    reference: "RSV-038",
    title: "Écart plan évacuation EU",
    chantierReference: "CHT-001",
    chantierName: "Résidence Les Oliviers",
    priority: "Moyenne",
    status: "En cours",
    assigneeName: "Paul Lefèvre",
    createdAt: "02/05/2025",
  },
  {
    id: "r-3",
    chantierId: "c-1",
    reference: "RSV-031",
    title: "Fissure fine plâtre R+1",
    chantierReference: "CHT-001",
    chantierName: "Résidence Les Oliviers",
    priority: "Faible",
    status: "Levée",
    assigneeName: "Jean Moreau",
    createdAt: "15/04/2025",
  },
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
    createdAt: "12/05/2025",
  },
  {
    id: "r-5",
    chantierId: "c-3",
    reference: "RSV-044",
    title: "Non-conformité électrique NF C15-100",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Critique",
    status: "En cours",
    assigneeName: "Paul Lefèvre",
    createdAt: "10/05/2025",
  },
  {
    id: "r-6",
    chantierId: "c-3",
    reference: "RSV-035",
    title: "Défaut d'étanchéité balcon 4e",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Haute",
    status: "Ouverte",
    assigneeName: "Pierre Garnier",
    createdAt: "28/04/2025",
  },
  {
    id: "r-7",
    chantierId: "c-3",
    reference: "RSV-028",
    title: "Retard menuiseries extérieures",
    chantierReference: "CHT-003",
    chantierName: "Immeuble Haussmann Rénov.",
    priority: "Moyenne",
    status: "Levée",
    assigneeName: "Marc Dupont",
    createdAt: "10/04/2025",
  },
];

export const mockChantierPhotos: ChantierPhoto[] = [
  {
    id: "ph-1",
    chantierId: "c-1",
    category: "Avant travaux",
    fileName: "terrain_initial_01.jpg",
    authorName: "Marc Dupont",
    date: "28/02/2024",
    comment: "État du terrain avant démolition.",
  },
  {
    id: "ph-2",
    chantierId: "c-1",
    category: "Avant travaux",
    fileName: "facade_existante.jpg",
    authorName: "Jean Moreau",
    date: "01/03/2024",
  },
  {
    id: "ph-3",
    chantierId: "c-1",
    category: "Pendant travaux",
    fileName: "coulage_dalle_r3.jpg",
    authorName: "Jean Moreau",
    date: "14/05/2025",
    comment: "Coulage dalle R+3 — vue générale.",
  },
  {
    id: "ph-4",
    chantierId: "c-1",
    category: "Pendant travaux",
    fileName: "bardage_sud.jpg",
    authorName: "Paul Lefèvre",
    date: "28/04/2025",
    comment: "Avancement bardage façade sud.",
  },
  {
    id: "ph-5",
    chantierId: "c-1",
    category: "Pendant travaux",
    fileName: "charpente_bois.jpg",
    authorName: "Jean Moreau",
    date: "15/04/2025",
  },
  {
    id: "ph-6",
    chantierId: "c-3",
    category: "Avant travaux",
    fileName: "haussmann_avant.jpg",
    authorName: "Marc Dupont",
    date: "05/01/2024",
    comment: "Façade avant ravalement.",
  },
  {
    id: "ph-7",
    chantierId: "c-3",
    category: "Pendant travaux",
    fileName: "fissure_mur_nord.jpg",
    authorName: "Jean Moreau",
    date: "12/05/2025",
    comment: "Réserve RSV-042 — fissure mur porteur nord.",
  },
  {
    id: "ph-8",
    chantierId: "c-3",
    category: "Pendant travaux",
    fileName: "ravalement_nord.jpg",
    authorName: "Pierre Garnier",
    date: "01/05/2025",
  },
  {
    id: "ph-9",
    chantierId: "c-4",
    category: "Après travaux",
    fileName: "parking_fini.jpg",
    authorName: "François Mercier",
    date: "10/07/2025",
    comment: "Parking livré — signalétique en place.",
  },
];

export const mockHistoryEntries: HistoryEntry[] = [
  {
    id: "h-1",
    chantierId: "c-1",
    date: "14/05/2025 09:32",
    authorName: "Jean Moreau",
    action: "Mise à jour avancement",
    newValue: "67 % — Coulage dalle R+3 terminé",
  },
  {
    id: "h-2",
    chantierId: "c-1",
    date: "14/05/2025 08:15",
    authorName: "Marc Dupont",
    action: "Création réserve",
    newValue: "RSV-043 — Retard livraison béton B30",
  },
  {
    id: "h-3",
    chantierId: "c-1",
    date: "02/05/2025 16:40",
    authorName: "Paul Lefèvre",
    action: "Modification réserve",
    oldValue: "RSV-038 — Ouverte",
    newValue: "RSV-038 — En cours",
  },
  {
    id: "h-4",
    chantierId: "c-1",
    date: "15/04/2025 11:20",
    authorName: "Marc Dupont",
    action: "Validation levée réserve",
    oldValue: "RSV-031 — En cours",
    newValue: "RSV-031 — Levée",
  },
  {
    id: "h-5",
    chantierId: "c-1",
    date: "01/03/2024 10:00",
    authorName: "Marc Dupont",
    action: "Changement de statut",
    oldValue: "Préparation",
    newValue: "Planification",
  },
  {
    id: "h-6",
    chantierId: "c-3",
    date: "12/05/2025 14:05",
    authorName: "Jean Moreau",
    action: "Création réserve",
    newValue: "RSV-042 — Fissure mur porteur nord (Critique)",
  },
  {
    id: "h-7",
    chantierId: "c-3",
    date: "01/05/2025 09:00",
    authorName: "Marc Dupont",
    action: "Changement de statut",
    oldValue: "Démarrage",
    newValue: "Réalisation",
  },
  {
    id: "h-8",
    chantierId: "c-3",
    date: "20/03/2024 15:30",
    authorName: "Marc Dupont",
    action: "Changement de statut",
    oldValue: "Réalisation",
    newValue: "Démarrage",
    reason: "Retard livraison matériaux — reprise planification",
  },
  {
    id: "h-9",
    chantierId: "c-3",
    date: "10/04/2025 17:00",
    authorName: "Marc Dupont",
    action: "Validation levée réserve",
    oldValue: "RSV-028 — En cours",
    newValue: "RSV-028 — Levée",
  },
];

export function getAssignmentsForChantier(chantierId: string): Assignment[] {
  return mockAssignments.filter((a) => a.chantierId === chantierId);
}

export function getProgressForChantier(chantierId: string): ProgressUpdate[] {
  return mockProgressUpdates
    .filter((p) => p.chantierId === chantierId)
    .sort((a, b) => b.date.localeCompare(a.date, "fr"));
}

export function getReservesForChantier(chantierId: string): ChantierReserve[] {
  return mockChantierReserves.filter((r) => r.chantierId === chantierId);
}

export function getPhotosForChantier(chantierId: string): ChantierPhoto[] {
  return mockChantierPhotos.filter((p) => p.chantierId === chantierId);
}

export function getHistoryForChantier(chantierId: string): HistoryEntry[] {
  return mockHistoryEntries
    .filter((h) => h.chantierId === chantierId)
    .sort((a, b) => b.date.localeCompare(a.date, "fr"));
}
