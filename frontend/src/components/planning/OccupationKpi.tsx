import type { OccupationKpi } from "../../types/domain";

interface OccupationKpiProps {
  kpi?: OccupationKpi;
  isLoading?: boolean;
}

export function OccupationKpiCard({ kpi, isLoading }: OccupationKpiProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted">
        Calcul du KPI occupation…
      </div>
    );
  }
  if (!kpi) return null;

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground">Occupation équipes</h3>
      <p className="mt-1 text-2xl font-bold text-brand">
        {kpi.occupationPercent} %
      </p>
      <p className="text-xs text-muted">
        {kpi.plannedHours} h planifiées · référentiel {kpi.referenceHoursPerWeek} h/semaine
      </p>
      {kpi.workers.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-muted">
          {kpi.workers.slice(0, 5).map((w) => (
            <li key={w.workerId}>
              {w.workerName} — {w.occupationPercent} % ({w.plannedHours} h)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
