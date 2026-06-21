/** RG-001 : retard si date fin dépassée et statut ≠ Clôture */
export type ChantierStatus =
  | 'Préparation'
  | 'Planification'
  | 'Démarrage'
  | 'Réalisation'
  | 'Réception'
  | 'Clôture';

export function parseFrenchDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export function isChantierLate(
  expectedEndDate: string,
  status: ChantierStatus,
  referenceDate: Date = new Date(),
): boolean {
  if (status === 'Clôture') return false;
  const end = parseFrenchDate(expectedEndDate);
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  return end < today;
}
