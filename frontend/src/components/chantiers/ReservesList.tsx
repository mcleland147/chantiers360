import { AlertTriangle, CheckCircle, Plus, UserCheck } from "lucide-react";
import type { ChantierReserve } from "../../types/domain";
import {
  PriorityBadge,
  ReserveStatusBadge,
} from "../badges/StatusBadge";
import { EmptyState } from "../common/EmptyState";

interface ReservesListProps {
  reserves: ChantierReserve[];
  canCreate?: boolean;
  canTakeCharge?: boolean;
  canValidateLevee?: boolean;
  showChantier?: boolean;
  onCreate?: () => void;
  onTakeCharge?: (reserveId: string) => void;
  onValidateLevee?: (reserveId: string) => void;
}

export function ReservesList({
  reserves,
  canCreate = false,
  canTakeCharge = false,
  canValidateLevee = false,
  showChantier = false,
  onCreate,
  onTakeCharge,
  onValidateLevee,
}: ReservesListProps) {
  const openCount = reserves.filter((r) => r.status !== "Levée").length;
  const showActions = canTakeCharge || canValidateLevee;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Réserves</h3>
          <p className="text-xs text-muted">
            {openCount} réserve{openCount > 1 ? "s" : ""} ouverte
            {openCount > 1 ? "s" : ""} ou en cours
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={15} />
            Nouvelle réserve
          </button>
        )}
      </div>

      {reserves.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Aucune réserve"
          description="Aucune réserve n'a été signalée."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/80">
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Référence
                  </th>
                  {showChantier && (
                    <th className="px-4 py-3 text-xs font-semibold text-muted">
                      Chantier
                    </th>
                  )}
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Titre
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Priorité
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Responsable
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Créée le
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Prise en charge
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted">
                    Levée le
                  </th>
                  {showActions && (
                    <th className="px-4 py-3 text-xs font-semibold text-muted">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reserves.map((reserve) => (
                  <tr
                    key={reserve.id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {reserve.reference}
                    </td>
                    {showChantier && (
                      <td className="px-4 py-3">
                        <div className="text-xs font-medium text-slate-900">
                          {reserve.chantierName}
                        </div>
                        <div className="font-mono text-[11px] text-muted">
                          {reserve.chantierReference}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {reserve.title}
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={reserve.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <ReserveStatusBadge status={reserve.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {reserve.assigneeName}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {reserve.createdAt}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {reserve.takenAt ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {reserve.closedAt ?? "—"}
                    </td>
                    {showActions && (
                      <td className="px-4 py-3">
                        {canTakeCharge && reserve.status === "Ouverte" && (
                          <button
                            type="button"
                            onClick={() => onTakeCharge?.(reserve.id)}
                            className="mb-1 flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                          >
                            <UserCheck size={12} />
                            Prendre en charge
                          </button>
                        )}
                        {canValidateLevee && reserve.status === "En cours" && (
                          <button
                            type="button"
                            onClick={() => onValidateLevee?.(reserve.id)}
                            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
                          >
                            <CheckCircle size={12} />
                            Valider la levée
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
