import { isAxiosError } from "axios";
import type { UserRole } from "../types/domain";
import { extractApiErrorMessage } from "./extractApiError";

export interface BudgetTabErrorMessage {
  title: string;
  description: string;
}

export function resolveBudgetTabError(
  error: unknown,
  role: UserRole,
): BudgetTabErrorMessage {
  if (isAxiosError(error) && error.response?.status === 403) {
    if (role === "CONDUCTEUR_TRAVAUX") {
      return {
        title: "Accès restreint",
        description: "Accès réservé au conducteur référent de ce chantier.",
      };
    }
    if (role === "CHEF_CHANTIER") {
      return {
        title: "Accès restreint",
        description: "Accès réservé aux équipes affectées à ce chantier.",
      };
    }
    return {
      title: "Accès restreint",
      description: extractApiErrorMessage(
        error,
        "Vous n'avez pas accès au budget de ce chantier.",
      ),
    };
  }

  if (isAxiosError(error) && error.response?.status === 404) {
    return {
      title: "Chantier introuvable",
      description: "Ce chantier n'existe pas ou n'est plus accessible.",
    };
  }

  return {
    title: "Budget indisponible",
    description: extractApiErrorMessage(
      error,
      "Impossible de charger la synthèse budget pour ce chantier.",
    ),
  };
}
