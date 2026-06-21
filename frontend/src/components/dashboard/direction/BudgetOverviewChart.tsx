import type { BudgetOverview } from "../../../types/directionDashboard";

interface BudgetOverviewChartProps {
  data: BudgetOverview;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} M€`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)} k€`;
  }
  return `${value} €`;
}

export function BudgetOverviewChart({ data }: BudgetOverviewChartProps) {
  const spentPercent =
    data.totalBudget > 0
      ? Math.min(100, Math.round((data.totalSpent / data.totalBudget) * 100))
      : 0;
  const barColor =
    spentPercent >= 100
      ? "bg-red-500"
      : spentPercent >= 80
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <div
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
      data-testid="budget-overview-chart"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Vue budget</h3>
        <p className="text-xs text-muted">
          Consolidé sur {data.chantierCount} chantiers — dépenses validées
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted">Consommé</span>
            <span className="font-medium text-slate-900">
              {formatCurrency(data.totalSpent)} / {formatCurrency(data.totalBudget)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${spentPercent}%` }}
              role="progressbar"
              aria-valuenow={spentPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Budget consommé ${spentPercent}%`}
            />
          </div>
          <p className="mt-1 text-xs text-muted">{data.consumptionPercent}% du budget total</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Budget total
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {formatCurrency(data.totalBudget)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Reste à engager
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {formatCurrency(data.totalRemaining)}
            </p>
          </div>
          <div className="rounded-lg bg-amber-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
              Chantiers &gt; 80 %
            </p>
            <p className="mt-0.5 text-sm font-semibold text-amber-900" data-testid="kpi-over-80">
              {data.chantiersOver80}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-red-700">
              Chantiers &gt; 100 %
            </p>
            <p className="mt-0.5 text-sm font-semibold text-red-900" data-testid="kpi-over-100">
              {data.chantiersOver100}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
