import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import type { Chantier } from "../../types/domain";
import { isChantierLateFromEntity } from "../../utils/chantierRules";
import {
  ChantierStatusBadge,
  LateBadge,
} from "../badges/StatusBadge";

interface ChantiersTableProps {
  chantiers: Chantier[];
}

export function ChantiersTable({ chantiers }: ChantiersTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                <span className="inline-flex items-center gap-1">
                  Référence
                  <ArrowUpDown size={11} className="opacity-40" />
                </span>
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Nom
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold text-muted md:table-cell">
                Client
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold text-muted lg:table-cell">
                Conducteur
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Statut
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold text-muted sm:table-cell">
                Début
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Fin prévue
              </th>
              <th className="hidden px-4 py-3 text-center text-xs font-semibold text-muted md:table-cell">
                Réserves
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {chantiers.map((chantier) => {
              const isLate = isChantierLateFromEntity(chantier);
              return (
                <tr
                  key={chantier.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/chantiers/${chantier.id}`}
                      className="font-mono text-xs font-medium text-accent hover:text-accent-hover hover:underline"
                    >
                      {chantier.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/chantiers/${chantier.id}`}
                      className="font-medium text-slate-900 hover:text-accent"
                    >
                      {chantier.name}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {chantier.client}
                  </td>
                  <td className="hidden px-4 py-3 text-muted lg:table-cell">
                    {chantier.conductorName}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <ChantierStatusBadge status={chantier.status} />
                      {isLate && <LateBadge />}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">
                    {chantier.startDate}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-700">
                    {chantier.expectedEndDate}
                  </td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">
                    <span
                      className={`font-mono text-sm font-semibold ${
                        chantier.openReservesCount >= 5
                          ? "text-red-600"
                          : chantier.openReservesCount >= 2
                            ? "text-amber-600"
                            : "text-slate-600"
                      }`}
                    >
                      {chantier.openReservesCount}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
