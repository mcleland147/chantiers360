import type { UserRole } from "../types/domain";
import { getDefaultRouteForRole } from "./navigation";

interface RouteRule {
  pattern: RegExp;
  roles: UserRole[];
}

/** Rôles autorisés par route — aligné SPEC-UI §4.3 */
const ROUTE_RULES: RouteRule[] = [
  { pattern: /^\/dashboard\/direction/, roles: ["DIRECTION"] },
  { pattern: /^\/dashboard$/, roles: ["CONDUCTEUR_TRAVAUX"] },
  {
    pattern: /^\/chantiers/,
    roles: [
      "DIRECTION",
      "ASSISTANTE_ADMINISTRATIVE",
      "CONDUCTEUR_TRAVAUX",
      "CHEF_CHANTIER",
    ],
  },
  {
    pattern: /^\/reserves/,
    roles: ["DIRECTION", "CONDUCTEUR_TRAVAUX", "CHEF_CHANTIER"],
  },
  {
    pattern: /^\/photos/,
    roles: ["DIRECTION", "CONDUCTEUR_TRAVAUX", "CHEF_CHANTIER"],
  },
  { pattern: /^\/mobile/, roles: ["CHEF_CHANTIER"] },
  { pattern: /^\/reports/, roles: [] },
  { pattern: /^\/admin/, roles: [] },
];

export function getAllowedRolesForPath(pathname: string): UserRole[] | null {
  for (const { pattern, roles } of ROUTE_RULES) {
    if (pattern.test(pathname)) return roles;
  }
  return null;
}

export function isRouteAllowed(role: UserRole, pathname: string): boolean {
  const allowed = getAllowedRolesForPath(pathname);
  if (allowed === null) return true;
  if (allowed.length === 0) return false;
  return allowed.includes(role);
}

export function getRedirectForUnauthorized(
  role: UserRole,
  pathname: string,
): string {
  if (isRouteAllowed(role, pathname)) return pathname;
  return getDefaultRouteForRole(role);
}
