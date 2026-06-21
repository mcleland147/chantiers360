import {
  ExpenseCategory,
  ExpenseStatus,
  ResourceType,
} from '@prisma/client';

export const RESOURCE_TYPE_TO_FRENCH: Record<ResourceType, string> = {
  MAIN_OEUVRE: 'Main-d\'œuvre',
  MATERIEL: 'Matériel',
  SOUS_TRAITANT: 'Sous-traitant',
  AUTRE: 'Autre',
};

export const RESOURCE_TYPE_FROM_FRENCH: Record<string, ResourceType> = {
  'Main-d\'œuvre': 'MAIN_OEUVRE',
  'Main-doeuvre': 'MAIN_OEUVRE',
  Matériel: 'MATERIEL',
  Materiel: 'MATERIEL',
  'Sous-traitant': 'SOUS_TRAITANT',
  Autre: 'AUTRE',
};

export const EXPENSE_CATEGORY_TO_FRENCH: Record<ExpenseCategory, string> = {
  ACHAT_MATERIAUX: 'Achat matériaux',
  LOCATION: 'Location',
  SOUS_TRAITANCE: 'Sous-traitance',
  MAIN_OEUVRE: 'Main-d\'œuvre',
  FRAIS_GENERAUX: 'Frais généraux',
  AUTRE: 'Autre',
};

export const EXPENSE_CATEGORY_FROM_FRENCH: Record<string, ExpenseCategory> = {
  'Achat matériaux': 'ACHAT_MATERIAUX',
  Location: 'LOCATION',
  'Sous-traitance': 'SOUS_TRAITANCE',
  'Main-d\'œuvre': 'MAIN_OEUVRE',
  'Main-doeuvre': 'MAIN_OEUVRE',
  'Frais généraux': 'FRAIS_GENERAUX',
  Autre: 'AUTRE',
};

export const EXPENSE_STATUS_TO_FRENCH: Record<ExpenseStatus, string> = {
  DRAFT: 'Brouillon',
  VALIDATED: 'Validée',
  CANCELLED: 'Annulée',
};

export const EXPENSE_STATUS_FROM_FRENCH: Record<string, ExpenseStatus> = {
  Brouillon: 'DRAFT',
  Validée: 'VALIDATED',
  Validee: 'VALIDATED',
  Annulée: 'CANCELLED',
  Annulee: 'CANCELLED',
};

export function resourceTypeToFrench(type: ResourceType): string {
  return RESOURCE_TYPE_TO_FRENCH[type];
}

export function expenseCategoryToFrench(category: ExpenseCategory): string {
  return EXPENSE_CATEGORY_TO_FRENCH[category];
}

export function expenseStatusToFrench(status: ExpenseStatus): string {
  return EXPENSE_STATUS_TO_FRENCH[status];
}
