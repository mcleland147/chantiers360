import { Building2, Calendar, MapPin, User } from "lucide-react";
import type { ChantierDetail } from "../../types/domain";

interface ChantierInfoCardProps {
  chantier: ChantierDetail;
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon size={14} className="text-muted" />
      </div>
      <div className="min-w-0">
        <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
      </div>
    </div>
  );
}

export function ChantierInfoCard({ chantier }: ChantierInfoCardProps) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-slate-900">
        Informations générales
      </h3>
      <p className="mb-4 text-xs text-muted">
        Données d&apos;identification et de pilotage du chantier
      </p>
      <dl className="divide-y divide-border">
        <InfoRow icon={Building2} label="Référence" value={chantier.reference} />
        <InfoRow icon={Building2} label="Nom du chantier" value={chantier.name} />
        <InfoRow icon={User} label="Client" value={chantier.client} />
        <InfoRow icon={MapPin} label="Adresse" value={chantier.address} />
        <InfoRow
          icon={User}
          label="Conducteur de travaux"
          value={chantier.conductorName}
        />
        <InfoRow icon={Calendar} label="Date de début" value={chantier.startDate} />
        <InfoRow
          icon={Calendar}
          label="Date de fin prévue"
          value={chantier.expectedEndDate}
        />
        {chantier.receptionDate && (
          <InfoRow
            icon={Calendar}
            label="Date de réception"
            value={chantier.receptionDate}
          />
        )}
      </dl>
      {chantier.description && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Description
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
            {chantier.description}
          </p>
        </div>
      )}
    </div>
  );
}
