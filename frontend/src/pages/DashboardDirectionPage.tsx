import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  FolderKanban,
  ShieldAlert,
} from "lucide-react";
import { KpiCard } from "../components/dashboard/KpiCard";
import { BudgetOverviewChart } from "../components/dashboard/direction/BudgetOverviewChart";
import { ConductorDistributionTable } from "../components/dashboard/direction/ConductorDistributionTable";
import { MonthlyTrendChart } from "../components/dashboard/direction/MonthlyTrendChart";
import { RiskChantiersList } from "../components/dashboard/direction/RiskChantiersList";
import { StatusDistributionChart } from "../components/dashboard/direction/StatusDistributionChart";
import type { DirectionPeriod } from "../types/directionDashboard";
import { filterMonthlyTrend } from "../utils/directionDashboard";
import { useDirectionDashboardQuery } from "../hooks/useDashboard";

export function DashboardDirectionPage() {
  const [period, setPeriod] = useState<DirectionPeriod>("quarter");
  const { data, isLoading, isError } = useDirectionDashboardQuery(period);

  if (isLoading) {
    return (
      <div className="p-5 text-sm text-slate-500">Chargement du tableau de bord…</div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-5 text-sm text-red-600">
        Impossible de charger le tableau de bord direction.
      </div>
    );
  }

  const trendData = filterMonthlyTrend(data.monthlyTrend, period);

  return (
    <div className="space-y-5 p-5" data-testid="dashboard-direction">
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Consultation seule</span> — aucune
          action de création, modification ou suppression (RG-012).
        </p>
      </div>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
        data-testid="direction-kpi-grid"
      >
        <KpiCard
          label="Total chantiers"
          value={data.kpis.totalChantiers}
          subtitle="Portefeuille entreprise"
          icon={FolderKanban}
          iconBgClass="bg-blue-50"
          iconColorClass="text-blue-600"
        />
        <KpiCard
          label="Chantiers en retard"
          value={data.kpis.lateChantiers}
          subtitle="Date fin dépassée (RG-001)"
          icon={Clock}
          iconBgClass="bg-red-50"
          iconColorClass="text-red-500"
        />
        <KpiCard
          label="Réserves ouvertes"
          value={data.kpis.openReserves}
          subtitle="Statuts Ouverte et En cours"
          icon={AlertTriangle}
          iconBgClass="bg-orange-50"
          iconColorClass="text-orange-500"
        />
        <KpiCard
          label="Réserves critiques"
          value={data.kpis.criticalReserves}
          subtitle="Priorité Critique non levée"
          icon={ShieldAlert}
          iconBgClass="bg-red-50"
          iconColorClass="text-red-600"
        />
      </div>

      <RiskChantiersList chantiers={data.atRiskChantiers} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <StatusDistributionChart data={data.statusDistribution} />
        <MonthlyTrendChart
          data={trendData}
          period={period}
          onPeriodChange={setPeriod}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ConductorDistributionTable rows={data.conductorDistribution} />
        <BudgetOverviewChart data={data.budget} />
      </div>
    </div>
  );
}

export const dashboardDirectionHandle = {
  title: "Tableau de bord Direction",
  subtitle: "BatiNova Travaux · Vue consolidée",
};
