import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateSlotPayload, PlanningFilters } from "../services/planningService";
import {
  cancelPlanningSlot,
  createPlanningSlot,
  createWorker,
  fetchOccupationKpi,
  fetchPlanningSlots,
  fetchWorkers,
  updatePlanningSlot,
  updateWorker,
} from "../services/planningService";

export const planningKeys = {
  slots: (filters: PlanningFilters) => ["planning", "slots", filters] as const,
  workers: ["planning", "workers"] as const,
  kpi: (from: string, to: string) => ["planning", "kpi", from, to] as const,
};

export function useWorkersQuery() {
  return useQuery({
    queryKey: planningKeys.workers,
    queryFn: () => fetchWorkers(),
  });
}

export function usePlanningSlotsQuery(filters: PlanningFilters) {
  return useQuery({
    queryKey: planningKeys.slots(filters),
    queryFn: () => fetchPlanningSlots(filters),
  });
}

export function useOccupationKpiQuery(from: string, to: string, enabled = true) {
  return useQuery({
    queryKey: planningKeys.kpi(from, to),
    queryFn: () => fetchOccupationKpi(from, to),
    enabled: enabled && Boolean(from && to),
  });
}

export function useCreateSlotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSlotPayload) => createPlanningSlot(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning"] });
    },
  });
}

export function useUpdateSlotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateSlotPayload & { status: string }>;
    }) => updatePlanningSlot(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning"] });
    },
  });
}

export function useCancelSlotMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelPlanningSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["planning"] });
    },
  });
}

export function useCreateWorkerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWorker,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planningKeys.workers });
    },
  });
}

export function useUpdateWorkerMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateWorker>[1];
    }) => updateWorker(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: planningKeys.workers });
    },
  });
}
