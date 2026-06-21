import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  Camera,
  FolderKanban,
  LayoutDashboard,
  Smartphone,
} from "lucide-react";
import type { UserRole } from "../types/domain";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
  badge?: number;
}

/** Navigation MVP — sans Rapports, Administration ni Équipes dédié */
export const mvpNavItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    roles: ["CONDUCTEUR_TRAVAUX"],
  },
  {
    label: "Dashboard",
    path: "/dashboard/direction",
    icon: LayoutDashboard,
    roles: ["DIRECTION"],
  },
  {
    label: "Chantiers",
    path: "/chantiers",
    icon: FolderKanban,
    roles: [
      "DIRECTION",
      "ASSISTANTE_ADMINISTRATIVE",
      "CONDUCTEUR_TRAVAUX",
      "CHEF_CHANTIER",
    ],
  },
  {
    label: "Réserves",
    path: "/reserves",
    icon: AlertTriangle,
    roles: ["DIRECTION", "CONDUCTEUR_TRAVAUX", "CHEF_CHANTIER"],
  },
  {
    label: "Photos",
    path: "/photos",
    icon: Camera,
    roles: ["DIRECTION", "CONDUCTEUR_TRAVAUX", "CHEF_CHANTIER"],
  },
  {
    label: "Planning",
    path: "/planning",
    icon: CalendarDays,
    roles: [
      "DIRECTION",
      "ASSISTANTE_ADMINISTRATIVE",
      "CONDUCTEUR_TRAVAUX",
      "CHEF_CHANTIER",
    ],
  },
  {
    label: "Vue mobile",
    path: "/mobile",
    icon: Smartphone,
    roles: ["CHEF_CHANTIER"],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return mvpNavItems.filter((item) => item.roles.includes(role));
}

export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case "DIRECTION":
      return "/dashboard/direction";
    case "ASSISTANTE_ADMINISTRATIVE":
      return "/chantiers";
    case "CHEF_CHANTIER":
      return "/mobile";
    default:
      return "/dashboard";
  }
}
