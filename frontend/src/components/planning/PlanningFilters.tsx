import type { Chantier } from "../../types/domain";
import type { Worker } from "../../types/domain";

interface PlanningFiltersProps {
  chantiers: Chantier[];
  workers: Worker[];
  projectId: string;
  workerId: string;
  onProjectChange: (value: string) => void;
  onWorkerChange: (value: string) => void;
}

export function PlanningFilters({
  chantiers,
  workers,
  projectId,
  workerId,
  onProjectChange,
  onWorkerChange,
}: PlanningFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium text-muted">
          Chantier
        </span>
        <select
          value={projectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          data-testid="planning-filter-chantier"
        >
          <option value="">Tous</option>
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.reference} — {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-medium text-muted">
          Ouvrier
        </span>
        <select
          value={workerId}
          onChange={(e) => onWorkerChange(e.target.value)}
          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          data-testid="planning-filter-worker"
        >
          <option value="">Tous</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.fullName}
              {w.trade ? ` (${w.trade})` : ""}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
