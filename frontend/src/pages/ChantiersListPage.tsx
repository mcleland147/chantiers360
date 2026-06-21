import { FolderKanban, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChantiersFilters } from "../components/chantiers/ChantiersFilters";
import type { ChantiersFilterState } from "../components/chantiers/ChantiersFilters";
import { ChantiersTable } from "../components/chantiers/ChantiersTable";
import { EmptyState } from "../components/common/EmptyState";
import { LoadingState } from "../components/common/LoadingState";
import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../contexts/AuthContext";
import { useChantiersQuery } from "../hooks/useChantiers";
import { isChantierLateFromEntity } from "../utils/chantierRules";

function canCreateChantier(role: string): boolean {
  return role === "CONDUCTEUR_TRAVAUX" || role === "ASSISTANTE_ADMINISTRATIVE";
}

export function ChantiersListPage() {
  const { user } = useAuth();
  const { data: chantiers = [], isLoading, isError } = useChantiersQuery();
  const [filters, setFilters] = useState<ChantiersFilterState>({
    search: "",
    status: "",
    conductor: "",
  });

  const filteredChantiers = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return chantiers.filter((c) => {
      if (filters.status && c.status !== filters.status) return false;
      if (filters.conductor && c.conductorName !== filters.conductor) return false;
      if (!q) return true;
      return (
        c.reference.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    });
  }, [chantiers, filters]);

  const lateCount = filteredChantiers.filter(isChantierLateFromEntity).length;
  const conductorNames = useMemo(() => {
    return [...new Set(chantiers.map((c) => c.conductorName))].sort();
  }, [chantiers]);

  if (isLoading) {
    return <LoadingState label="Chargement des chantiers…" />;
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Chantiers"
        description={
          isError
            ? "Erreur de chargement — vérifiez que l'API est démarrée"
            : `${chantiers.length} chantiers · ${lateCount} en retard`
        }
        actions={
          user && canCreateChantier(user.role) ? (
            <Link
              to="/chantiers/nouveau"
              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover"
            >
              <Plus size={15} />
              Nouveau chantier
            </Link>
          ) : undefined
        }
      />

      <div className="flex-1 space-y-4 p-5">
        <ChantiersFilters
          filters={filters}
          onChange={setFilters}
          conductors={conductorNames}
          totalCount={chantiers.length}
          filteredCount={filteredChantiers.length}
        />

        {filteredChantiers.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Aucun chantier trouvé"
            description="Ajustez vos filtres ou créez un nouveau chantier."
          />
        ) : (
          <ChantiersTable chantiers={filteredChantiers} />
        )}
      </div>
    </div>
  );
}
