import type { User, UserRole } from "../types/domain";

export interface MockAccount extends User {
  password: string;
}

/** Comptes de test MVP — libellés rôles (login via API /auth/login) */
export const mockAccounts: MockAccount[] = [
  {
    id: "u-direction",
    firstName: "Claire",
    lastName: "Bernard",
    email: "direction@batinova.fr",
    role: "DIRECTION",
    password: "demo123",
  },
  {
    id: "u-assistante",
    firstName: "Julie",
    lastName: "Petit",
    email: "assistante@batinova.fr",
    role: "ASSISTANTE_ADMINISTRATIVE",
    password: "demo123",
  },
  {
    id: "u-conducteur",
    firstName: "Marc",
    lastName: "Dupont",
    email: "conducteur@batinova.fr",
    role: "CONDUCTEUR_TRAVAUX",
    password: "demo123",
  },
  {
    id: "u-chef",
    firstName: "Jean",
    lastName: "Moreau",
    email: "chef@batinova.fr",
    role: "CHEF_CHANTIER",
    password: "demo123",
  },
];

export function findAccountByEmail(email: string): MockAccount | undefined {
  const normalized = email.trim().toLowerCase();
  return mockAccounts.find((a) => a.email.toLowerCase() === normalized);
}

export function toPublicUser(account: MockAccount): User {
  const { password: _password, ...user } = account;
  return user;
}

export const roleLabels: Record<UserRole, string> = {
  DIRECTION: "Direction",
  ASSISTANTE_ADMINISTRATIVE: "Assistante administrative",
  CONDUCTEUR_TRAVAUX: "Conducteur de travaux",
  CHEF_CHANTIER: "Chef de chantier",
};

export function getRoleLabel(role: UserRole): string {
  return roleLabels[role];
}
