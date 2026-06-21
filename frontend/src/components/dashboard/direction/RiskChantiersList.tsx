import { AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import type { AtRiskChantier } from "../../../types/directionDashboard";
import {
  ChantierStatusBadge,
  LateBadge,
} from "../../badges/StatusBadge";

interface RiskChantiersListProps {
  chantiers: AtRiskChantier[];
}

const reasonLabels = {
  RETARD: "En retard (RG-001)",
  RESERVE_CRITIQUE: "Réserves critiques",
} as const;

export function RiskChantiersList({ chantiers }: RiskChantiersListProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
      data-testid="risk-chantiers-list"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Chantiers à risque
        </h3>
        <p className="text-xs text-muted">
          Retard RG-001 ou réserve critique ouverte / en cours
        </p>
      </div>
      {chantiers.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">
          Aucun chantier à risque identifié.
        </p>
      ) : (
        <div className="divide-y divide-border">
          {chantiers.map((chantier) => (
            <Link
              key={chantier.id}
              to={`/chantiers/${chantier.id}`}
              className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <AlertTriangle size={14} className="text-red-500" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-muted">
                    {chantier.reference}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-900">
                    {chantier.name}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {chantier.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700"
                    >
                      {reason === "RETARD" ? (
                        <Clock size={9} aria-hidden />
                      ) : (
                        <AlertTriangle size={9} aria-hidden />
                      )}
                      {reasonLabels[reason]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
                <ChantierStatusBadge status={chantier.status} />
                {chantier.reasons.includes("RETARD") && <LateBadge />}
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 text-muted group-hover:text-slate-900"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
