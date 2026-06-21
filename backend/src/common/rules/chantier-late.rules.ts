import { ProjectStatus } from '@prisma/client';

/** RG-001 : retard si date fin dépassée et statut ≠ Clôture */
export function isProjectLate(
  expectedEndDate: Date,
  status: ProjectStatus,
  now: Date = new Date(),
): boolean {
  if (status === 'CLOTURE') return false;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const end = new Date(expectedEndDate);
  end.setHours(0, 0, 0, 0);
  return end < today;
}

export function isActiveProject(status: ProjectStatus): boolean {
  return status !== 'CLOTURE';
}
