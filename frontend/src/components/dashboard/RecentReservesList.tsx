import { AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { Reserve } from "../../types/domain";
import {
  PriorityBadge,
  ReserveStatusBadge,
} from "../badges/StatusBadge";

interface RecentReservesListProps {
  reserves: Reserve[];
  viewAllPath?: string;
}

export function RecentReservesList({
  reserves,
  viewAllPath = "/reserves",
}: RecentReservesListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Réserves récentes
          </h3>
          <p className="text-xs text-muted">
            Haute priorité et critique — action requise
          </p>
        </div>
        <Link
          to={viewAllPath}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
        >
          Voir toutes
          <ChevronRight size={13} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {reserves.map((reserve) => (
          <div
            key={reserve.id}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/80"
          >
            <AlertTriangle size={14} className="shrink-0 text-red-500" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-muted">
                  {reserve.reference}
                </span>
                <span className="truncate text-sm text-slate-900">
                  {reserve.title}
                </span>
              </div>
              <div className="mt-0.5 text-xs text-muted">
                {reserve.chantierReference} · {reserve.chantierName} · Assigné
                à {reserve.assigneeName} · {reserve.createdAt}
              </div>
            </div>
            <div className="hidden shrink-0 flex-wrap items-center gap-1.5 sm:flex">
              <PriorityBadge priority={reserve.priority} />
              <ReserveStatusBadge status={reserve.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
