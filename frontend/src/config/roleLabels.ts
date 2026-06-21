import type { UserRole } from "../types/domain";

export const roleLabels: Record<UserRole, string> = {
  DIRECTION: "Direction",
  ASSISTANTE_ADMINISTRATIVE: "Assistante administrative",
  CONDUCTEUR_TRAVAUX: "Conducteur de travaux",
  CHEF_CHANTIER: "Chef de chantier",
};

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role] ?? role;
}
