import type { User } from "../types/domain";

export interface PageMeta {
  title: string;
  subtitle?: string;
}

export function resolvePageMeta(pathname: string, user: User): PageMeta {
  if (pathname === "/dashboard") {
    return {
      title: "Tableau de bord",
      subtitle: `Bonjour ${user.firstName} — voici l'état de vos chantiers`,
    };
  }
  if (pathname === "/dashboard/direction") {
    return {
      title: "Tableau de bord Direction",
      subtitle: "BatiNova Travaux · Vue consolidée",
    };
  }
  if (pathname === "/chantiers") {
    return {
      title: "Chantiers",
      subtitle: "Gestion et suivi de tous les chantiers",
    };
  }
  if (pathname.startsWith("/chantiers/")) {
    return {
      title: "Fiche chantier",
      subtitle: "Détail et suivi opérationnel",
    };
  }
  if (pathname === "/reserves") {
    return {
      title: "Réserves",
      subtitle: "Suivi des non-conformités et anomalies",
    };
  }
  if (pathname === "/photos") {
    return {
      title: "Photos",
      subtitle: "Photothèque des chantiers",
    };
  }
  if (pathname === "/mobile") {
    return {
      title: "Vue mobile",
      subtitle: "Interface optimisée pour le terrain",
    };
  }
  if (pathname === "/reports") {
    return {
      title: "Rapports",
      subtitle: "Génération et export de rapports",
    };
  }
  if (pathname === "/admin") {
    return {
      title: "Administration",
      subtitle: "Configuration système",
    };
  }
  return { title: "Chantiers360" };
}
