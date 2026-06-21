import { UserRoleName } from '@prisma/client';

export const ROLES_CHANTIER_ACCESS: UserRoleName[] = [
  'DIRECTION',
  'ASSISTANTE_ADMINISTRATIVE',
  'CONDUCTEUR_TRAVAUX',
  'CHEF_CHANTIER',
];

export const ROLES_RESERVES_PHOTOS: UserRoleName[] = [
  'DIRECTION',
  'CONDUCTEUR_TRAVAUX',
  'CHEF_CHANTIER',
];

export const ROLES_CONDUCTEUR: UserRoleName[] = ['CONDUCTEUR_TRAVAUX'];

export const ROLES_CHEF: UserRoleName[] = ['CHEF_CHANTIER'];

export const ROLES_PLANNING_READ: UserRoleName[] = [
  'DIRECTION',
  'ASSISTANTE_ADMINISTRATIVE',
  'CONDUCTEUR_TRAVAUX',
  'CHEF_CHANTIER',
];

export const ROLES_PLANNING_WRITE: UserRoleName[] = ['CONDUCTEUR_TRAVAUX'];

export const ROLES_PLANNING_KPI: UserRoleName[] = [
  'DIRECTION',
  'CONDUCTEUR_TRAVAUX',
];
