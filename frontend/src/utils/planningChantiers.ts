import type { Chantier, User } from "../types/domain";

/**
 * RG-PLA-04 — périmètre chantiers planning (aligné buildProjectScopeForRole côté API).
 */
export function filterChantiersForPlanningScope(
  chantiers: Chantier[],
  user: User | null,
  assignedChantierIds?: ReadonlySet<string>,
): Chantier[] {
  if (!user) return [];

  switch (user.role) {
    case "CONDUCTEUR_TRAVAUX":
      return chantiers.filter((c) => c.conductorId === user.id);
    case "CHEF_CHANTIER":
      if (!assignedChantierIds) return [];
      return chantiers.filter((c) => assignedChantierIds.has(c.id));
    case "DIRECTION":
    case "ASSISTANTE_ADMINISTRATIVE":
      return chantiers;
    default:
      return [];
  }
}

/** Indique si un filtre chantier reste valide après changement de périmètre. */
export function isProjectInPlanningScope(
  projectId: string,
  scopedChantiers: Chantier[],
): boolean {
  if (!projectId) return true;
  return scopedChantiers.some((c) => c.id === projectId);
}
