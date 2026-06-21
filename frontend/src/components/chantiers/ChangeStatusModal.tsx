import { useMemo, useState } from "react";
import { CHANTIER_STATUSES } from "../../config/chantierStatuses";
import type { ChantierStatus } from "../../types/domain";

interface ChangeStatusModalProps {
  currentStatus: ChantierStatus;
  openReservesCount?: number;
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (status: ChantierStatus, reason?: string) => void;
}

function getAdjacentStatuses(
  current: ChantierStatus,
): { prev?: ChantierStatus; next?: ChantierStatus } {
  const index = CHANTIER_STATUSES.indexOf(current);
  return {
    prev: index > 0 ? CHANTIER_STATUSES[index - 1] : undefined,
    next:
      index < CHANTIER_STATUSES.length - 1
        ? CHANTIER_STATUSES[index + 1]
        : undefined,
  };
}

export function ChangeStatusModal({
  currentStatus,
  openReservesCount = 0,
  isOpen,
  isSubmitting = false,
  error,
  onClose,
  onSubmit,
}: ChangeStatusModalProps) {
  const { prev, next } = useMemo(
    () => getAdjacentStatuses(currentStatus),
    [currentStatus],
  );
  const [targetStatus, setTargetStatus] = useState<ChantierStatus | "">("");
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  const options = [prev, next].filter(Boolean) as ChantierStatus[];
  const isBackward =
    targetStatus !== "" &&
    CHANTIER_STATUSES.indexOf(targetStatus) <
      CHANTIER_STATUSES.indexOf(currentStatus);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!targetStatus) return;
    onSubmit(targetStatus, isBackward ? reason : undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid="change-status-modal"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-white p-5 shadow-lg">
        <h3 className="text-sm font-semibold text-slate-900">
          Changer le statut du chantier
        </h3>
        <p className="mt-1 text-xs text-muted">
          Statut actuel : <strong>{currentStatus}</strong>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Nouveau statut</span>
            <select
              required
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value as ChantierStatus)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Sélectionner…</option>
              {options.map((status) => {
                const disabled =
                  status === "Clôture" && openReservesCount > 0;
                return (
                  <option key={status} value={status} disabled={disabled}>
                    {status}
                    {disabled ? " (réserves ouvertes)" : ""}
                  </option>
                );
              })}
            </select>
          </label>

          {targetStatus === "Clôture" && openReservesCount > 0 && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Impossible de clôturer : {openReservesCount} réserve
              {openReservesCount > 1 ? "s" : ""} ouverte
              {openReservesCount > 1 ? "s" : ""} ou en cours (REC-013). Levez
              toutes les réserves avant clôture.
            </p>
          )}

          {isBackward && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium">
                Motif du retour arrière (obligatoire)
              </span>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                placeholder="RG-DATA-004 — précisez la raison"
              />
            </label>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !targetStatus ||
                (targetStatus === "Clôture" && openReservesCount > 0)
              }
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
            >
              {isSubmitting ? "Mise à jour…" : "Confirmer"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
