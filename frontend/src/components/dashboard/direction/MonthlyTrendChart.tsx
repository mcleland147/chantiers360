import type { DirectionPeriod, MonthlyTrendPoint } from "../../../types/directionDashboard";

interface MonthlyTrendChartProps {
  data: MonthlyTrendPoint[];
  period: DirectionPeriod;
  onPeriodChange: (period: DirectionPeriod) => void;
}

export function MonthlyTrendChart({
  data,
  period,
  onPeriodChange,
}: MonthlyTrendChartProps) {
  const maxActive = Math.max(...data.map((d) => d.activeChantiers), 1);
  const maxReserves = Math.max(...data.map((d) => d.openReserves), 1);

  return (
    <div
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
      data-testid="monthly-trend-chart"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Tendance mensuelle
          </h3>
          <p className="text-xs text-muted">
            Chantiers actifs et réserves ouvertes
          </p>
        </div>
        <div className="flex rounded-lg border border-border p-0.5">
          <button
            type="button"
            onClick={() => onPeriodChange("month")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              period === "month"
                ? "bg-brand text-white"
                : "text-muted hover:text-slate-900"
            }`}
          >
            Mois
          </button>
          <button
            type="button"
            onClick={() => onPeriodChange("quarter")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              period === "quarter"
                ? "bg-brand text-white"
                : "text-muted hover:text-slate-900"
            }`}
          >
            Trimestre
          </button>
        </div>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ minHeight: 140 }}>
        {data.map((point) => (
          <div
            key={point.label}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <div className="flex w-full items-end justify-center gap-1" style={{ height: 100 }}>
              <div
                className="w-3 rounded-t bg-blue-500"
                style={{
                  height: `${(point.activeChantiers / maxActive) * 100}%`,
                }}
                title={`${point.activeChantiers} chantiers actifs`}
              />
              <div
                className="w-3 rounded-t bg-orange-400"
                style={{
                  height: `${(point.openReserves / maxReserves) * 100}%`,
                }}
                title={`${point.openReserves} réserves ouvertes`}
              />
            </div>
            <span className="text-center text-[10px] text-muted">{point.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
          Chantiers actifs
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-orange-400" />
          Réserves ouvertes
        </span>
      </div>
    </div>
  );
}
