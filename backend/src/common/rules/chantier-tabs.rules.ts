import { IssuePriority, IssueStatus, UserRoleName } from '@prisma/client';

export function validateProgressComment(comment: string | undefined): string | null {
  if (!comment?.trim()) {
    return 'Le commentaire d\'avancement est obligatoire (RG-TABS-001).';
  }
  return null;
}

export function validateProgressPercent(percent: number | undefined): string | null {
  if (percent === undefined || percent === null) {
    return null;
  }
  if (!Number.isInteger(percent) || percent < 0 || percent > 100) {
    return 'Le pourcentage d\'avancement doit être un entier entre 0 et 100 (RG-TABS-002).';
  }
  return null;
}

export function validateReserveFields(input: {
  title: string | undefined;
  priority: IssuePriority | undefined;
}): string | null {
  if (!input.title?.trim()) {
    return 'Le titre de la réserve est obligatoire (RG-TABS-003).';
  }
  if (!input.priority) {
    return 'La priorité de la réserve est obligatoire (RG-TABS-003).';
  }
  return null;
}

export function validateReservePriseEnChargeTransition(
  currentStatus: IssueStatus,
): string | null {
  if (currentStatus !== 'OUVERTE') {
    return 'Seule une réserve « Ouverte » peut être prise en charge (RG-TABS-008).';
  }
  return null;
}

export function validateReserveLeveeTransition(
  currentStatus: IssueStatus,
): string | null {
  if (currentStatus !== 'EN_COURS') {
    return 'Seule une réserve « En cours » peut être levée (RG-TABS-004).';
  }
  return null;
}

export function validatePhotoFields(input: {
  fileName: string | undefined;
  category: string | undefined;
}): string | null {
  if (!input.fileName?.trim()) {
    return 'Le nom du fichier photo est obligatoire (RG-TABS-005).';
  }
  if (!input.category?.trim()) {
    return 'La catégorie photo est obligatoire (RG-TABS-005).';
  }
  return null;
}

export function validateAssignmentFields(input: {
  userId: string | undefined;
  functionLabel: string | undefined;
}): string | null {
  if (!input.userId?.trim()) {
    return 'Le collaborateur à affecter est obligatoire (RG-TABS-006).';
  }
  if (!input.functionLabel?.trim()) {
    return 'La fonction sur le chantier est obligatoire (RG-TABS-006).';
  }
  return null;
}

export function canAssignMember(role: UserRoleName): boolean {
  return role === 'CONDUCTEUR_TRAVAUX';
}

export function canAddProgressUpdate(role: UserRoleName): boolean {
  return role === 'CONDUCTEUR_TRAVAUX' || role === 'CHEF_CHANTIER';
}

export function canCreateReserve(role: UserRoleName): boolean {
  return role === 'CONDUCTEUR_TRAVAUX' || role === 'CHEF_CHANTIER';
}

export function canTakeChargeReserve(role: UserRoleName): boolean {
  return role === 'CONDUCTEUR_TRAVAUX' || role === 'CHEF_CHANTIER';
}

export function canValidateReserveLevee(role: UserRoleName): boolean {
  return role === 'CONDUCTEUR_TRAVAUX';
}

export function canAddPhoto(role: UserRoleName): boolean {
  return role === 'CONDUCTEUR_TRAVAUX' || role === 'CHEF_CHANTIER';
}
