import type { StatusSlice } from "../../../types/directionDashboard";
import { ChantierStatusBadge } from "../../badges/StatusBadge";

interface StatusDistributionChartProps {
  data: StatusSlice[];
}

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
      data-testid="status-distribution-chart"
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Répartition par statut
        </h3>
        <p className="text-xs text-muted">
          {total} chantier{total > 1 ? "s" : ""} — terminologie MVP
        </p>
      </div>
      <div className="space-y-3">
        {data.map((slice) => (
          <div key={slice.status}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <ChantierStatusBadge status={slice.status} />
              <span className="font-mono text-xs text-muted">
                {slice.count} ({total > 0 ? Math.round((slice.count / total) * 100) : 0}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${(slice.count / maxCount) * 100}%` }}
                role="presentation"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
