import { ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Chantier } from "../../types/domain";
import { isChantierLateFromEntity } from "../../utils/chantierRules";
import {
  ChantierStatusBadge,
  LateBadge,
} from "../badges/StatusBadge";

interface RecentChantiersListProps {
  chantiers: Chantier[];
  viewAllPath?: string;
}

export function RecentChantiersList({
  chantiers,
  viewAllPath = "/chantiers",
}: RecentChantiersListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Chantiers récemment mis à jour
          </h3>
          <p className="text-xs text-muted">Activité des 7 derniers jours</p>
        </div>
        <Link
          to={viewAllPath}
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
        >
          Voir tous
          <ChevronRight size={13} />
        </Link>
      </div>
      <div className="divide-y divide-border">
        {chantiers.map((chantier) => {
          const isLate = isChantierLateFromEntity(chantier);
          return (
            <Link
              key={chantier.id}
              to={`/chantiers/${chantier.id}`}
              className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50/80"
            >
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-muted">
                    {chantier.reference}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-900">
                    {chantier.name}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                  <span>{chantier.client}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {chantier.address}
                  </span>
                </div>
              </div>
              <div className="hidden shrink-0 flex-wrap items-center justify-end gap-1.5 md:flex">
                <ChantierStatusBadge status={chantier.status} />
                {isLate && <LateBadge />}
              </div>
              <div className="hidden text-right lg:block">
                <span className="text-xs text-muted">Fin prévue</span>
                <p className="font-mono text-xs text-slate-700">
                  {chantier.expectedEndDate}
                </p>
              </div>
              <div className="hidden text-center md:block">
                <span className="text-xs text-muted">Réserves</span>
                <p
                  className={`font-mono text-sm font-semibold ${
                    chantier.openReservesCount >= 5
                      ? "text-red-600"
                      : chantier.openReservesCount >= 2
                        ? "text-amber-600"
                        : "text-slate-600"
                  }`}
                >
                  {chantier.openReservesCount}
                </p>
              </div>
              <ChevronRight
                size={14}
                className="shrink-0 text-muted group-hover:text-slate-900"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
