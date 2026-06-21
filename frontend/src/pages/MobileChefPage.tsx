import { Camera, ClipboardList, FolderKanban, TrendingUp } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AddPhotoModal } from "../components/chantiers/AddPhotoModal";
import { AddProgressModal } from "../components/chantiers/AddProgressModal";
import { CreateReserveModal } from "../components/chantiers/CreateReserveModal";
import { ReservesList } from "../components/chantiers/ReservesList";
import { LoadingState } from "../components/common/LoadingState";
import {
  useAssignedChantiersQuery,
} from "../hooks/useGlobalTabs";
import {
  useChantierReservesQuery,
  useUploadPhotosMutation,
  useCreateProgressMutation,
  useCreateReserveMutation,
  useTakeReserveChargeMutation,
} from "../hooks/useChantierTabs";
import { extractApiErrorMessage } from "../utils/extractApiError";
import {
  canAddPhoto,
  canAddProgressUpdate,
  canCreateReserve,
} from "../utils/chantierPermissions";

export function MobileChefPage() {
  const { data: chantiers = [], isLoading } = useAssignedChantiersQuery();
  const [selectedId, setSelectedId] = useState<string>("");
  const activeId = selectedId || chantiers[0]?.id || "";

  const { data: reserves = [], isLoading: reservesLoading } =
    useChantierReservesQuery(activeId, Boolean(activeId));

  const [progressOpen, setProgressOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);

  const progressMutation = useCreateProgressMutation(activeId);
  const photoMutation = useUploadPhotosMutation(activeId);
  const reserveMutation = useCreateReserveMutation(activeId);
  const takeChargeMutation = useTakeReserveChargeMutation(activeId);

  if (isLoading) {
    return <LoadingState label="Chargement de vos chantiers…" />;
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4 pb-24">
      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Mes chantiers</h2>
        <p className="mt-1 text-xs text-muted">
          {chantiers.length} chantier{chantiers.length > 1 ? "s" : ""} affecté
          {chantiers.length > 1 ? "s" : ""}
        </p>
        {chantiers.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Aucun chantier affecté pour le moment.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {chantiers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  activeId === c.id
                    ? "border-accent bg-accent/5"
                    : "border-border hover:bg-slate-50"
                }`}
              >
                <div className="font-medium text-slate-900">{c.name}</div>
                <div className="text-xs text-muted">
                  {c.reference} · {c.status}
                  {c.openReservesCount > 0 &&
                    ` · ${c.openReservesCount} réserve(s)`}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {activeId && (
        <>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={!canAddProgressUpdate("CHEF_CHANTIER")}
              onClick={() => setProgressOpen(true)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-3 text-xs font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <TrendingUp size={20} className="text-accent" />
              Avancement
            </button>
            <button
              type="button"
              disabled={!canAddPhoto("CHEF_CHANTIER")}
              onClick={() => setPhotoOpen(true)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-3 text-xs font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Camera size={20} className="text-accent" />
              Photo
            </button>
            <button
              type="button"
              disabled={!canCreateReserve("CHEF_CHANTIER")}
              onClick={() => setReserveOpen(true)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-white p-3 text-xs font-medium shadow-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <ClipboardList size={20} className="text-accent" />
              Réserve
            </button>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Réserves du chantier
              </h3>
              <Link
                to={`/chantiers/${activeId}?tab=reserves`}
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <FolderKanban size={12} />
                Fiche complète
              </Link>
            </div>
            {reservesLoading ? (
              <LoadingState label="Chargement des réserves…" />
            ) : (
              <ReservesList
                reserves={reserves}
                canTakeCharge
                onTakeCharge={(reserveId) =>
                  takeChargeMutation.mutate(reserveId)
                }
              />
            )}
          </div>
        </>
      )}

      <AddProgressModal
        isOpen={progressOpen}
        isSubmitting={progressMutation.isPending}
        error={
          progressMutation.isError
            ? extractApiErrorMessage(progressMutation.error)
            : null
        }
        onClose={() => setProgressOpen(false)}
        onSubmit={(payload) =>
          progressMutation.mutate(payload, {
            onSuccess: () => setProgressOpen(false),
          })
        }
      />

      <AddPhotoModal
        isOpen={photoOpen}
        isSubmitting={photoMutation.isPending}
        error={
          photoMutation.isError
            ? extractApiErrorMessage(photoMutation.error)
            : null
        }
        onClose={() => setPhotoOpen(false)}
        onSubmit={(payload) =>
          photoMutation.mutate(payload, {
            onSuccess: () => setPhotoOpen(false),
          })
        }
      />

      <CreateReserveModal
        isOpen={reserveOpen}
        isSubmitting={reserveMutation.isPending}
        error={
          reserveMutation.isError
            ? extractApiErrorMessage(reserveMutation.error)
            : null
        }
        onClose={() => setReserveOpen(false)}
        onSubmit={(payload) =>
          reserveMutation.mutate(payload, {
            onSuccess: () => setReserveOpen(false),
          })
        }
      />
    </div>
  );
}

export const mobileChefHandle = {
  title: "Vue mobile",
  subtitle: "Interface optimisée pour le terrain",
};
