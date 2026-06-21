import type { UserRole } from "../types/domain";

export function canAssignMember(role: UserRole): boolean {
  return role === "CONDUCTEUR_TRAVAUX";
}

export function canAddProgressUpdate(role: UserRole): boolean {
  return role === "CONDUCTEUR_TRAVAUX" || role === "CHEF_CHANTIER";
}

export function canCreateReserve(role: UserRole): boolean {
  return role === "CONDUCTEUR_TRAVAUX" || role === "CHEF_CHANTIER";
}

export function canTakeChargeReserve(role: UserRole): boolean {
  return role === "CONDUCTEUR_TRAVAUX" || role === "CHEF_CHANTIER";
}

export function canValidateReserveLevee(role: UserRole): boolean {
  return role === "CONDUCTEUR_TRAVAUX";
}

export function canAddPhoto(role: UserRole): boolean {
  return role === "CONDUCTEUR_TRAVAUX" || role === "CHEF_CHANTIER";
}

export function canEditChantier(role: UserRole): boolean {
  return (
    role === "CONDUCTEUR_TRAVAUX" || role === "ASSISTANTE_ADMINISTRATIVE"
  );
}

export function canManageBudget(role: UserRole): boolean {
  return (
    role === "CONDUCTEUR_TRAVAUX" || role === "ASSISTANTE_ADMINISTRATIVE"
  );
}

export function canViewBudget(role: UserRole): boolean {
  return (
    role === "DIRECTION" ||
    role === "ASSISTANTE_ADMINISTRATIVE" ||
    role === "CONDUCTEUR_TRAVAUX" ||
    role === "CHEF_CHANTIER"
  );
}
