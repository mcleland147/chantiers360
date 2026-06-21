import type { ConductorRow } from "../../../types/directionDashboard";

interface ConductorDistributionTableProps {
  rows: ConductorRow[];
}

export function ConductorDistributionTable({
  rows,
}: ConductorDistributionTableProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-border bg-white shadow-sm"
      data-testid="conductor-distribution-table"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Répartition par conducteur
        </h3>
        <p className="text-xs text-muted">Charge et indicateurs par pilote</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50/80">
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Conducteur
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Chantiers
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                En retard
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-muted">
                Réserves ouvertes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={row.conductorName}
                className="transition-colors hover:bg-slate-50/80"
              >
                <td className="px-4 py-3 font-medium text-slate-900">
                  {row.conductorName}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {row.chantierCount}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      row.lateCount > 0
                        ? "font-mono text-xs font-semibold text-red-600"
                        : "font-mono text-xs text-muted"
                    }
                  >
                    {row.lateCount}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-700">
                  {row.openReservesCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
