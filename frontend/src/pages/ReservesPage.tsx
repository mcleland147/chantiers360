import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ReservesList } from "../components/chantiers/ReservesList";
import { LoadingState } from "../components/common/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { useChantiersQuery } from "../hooks/useChantiers";
import { invalidateGlobalReserves, useGlobalReservesQuery } from "../hooks/useGlobalTabs";
import { takeReserveCharge, validateReserveLevee } from "../services/chantierTabsService";
import type { ReservePriority, ReserveStatus } from "../types/domain";
import {
  canTakeChargeReserve,
  canValidateReserveLevee,
} from "../utils/chantierPermissions";

const STATUSES: ReserveStatus[] = ["Ouverte", "En cours", "Levée"];
const PRIORITIES: ReservePriority[] = ["Faible", "Moyenne", "Haute", "Critique"];

export function ReservesPage() {
  const { user } = useAuth();
  const role = user?.role ?? "CONDUCTEUR_TRAVAUX";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReserveStatus | "">("");
  const [priority, setPriority] = useState<ReservePriority | "">("");
  const [chantierId, setChantierId] = useState("");

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status || undefined,
      priority: priority || undefined,
      chantierId: chantierId || undefined,
    }),
    [search, status, priority, chantierId],
  );

  const { data: reserves = [], isLoading } = useGlobalReservesQuery(filters);
  const { data: chantiers = [] } = useChantiersQuery();
  const queryClient = useQueryClient();

  const takeMutation = useMutation({
    mutationFn: ({ chantierId, reserveId }: { chantierId: string; reserveId: string }) =>
      takeReserveCharge(chantierId, reserveId),
    onSuccess: () => invalidateGlobalReserves(queryClient),
  });

  const leveeMutation = useMutation({
    mutationFn: ({ chantierId, reserveId }: { chantierId: string; reserveId: string }) =>
      validateReserveLevee(chantierId, reserveId),
    onSuccess: () => invalidateGlobalReserves(queryClient),
  });

  return (
    <div className="space-y-5 p-5">
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Recherche
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Titre, description…"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Statut
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReserveStatus | "")}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Priorité
            </span>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as ReservePriority | "")
              }
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Toutes</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">
              Chantier
            </span>
            <select
              value={chantierId}
              onChange={(e) => setChantierId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm"
            >
              <option value="">Tous</option>
              {chantiers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.reference} — {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Chargement des réserves…" />
      ) : (
        <ReservesList
          reserves={reserves.map((r) => ({
            ...r,
            chantierId: r.chantierId,
          }))}
          showChantier
          canTakeCharge={canTakeChargeReserve(role)}
          canValidateLevee={canValidateReserveLevee(role)}
          onTakeCharge={(reserveId) => {
            const reserve = reserves.find((r) => r.id === reserveId);
            if (reserve) {
              takeMutation.mutate({
                chantierId: reserve.chantierId,
                reserveId,
              });
            }
          }}
          onValidateLevee={(reserveId) => {
            const reserve = reserves.find((r) => r.id === reserveId);
            if (reserve) {
              leveeMutation.mutate({
                chantierId: reserve.chantierId,
                reserveId,
              });
            }
          }}
        />
      )}

      <p className="text-xs text-muted">
        Cliquez sur une réserve pour agir ou ouvrez la{" "}
        <Link to="/chantiers" className="text-accent hover:underline">
          fiche chantier
        </Link>
        .
      </p>
    </div>
  );
}

export const reservesHandle = {
  title: "Réserves",
  subtitle: "Suivi des non-conformités et anomalies",
};
