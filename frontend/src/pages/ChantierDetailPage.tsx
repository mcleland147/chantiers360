import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AddPhotoModal } from "../components/chantiers/AddPhotoModal";
import { AddProgressModal } from "../components/chantiers/AddProgressModal";
import { AssignMemberModal } from "../components/chantiers/AssignMemberModal";
import { AssignmentsList } from "../components/chantiers/AssignmentsList";
import { ChangeStatusModal } from "../components/chantiers/ChangeStatusModal";
import { ChantierHeader } from "../components/chantiers/ChantierHeader";
import { ChantierInformationsTab } from "../components/chantiers/ChantierInformationsTab";
import { CreateReserveModal } from "../components/chantiers/CreateReserveModal";
import { HistoryTimeline } from "../components/chantiers/HistoryTimeline";
import { PhotoGallery } from "../components/chantiers/PhotoGallery";
import { ProgressTimeline } from "../components/chantiers/ProgressTimeline";
import { ReservesList } from "../components/chantiers/ReservesList";
import type { ChantierTabId } from "../components/chantiers/ChantierTabs";
import { ChantierTabs } from "../components/chantiers/ChantierTabs";
import { LoadingState } from "../components/common/LoadingState";
import { PagePlaceholder } from "../components/common/PagePlaceholder";
import { useAuth } from "../contexts/AuthContext";
import {
  useAssignableUsersQuery,
  useChantierAssignmentsQuery,
  useChantierPhotosQuery,
  useChantierProgressQuery,
  useChantierReservesQuery,
  useCreateAssignmentMutation,
  useCreatePhotoMutation,
  useCreateProgressMutation,
  useCreateReserveMutation,
  useTakeReserveChargeMutation,
  useValidateReserveLeveeMutation,
} from "../hooks/useChantierTabs";
import {
  useChangeChantierStatusMutation,
  useChantierHistoryQuery,
  useChantierQuery,
} from "../hooks/useChantiers";
import { extractApiErrorMessage } from "../utils/extractApiError";
import {
  canAddPhoto,
  canAddProgressUpdate,
  canAssignMember,
  canCreateReserve,
  canEditChantier,
  canTakeChargeReserve,
  canValidateReserveLevee,
} from "../utils/chantierPermissions";

const VALID_TABS: ChantierTabId[] = [
  "informations",
  "equipes",
  "avancement",
  "reserves",
  "photos",
  "historique",
];

function parseTab(value: string | null): ChantierTabId {
  if (value && VALID_TABS.includes(value as ChantierTabId)) {
    return value as ChantierTabId;
  }
  return "informations";
}

export function ChantierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const activeTab = parseTab(searchParams.get("tab"));

  const { data: chantier, isLoading, isError } = useChantierQuery(id);
  const { data: history = [], isLoading: historyLoading } =
    useChantierHistoryQuery(activeTab === "historique" ? id : undefined);
  const statusMutation = useChangeChantierStatusMutation(id ?? "");

  const { data: assignments = [], isLoading: assignmentsLoading } =
    useChantierAssignmentsQuery(id, activeTab === "equipes");
  const { data: progress = [], isLoading: progressLoading } =
    useChantierProgressQuery(id, activeTab === "avancement");
  const { data: reserves = [], isLoading: reservesLoading } =
    useChantierReservesQuery(id, activeTab === "reserves");
  const { data: photos = [], isLoading: photosLoading } = useChantierPhotosQuery(
    id,
    activeTab === "photos",
  );

  const { data: assignableUsers = [], isLoading: usersLoading } =
    useAssignableUsersQuery(assignModalOpen);

  const validateLeveeMutation = useValidateReserveLeveeMutation(id ?? "");
  const takeChargeMutation = useTakeReserveChargeMutation(id ?? "");
  const createAssignmentMutation = useCreateAssignmentMutation(id ?? "");
  const createProgressMutation = useCreateProgressMutation(id ?? "");
  const createReserveMutation = useCreateReserveMutation(id ?? "");
  const createPhotoMutation = useCreatePhotoMutation(id ?? "");

  const role = user?.role ?? "CONDUCTEUR_TRAVAUX";

  const handleTabChange = (tab: ChantierTabId) => {
    setSearchParams(tab === "informations" ? {} : { tab }, { replace: true });
  };

  if (isLoading) {
    return <LoadingState label="Chargement de la fiche chantier…" />;
  }

  if (isError || !chantier || !id) {
    return (
      <div className="p-5">
        <Link
          to="/chantiers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
        >
          <ArrowLeft size={14} />
          Retour aux chantiers
        </Link>
        <PagePlaceholder
          title="Chantier introuvable"
          description={`Aucun chantier ne correspond à l'identifiant « ${id ?? ""} ».`}
        />
      </div>
    );
  }

  const canChangeStatus = role === "CONDUCTEUR_TRAVAUX";

  const tabLoading =
    (activeTab === "equipes" && assignmentsLoading) ||
    (activeTab === "avancement" && progressLoading) ||
    (activeTab === "reserves" && reservesLoading) ||
    (activeTab === "photos" && photosLoading) ||
    (activeTab === "historique" && historyLoading);

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-border bg-white px-5 py-2">
        <Link
          to="/chantiers"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={13} />
          Retour aux chantiers
        </Link>
      </div>

      <ChantierHeader
        chantier={chantier}
        canEdit={canEditChantier(role)}
        canChangeStatus={canChangeStatus}
        onChangeStatus={() => setStatusModalOpen(true)}
      />

      <ChantierTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        reserveCount={chantier.openReservesCount}
      />

      <div className="flex-1 p-5">
        {tabLoading ? (
          <LoadingState label="Chargement de l'onglet…" />
        ) : (
          <>
            {activeTab === "informations" && (
              <ChantierInformationsTab chantier={chantier} />
            )}
            {activeTab === "equipes" && (
              <AssignmentsList
                assignments={assignments}
                canAssign={canAssignMember(role)}
                onAssign={() => setAssignModalOpen(true)}
              />
            )}
            {activeTab === "avancement" && (
              <ProgressTimeline
                updates={progress}
                canAdd={canAddProgressUpdate(role)}
                onAdd={() => setProgressModalOpen(true)}
              />
            )}
            {activeTab === "reserves" && (
              <ReservesList
                reserves={reserves}
                canCreate={canCreateReserve(role)}
                canTakeCharge={canTakeChargeReserve(role)}
                canValidateLevee={canValidateReserveLevee(role)}
                onCreate={() => setReserveModalOpen(true)}
                onTakeCharge={(reserveId) =>
                  takeChargeMutation.mutate(reserveId)
                }
                onValidateLevee={(reserveId) =>
                  validateLeveeMutation.mutate(reserveId)
                }
              />
            )}
            {activeTab === "photos" && (
              <PhotoGallery
                photos={photos}
                canAdd={canAddPhoto(role)}
                onAdd={() => setPhotoModalOpen(true)}
              />
            )}
            {activeTab === "historique" && (
              <HistoryTimeline entries={history} />
            )}
          </>
        )}
      </div>

      <ChangeStatusModal
        currentStatus={chantier.status}
        openReservesCount={chantier.openReservesCount}
        isOpen={statusModalOpen}
        isSubmitting={statusMutation.isPending}
        error={
          statusMutation.isError
            ? extractApiErrorMessage(statusMutation.error, "Impossible de changer le statut.")
            : null
        }
        onClose={() => setStatusModalOpen(false)}
        onSubmit={(status, reason) =>
          statusMutation.mutate(
            { status, reason },
            { onSuccess: () => setStatusModalOpen(false) },
          )
        }
      />

      <AssignMemberModal
        isOpen={assignModalOpen}
        users={assignableUsers}
        usersLoading={usersLoading}
        isSubmitting={createAssignmentMutation.isPending}
        error={
          createAssignmentMutation.isError
            ? extractApiErrorMessage(createAssignmentMutation.error)
            : null
        }
        onClose={() => setAssignModalOpen(false)}
        onSubmit={(payload) =>
          createAssignmentMutation.mutate(payload, {
            onSuccess: () => setAssignModalOpen(false),
          })
        }
      />

      <AddProgressModal
        isOpen={progressModalOpen}
        isSubmitting={createProgressMutation.isPending}
        error={
          createProgressMutation.isError
            ? extractApiErrorMessage(createProgressMutation.error)
            : null
        }
        onClose={() => setProgressModalOpen(false)}
        onSubmit={(payload) =>
          createProgressMutation.mutate(payload, {
            onSuccess: () => setProgressModalOpen(false),
          })
        }
      />

      <CreateReserveModal
        isOpen={reserveModalOpen}
        isSubmitting={createReserveMutation.isPending}
        error={
          createReserveMutation.isError
            ? extractApiErrorMessage(createReserveMutation.error)
            : null
        }
        onClose={() => setReserveModalOpen(false)}
        onSubmit={(payload) =>
          createReserveMutation.mutate(payload, {
            onSuccess: () => setReserveModalOpen(false),
          })
        }
      />

      <AddPhotoModal
        isOpen={photoModalOpen}
        isSubmitting={createPhotoMutation.isPending}
        error={
          createPhotoMutation.isError
            ? extractApiErrorMessage(createPhotoMutation.error)
            : null
        }
        onClose={() => setPhotoModalOpen(false)}
        onSubmit={(payload) =>
          createPhotoMutation.mutate(payload, {
            onSuccess: () => setPhotoModalOpen(false),
          })
        }
      />
    </div>
  );
}

export function getChantierDetailHandle(id: string) {
  return {
    title: `Chantier ${id}`,
    subtitle: "Fiche chantier",
  };
}
