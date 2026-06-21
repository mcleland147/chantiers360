import { ProjectStatus, IssueStatus, IssuePriority, PhotoCategory } from '@prisma/client';

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  'PREPARATION',
  'PLANIFICATION',
  'DEMARRAGE',
  'REALISATION',
  'RECEPTION',
  'CLOTURE',
];

export const STATUS_TO_FRENCH: Record<ProjectStatus, string> = {
  PREPARATION: 'Préparation',
  PLANIFICATION: 'Planification',
  DEMARRAGE: 'Démarrage',
  REALISATION: 'Réalisation',
  RECEPTION: 'Réception',
  CLOTURE: 'Clôture',
};

export const FRENCH_TO_STATUS: Record<string, ProjectStatus> = {
  Préparation: 'PREPARATION',
  Planification: 'PLANIFICATION',
  Démarrage: 'DEMARRAGE',
  Réalisation: 'REALISATION',
  Réception: 'RECEPTION',
  Clôture: 'CLOTURE',
};

export function formatDateFr(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function parseIsoDate(value: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('INVALID_DATE');
  }
  return date;
}

export function statusIndex(status: ProjectStatus): number {
  return PROJECT_STATUS_ORDER.indexOf(status);
}

export function statusToFrench(status: ProjectStatus): string {
  return STATUS_TO_FRENCH[status];
}

export function statusFromFrench(label: string): ProjectStatus {
  const status = FRENCH_TO_STATUS[label];
  if (!status) {
    throw new Error('INVALID_STATUS');
  }
  return status;
}

export const ISSUE_STATUS_TO_FRENCH: Record<IssueStatus, string> = {
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  LEVEE: 'Levée',
};

export const FRENCH_TO_ISSUE_STATUS: Record<string, IssueStatus> = {
  Ouverte: 'OUVERTE',
  'En cours': 'EN_COURS',
  Levée: 'LEVEE',
};

export const ISSUE_PRIORITY_TO_FRENCH: Record<IssuePriority, string> = {
  FAIBLE: 'Faible',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique',
};

export const FRENCH_TO_ISSUE_PRIORITY: Record<string, IssuePriority> = {
  Faible: 'FAIBLE',
  Moyenne: 'MOYENNE',
  Haute: 'HAUTE',
  Critique: 'CRITIQUE',
};

export const PHOTO_CATEGORY_TO_FRENCH: Record<PhotoCategory, string> = {
  AVANT_TRAVAUX: 'Avant travaux',
  PENDANT_TRAVAUX: 'Pendant travaux',
  APRES_TRAVAUX: 'Après travaux',
};

export const FRENCH_TO_PHOTO_CATEGORY: Record<string, PhotoCategory> = {
  'Avant travaux': 'AVANT_TRAVAUX',
  'Pendant travaux': 'PENDANT_TRAVAUX',
  'Après travaux': 'APRES_TRAVAUX',
};

export function issueStatusToFrench(status: IssueStatus): string {
  return ISSUE_STATUS_TO_FRENCH[status];
}

export function issueStatusFromFrench(label: string): IssueStatus {
  const status = FRENCH_TO_ISSUE_STATUS[label];
  if (!status) {
    throw new Error('INVALID_ISSUE_STATUS');
  }
  return status;
}

export function issuePriorityToFrench(priority: IssuePriority): string {
  return ISSUE_PRIORITY_TO_FRENCH[priority];
}

export function issuePriorityFromFrench(label: string): IssuePriority {
  const priority = FRENCH_TO_ISSUE_PRIORITY[label];
  if (!priority) {
    throw new Error('INVALID_ISSUE_PRIORITY');
  }
  return priority;
}

export function photoCategoryToFrench(category: PhotoCategory): string {
  return PHOTO_CATEGORY_TO_FRENCH[category];
}

export function photoCategoryFromFrench(label: string): PhotoCategory {
  const category = FRENCH_TO_PHOTO_CATEGORY[label];
  if (!category) {
    throw new Error('INVALID_PHOTO_CATEGORY');
  }
  return category;
}

export function formatDateTimeFr(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${formatDateFr(date)} ${hours}:${minutes}`;
}
