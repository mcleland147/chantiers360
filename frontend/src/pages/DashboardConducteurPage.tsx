import {
  AlertTriangle,
  Clock,
  FolderKanban,
  ShieldAlert,
} from "lucide-react";
import { AlertsPanel } from "../components/dashboard/AlertsPanel";
import { KpiCard } from "../components/dashboard/KpiCard";
import { RecentChantiersList } from "../components/dashboard/RecentChantiersList";
import { RecentReservesList } from "../components/dashboard/RecentReservesList";
import { useConducteurDashboardQuery } from "../hooks/useDashboard";

export function DashboardConducteurPage() {
  const { data, isLoading, isError } = useConducteurDashboardQuery();

  if (isLoading) {
    return (
      <div className="p-5 text-sm text-slate-500">Chargement du tableau de bord…</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-5 text-sm text-red-600">
        Impossible de charger le tableau de bord.
      </div>
    );
  }

  const { kpis, alerts, recentChantiers, recentReserves } = data;

  return (
    <div className="space-y-5 p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Chantiers actifs"
          value={kpis.activeChantiers}
          subtitle="Hors statut Clôture"
          icon={FolderKanban}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <KpiCard
          label="Chantiers en retard"
          value={kpis.lateChantiers}
          subtitle="Date fin dépassée (RG-001)"
          icon={Clock}
          iconBgClass="bg-red-50"
          iconColorClass="text-red-500"
        />
        <KpiCard
          label="Réserves ouvertes"
          value={kpis.openReserves}
          subtitle="Statuts Ouverte et En cours"
          icon={AlertTriangle}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-500"
        />
        <KpiCard
          label="Réserves critiques"
          value={kpis.criticalReserves}
          subtitle="Priorité Critique non levée"
          icon={ShieldAlert}
          iconBgClass="bg-red-50"
          iconColorClass="text-red-600"
        />
      </div>

      <AlertsPanel alerts={alerts} />

      <RecentChantiersList chantiers={recentChantiers} />

      <RecentReservesList reserves={recentReserves} />
    </div>
  );
}

export const dashboardConducteurHandle = {
  title: "Tableau de bord",
  subtitle: "Pilotage de vos chantiers",
};
