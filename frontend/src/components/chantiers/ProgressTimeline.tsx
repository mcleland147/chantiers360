import { Plus, TrendingUp } from "lucide-react";
import type { ProgressUpdate } from "../../types/domain";
import { EmptyState } from "../common/EmptyState";

interface ProgressTimelineProps {
  updates: ProgressUpdate[];
  canAdd?: boolean;
  onAdd?: () => void;
}

export function ProgressTimeline({
  updates,
  canAdd = false,
  onAdd,
}: ProgressTimelineProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Journal d&apos;avancement
          </h3>
          <p className="text-xs text-muted">
            Mises à jour terrain — commentaire obligatoire (RG-006)
          </p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={15} />
            Ajouter une mise à jour
          </button>
        )}
      </div>

      {updates.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Aucune mise à jour"
          description="Le journal d'avancement de ce chantier est vide."
        />
      ) : (
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <ol className="relative space-y-0">
            {updates.map((update, index) => (
              <li
                key={update.id}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {index < updates.length - 1 && (
                  <div
                    className="absolute top-4 left-[7px] h-full w-0.5 bg-border"
                    aria-hidden
                  />
                )}
                <div className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2 border-accent bg-white" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted">
                      {update.date}
                    </span>
                    <span className="text-xs text-muted">·</span>
                    <span className="text-xs font-medium text-slate-900">
                      {update.authorName}
                    </span>
                    {update.percent !== undefined && (
                      <span className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-orange-700">
                        {update.percent} %
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                    {update.comment}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
