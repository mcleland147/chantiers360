import { AlertTriangle, Clock } from "lucide-react";
import type { Alert } from "../../types/domain";

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Alertes</h3>
        <p className="mt-2 text-sm text-muted">Aucune alerte active.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">Alertes</h3>
        <p className="text-xs text-muted">Retards et réserves critiques</p>
      </div>
      <div className="divide-y divide-border">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/80"
          >
            {alert.type === "RETARD_CHANTIER" ? (
              <Clock size={15} className="mt-0.5 shrink-0 text-red-500" />
            ) : (
              <AlertTriangle
                size={15}
                className="mt-0.5 shrink-0 text-orange-500"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-muted">
                  {alert.chantierReference}
                </span>
                <span className="truncate text-sm font-medium text-slate-900">
                  {alert.chantierName}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{alert.message}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-muted">
              {alert.createdAt}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
