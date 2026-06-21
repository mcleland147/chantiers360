import {
  Calendar,
  Euro,
  MapPin,
  Pencil,
  RefreshCw,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { ChantierDetail } from "../../types/domain";
import { isChantierLateFromEntity } from "../../utils/chantierRules";
import {
  ChantierStatusBadge,
  LateBadge,
} from "../badges/StatusBadge";

interface ChantierHeaderProps {
  chantier: ChantierDetail;
  canEdit?: boolean;
  canChangeStatus?: boolean;
  onChangeStatus?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ChantierHeader({
  chantier,
  canEdit = true,
  canChangeStatus = false,
  onChangeStatus,
}: ChantierHeaderProps) {
  const isLate = isChantierLateFromEntity(chantier);
  const progress = chantier.progressPercent ?? 0;

  return (
    <div className="border-b border-border bg-white px-5 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted">
              {chantier.reference}
            </span>
            <ChantierStatusBadge status={chantier.status} />
            {isLate && <LateBadge />}
          </div>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            {chantier.name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <User size={13} />
              {chantier.client}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} />
              {chantier.address}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={13} />
              {chantier.conductorName}
            </span>
          </div>
        </div>
        {(canEdit || canChangeStatus) && (
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Link
                to={`/chantiers/${chantier.id}/modifier`}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
              >
                <Pencil size={14} />
                Modifier
              </Link>
            )}
            {canChangeStatus && (
              <button
                type="button"
                onClick={onChangeStatus}
                className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
              >
                <RefreshCw size={14} />
                Changer statut
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-slate-50/50 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <Calendar size={11} />
            Début
          </div>
          <p className="mt-0.5 font-mono text-sm text-slate-900">
            {chantier.startDate}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-slate-50/50 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <Calendar size={11} />
            Fin prévue
          </div>
          <p className="mt-0.5 font-mono text-sm text-slate-900">
            {chantier.expectedEndDate}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-slate-50/50 px-3 py-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <Euro size={11} />
            Budget
          </div>
          <p className="mt-0.5 font-mono text-sm text-slate-900">
            {formatCurrency(chantier.budget)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-slate-50/50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Avancement
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-xs font-medium text-slate-700">
              {progress}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
