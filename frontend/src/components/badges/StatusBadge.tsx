import type { ChantierStatus, ReservePriority, ReserveStatus } from "../../types/domain";
import { classNames } from "../../utils/classNames";

const chantierStatusStyles: Record<ChantierStatus, string> = {
  Préparation: "bg-slate-100 text-slate-600 border-slate-200",
  Planification: "bg-blue-100 text-blue-700 border-blue-200",
  Démarrage: "bg-teal-100 text-teal-700 border-teal-200",
  Réalisation: "bg-orange-100 text-orange-700 border-orange-200",
  Réception: "bg-violet-100 text-violet-700 border-violet-200",
  Clôture: "bg-gray-100 text-gray-500 border-gray-200",
};

const reserveStatusStyles: Record<ReserveStatus, string> = {
  Ouverte: "bg-slate-100 text-slate-600 border-slate-200",
  "En cours": "bg-blue-100 text-blue-700 border-blue-200",
  Levée: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const priorityStyles: Record<ReservePriority, string> = {
  Faible: "bg-green-100 text-green-700 border-green-200",
  Moyenne: "bg-amber-100 text-amber-700 border-amber-200",
  Haute: "bg-red-100 text-red-700 border-red-200",
  Critique: "bg-red-200 text-red-800 border-red-300",
};

interface BadgeProps {
  label: string;
  className?: string;
}

function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function ChantierStatusBadge({ status }: { status: ChantierStatus }) {
  return <Badge label={status} className={chantierStatusStyles[status]} />;
}

export function LateBadge() {
  return (
    <Badge
      label="En retard"
      className="bg-red-100 text-red-700 border-red-200"
    />
  );
}

export function ReserveStatusBadge({ status }: { status: ReserveStatus }) {
  return <Badge label={status} className={reserveStatusStyles[status]} />;
}

export function PriorityBadge({ priority }: { priority: ReservePriority }) {
  return <Badge label={priority} className={priorityStyles[priority]} />;
}
