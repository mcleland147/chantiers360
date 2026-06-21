import type { Chantier, ChantierStatus } from "../types/domain";

/** RG-001 : retard si date dépassée et statut ≠ Clôture */
export function isChantierLate(
  expectedEndDate: string,
  status: ChantierStatus,
): boolean {
  if (status === "Clôture") return false;
  const end = parseFrenchDate(expectedEndDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return end < today;
}

export function isChantierLateFromEntity(chantier: Chantier): boolean {
  return isChantierLate(chantier.expectedEndDate, chantier.status);
}

function parseFrenchDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
}
