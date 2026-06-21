import { Search, X } from "lucide-react";
import type { ChantierStatus } from "../../types/domain";
import { CHANTIER_STATUSES } from "../../config/chantierStatuses";

export interface ChantiersFilterState {
  search: string;
  status: ChantierStatus | "";
  conductor: string;
}

interface ChantiersFiltersProps {
  filters: ChantiersFilterState;
  conductors: string[];
  onChange: (filters: ChantiersFilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export function ChantiersFilters({
  filters,
  conductors,
  onChange,
  totalCount,
  filteredCount,
}: ChantiersFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.status || filters.conductor;

  const clearFilters = () => {
    onChange({ search: "", status: "", conductor: "" });
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            placeholder="Rechercher par référence, nom, client…"
            value={filters.search}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
            className="w-full rounded-lg border border-border bg-white py-2 pr-4 pl-9 text-sm transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status: e.target.value as ChantierStatus | "",
              })
            }
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            {CHANTIER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filters.conductor}
            onChange={(e) =>
              onChange({ ...filters, conductor: e.target.value })
            }
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 focus:border-accent focus:ring-2 focus:ring-accent/25 focus:outline-none"
          >
            <option value="">Tous les conducteurs</option>
            {conductors.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={14} />
              Effacer
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-muted">
        {totalCount} chantier{totalCount > 1 ? "s" : ""} · {filteredCount}{" "}
        affiché{filteredCount > 1 ? "s" : ""}
      </p>
    </div>
  );
}
