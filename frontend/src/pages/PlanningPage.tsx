import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { LoadingState } from "../components/common/LoadingState";
import { OccupationKpiCard } from "../components/planning/OccupationKpi";
import { PlanningCalendar } from "../components/planning/PlanningCalendar";
import { PlanningFilters } from "../components/planning/PlanningFilters";
import { SlotModal } from "../components/planning/SlotModal";
import { useAuth } from "../contexts/AuthContext";
import { useChantiersQuery } from "../hooks/useChantiers";
import {
  useCancelSlotMutation,
  useCreateSlotMutation,
  useOccupationKpiQuery,
  usePlanningSlotsQuery,
  useUpdateSlotMutation,
  useWorkersQuery,
} from "../hooks/usePlanning";
import type { CreateSlotPayload } from "../services/planningService";
import type { PlanningViewMode, ScheduleSlot, Worker } from "../types/domain";
import { extractPlanningApiError } from "../utils/planningErrors";
import {
  addDays,
  endOfMonth,
  formatWeekRange,
  startOfMonth,
  startOfWeek,
  toIsoRange,
} from "../utils/planningDates";

function mergeWorkersForDisplay(activeWorkers: Worker[], slots: ScheduleSlot[]): Worker[] {
  const byId = new Map(activeWorkers.map((worker) => [worker.id, worker]));
  for (const slot of slots) {
    if (!byId.has(slot.workerId)) {
      const [firstName, ...rest] = slot.workerName.split(" ");
      byId.set(slot.workerId, {
        id: slot.workerId,
        firstName: firstName ?? slot.workerName,
        lastName: rest.join(" ") || "—",
        fullName: slot.workerName,
        isActive: false,
      });
    }
  }
  return [...byId.values()].sort((a, b) => a.fullName.localeCompare(b.fullName, "fr"));
}

export function PlanningPage() {
  const { user } = useAuth();
  const canWrite = user?.role === "CONDUCTEUR_TRAVAUX";
  const showKpi =
    user?.role === "DIRECTION" || user?.role === "CONDUCTEUR_TRAVAUX";

  const [viewMode, setViewMode] = useState<PlanningViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [projectId, setProjectId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [draft, setDraft] = useState<{ workerId?: string; day?: Date }>({});

  const range = useMemo(() => {
    if (viewMode === "month") {
      return toIsoRange(startOfMonth(anchorDate), addDays(endOfMonth(anchorDate), 1));
    }
    const from = startOfWeek(anchorDate);
    return toIsoRange(from, addDays(from, 7));
  }, [anchorDate, viewMode]);

  const filters = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      projectId: projectId || undefined,
      workerId: workerId || undefined,
    }),
    [range, projectId, workerId],
  );

  const { data: slots = [], isLoading: slotsLoading } = usePlanningSlotsQuery(filters);
  const { data: workers = [], isLoading: workersLoading } = useWorkersQuery();
  const { data: chantiers = [] } = useChantiersQuery();
  const { data: kpi, isLoading: kpiLoading } = useOccupationKpiQuery(
    range.from,
    range.to,
    showKpi,
  );
  const createSlot = useCreateSlotMutation();
  const updateSlot = useUpdateSlotMutation();
  const cancelSlot = useCancelSlotMutation();

  const displayWorkers = useMemo(() => {
    const merged = mergeWorkersForDisplay(workers, slots);
    return workerId ? merged.filter((worker) => worker.id === workerId) : merged;
  }, [workers, slots, workerId]);

  const weekLabel = useMemo(() => {
    if (viewMode === "month") {
      return anchorDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }
    const from = startOfWeek(anchorDate);
    return formatWeekRange(from, addDays(from, 7));
  }, [anchorDate, viewMode]);

  const shiftPeriod = (delta: number) => {
    setAnchorDate((current) => {
      const next = new Date(current);
      if (viewMode === "month") {
        next.setMonth(next.getMonth() + delta);
      } else {
        next.setDate(next.getDate() + delta * 7);
      }
      return next;
    });
  };

  const openCreate = (worker?: string, day?: Date) => {
    setSelectedSlot(null);
    setModalError("");
    setDraft({ workerId: worker, day });
    setModalOpen(true);
  };

  const runMutation = async (action: () => Promise<unknown>) => {
    setModalError("");
    try {
      await action();
    } catch (err) {
      setModalError(extractPlanningApiError(err));
      throw err;
    }
  };

  const handleCreate = async (payload: CreateSlotPayload) => {
    await runMutation(() => createSlot.mutateAsync(payload));
  };

  const handleUpdate = async (id: string, payload: Partial<CreateSlotPayload>) => {
    await runMutation(() => updateSlot.mutateAsync({ id, payload }));
  };

  const handleCancel = async (id: string) => {
    await runMutation(() => cancelSlot.mutateAsync(id));
  };

  const isLoading = slotsLoading || workersLoading;

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Planning ouvriers</h1>
          <p className="text-sm text-muted">
            Affectations terrain — semaine et mois
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={() => openCreate()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            data-testid="planning-new-slot"
          >
            <Plus className="h-4 w-4" />
            Nouveau créneau
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
        <PlanningFilters
          chantiers={chantiers}
          workers={workers}
          projectId={projectId}
          workerId={workerId}
          onProjectChange={setProjectId}
          onWorkerChange={setWorkerId}
        />
      </div>

      {showKpi && (
        <OccupationKpiCard kpi={kpi} isLoading={kpiLoading} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftPeriod(-1)}
            className="rounded-lg border border-border p-2"
            aria-label="Période précédente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[160px] text-center text-sm font-medium capitalize">
            {weekLabel}
          </span>
          <button
            type="button"
            onClick={() => shiftPeriod(1)}
            className="rounded-lg border border-border p-2"
            aria-label="Période suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex rounded-lg border border-border p-1 text-sm">
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`rounded-md px-3 py-1 ${viewMode === "week" ? "bg-primary text-white" : ""}`}
          >
            Semaine
          </button>
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`rounded-md px-3 py-1 ${viewMode === "month" ? "bg-primary text-white" : ""}`}
          >
            Mois
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState label="Chargement du planning…" />
      ) : (
        <PlanningCalendar
          viewMode={viewMode}
          anchorDate={anchorDate}
          workers={displayWorkers}
          slots={slots}
          readOnly={!canWrite}
          onSlotClick={(slot) => {
            setSelectedSlot(slot);
            setModalError("");
            setModalOpen(true);
          }}
          onEmptyClick={(wId, day) => openCreate(wId, day)}
        />
      )}

      <SlotModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
        onUpdate={canWrite ? handleUpdate : undefined}
        onCancelSlot={canWrite ? handleCancel : undefined}
        workers={workers}
        chantiers={chantiers}
        slot={selectedSlot}
        readOnly={!canWrite}
        error={modalError}
        initial={
          selectedSlot
            ? undefined
            : {
                workerId: draft.workerId,
                projectId: projectId || undefined,
                startAt: draft.day
                  ? new Date(
                      draft.day.getFullYear(),
                      draft.day.getMonth(),
                      draft.day.getDate(),
                      8,
                    ).toISOString()
                  : undefined,
                endAt: draft.day
                  ? new Date(
                      draft.day.getFullYear(),
                      draft.day.getMonth(),
                      draft.day.getDate(),
                      12,
                    ).toISOString()
                  : undefined,
              }
        }
      />
    </div>
  );
}
