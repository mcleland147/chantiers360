import { History } from "lucide-react";
import type { HistoryEntry } from "../../types/domain";
import { EmptyState } from "../common/EmptyState";

interface HistoryTimelineProps {
  entries: HistoryEntry[];
}

export function HistoryTimeline({ entries }: HistoryTimelineProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900">
          Historique des actions
        </h3>
        <p className="text-xs text-muted">
          Traçabilité complète — consultation seule (RG-012)
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={History}
          title="Aucun historique"
          description="Aucune action n'a encore été enregistrée sur ce chantier."
        />
      ) : (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <ol className="relative space-y-0">
            {entries.map((entry, index) => (
              <li
                key={entry.id}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {index < entries.length - 1 && (
                  <div
                    className="absolute top-4 left-[7px] h-full w-0.5 bg-border"
                    aria-hidden
                  />
                )}
                <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-brand bg-white" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted">
                      {entry.date}
                    </span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs font-medium text-slate-900">
                      {entry.authorName}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {entry.action}
                  </p>
                  {(entry.oldValue || entry.newValue) && (
                    <div className="mt-2 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                      {entry.oldValue && (
                        <p className="text-muted">
                          <span className="font-medium text-slate-700">
                            Ancienne valeur :
                          </span>{" "}
                          {entry.oldValue}
                        </p>
                      )}
                      {entry.newValue && (
                        <p className="text-slate-700">
                          <span className="font-medium">Nouvelle valeur :</span>{" "}
                          {entry.newValue}
                        </p>
                      )}
                    </div>
                  )}
                  {entry.reason && (
                    <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <span className="font-medium">Motif :</span> {entry.reason}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
