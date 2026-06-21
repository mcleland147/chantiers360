export type UserRole =
  | "DIRECTION"
  | "ASSISTANTE_ADMINISTRATIVE"
  | "CONDUCTEUR_TRAVAUX"
  | "CHEF_CHANTIER";

export type ChantierStatus =
  | "Préparation"
  | "Planification"
  | "Démarrage"
  | "Réalisation"
  | "Réception"
  | "Clôture";

export type ReserveStatus = "Ouverte" | "En cours" | "Levée";

export type ReservePriority = "Faible" | "Moyenne" | "Haute" | "Critique";

export type AlertType = "RETARD_CHANTIER" | "RESERVE_CRITIQUE";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface Chantier {
  id: string;
  reference: string;
  name: string;
  client: string;
  address: string;
  conductorName: string;
  conductorId?: string;
  status: ChantierStatus;
  startDate: string;
  expectedEndDate: string;
  openReservesCount: number;
  progressPercent?: number;
}

export interface ChantierDetail extends Chantier {
  budget: number;
  budgetSpent: number;
  receptionDate?: string;
  description: string;
  assignedChefIds?: string[];
}

export type PhotoCategory =
  | "Avant travaux"
  | "Pendant travaux"
  | "Après travaux";

export interface Assignment {
  id: string;
  chantierId: string;
  collaboratorName: string;
  jobTitle: string;
  assignedAt: string;
  isActive: boolean;
}

export interface ProgressUpdate {
  id: string;
  chantierId: string;
  date: string;
  authorName: string;
  comment: string;
  percent?: number;
}

export interface ChantierReserve extends Reserve {
  chantierId: string;
}

export interface ChantierPhoto {
  id: string;
  chantierId: string;
  chantierReference?: string;
  chantierName?: string;
  category: PhotoCategory;
  fileName: string;
  fileUrl?: string;
  authorName: string;
  date: string;
  comment?: string;
}

export interface HistoryEntry {
  id: string;
  chantierId: string;
  date: string;
  authorName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface Reserve {
  id: string;
  reference: string;
  title: string;
  chantierReference: string;
  chantierName: string;
  priority: ReservePriority;
  status: ReserveStatus;
  assigneeName: string;
  createdByName?: string;
  createdAt: string;
  takenAt?: string;
  closedAt?: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  chantierReference: string;
  chantierName: string;
  createdAt: string;
}

export interface DashboardKpis {
  activeChantiers: number;
  lateChantiers: number;
  openReserves: number;
  criticalReserves: number;
}
