import { ProjectStatus } from '@prisma/client';
import {
  PROJECT_STATUS_ORDER,
  statusIndex,
} from '../mappers/chantier.mapper';

export interface ChantierFieldsInput {
  reference: string;
  name: string;
  client: string;
  address: string;
  conductorId: string;
  startDate: Date;
  expectedEndDate: Date;
}

/** RG-DATA-001 : référence unique + champs obligatoires valides */
export function validateChantierFields(
  input: ChantierFieldsInput,
): string | null {
  const reference = input.reference?.trim();
  if (!reference || !/^CHT-\d{3,}$/.test(reference)) {
    return 'La référence doit respecter le format CHT-XXX.';
  }
  if (!input.name?.trim()) return 'Le nom du chantier est obligatoire.';
  if (!input.client?.trim()) return 'Le client est obligatoire.';
  if (!input.address?.trim()) return "L'adresse est obligatoire.";
  if (!input.conductorId?.trim()) return 'Le conducteur est obligatoire.';
  if (!input.startDate || Number.isNaN(input.startDate.getTime())) {
    return 'La date de début est invalide.';
  }
  if (!input.expectedEndDate || Number.isNaN(input.expectedEndDate.getTime())) {
    return 'La date de fin prévue est invalide.';
  }
  if (input.expectedEndDate < input.startDate) {
    return 'La date de fin prévue doit être postérieure à la date de début.';
  }
  return null;
}

/** RG-DATA-002 : statut initial Préparation à la création */
export function getInitialProjectStatus(): ProjectStatus {
  return 'PREPARATION';
}

/** RG-DATA-003 : transition workflow ±1 étape dans l'ordre officiel */
export function isValidStatusTransition(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  if (from === to) return false;
  const fromIdx = statusIndex(from);
  const toIdx = statusIndex(to);
  if (fromIdx < 0 || toIdx < 0) return false;
  return Math.abs(toIdx - fromIdx) === 1;
}

export function isBackwardStatusTransition(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  return statusIndex(to) < statusIndex(from);
}

/** RG-DATA-004 : motif obligatoire en cas de retour arrière (RG-004) */
export function requiresStatusChangeReason(
  from: ProjectStatus,
  to: ProjectStatus,
): boolean {
  return isBackwardStatusTransition(from, to);
}

/** REC-013 : clôture interdite si réserves ouvertes ou en cours */
export function validateChantierClosure(openReservesCount: number): string | null {
  if (openReservesCount > 0) {
    return 'Impossible de clôturer le chantier : des réserves sont encore ouvertes ou en cours (REC-013).';
  }
  return null;
}

export function validateStatusChange(
  from: ProjectStatus,
  to: ProjectStatus,
  reason?: string,
  openReservesCount = 0,
): string | null {
  if (!isValidStatusTransition(from, to)) {
    return `Transition de statut invalide : ${STATUS_LABEL(from)} → ${STATUS_LABEL(to)}.`;
  }
  if (requiresStatusChangeReason(from, to) && !reason?.trim()) {
    return 'Un motif est obligatoire pour un retour arrière de statut (RG-DATA-004).';
  }
  if (to === 'CLOTURE') {
    return validateChantierClosure(openReservesCount);
  }
  return null;
}

function STATUS_LABEL(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    PREPARATION: 'Préparation',
    PLANIFICATION: 'Planification',
    DEMARRAGE: 'Démarrage',
    REALISATION: 'Réalisation',
    RECEPTION: 'Réception',
    CLOTURE: 'Clôture',
  };
  return labels[status];
}

export { PROJECT_STATUS_ORDER };
