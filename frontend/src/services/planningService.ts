import type {
  OccupationKpi,
  ScheduleSlot,
  ScheduleStatus,
  Worker,
} from "../types/domain";
import { apiClient } from "./apiClient";

export interface PlanningFilters {
  from: string;
  to: string;
  projectId?: string;
  workerId?: string;
}

export interface CreateSlotPayload {
  workerId: string;
  projectId: string;
  startAt: string;
  endAt: string;
  status?: ScheduleStatus;
  notes?: string;
}

export async function fetchWorkers(includeInactive = false): Promise<Worker[]> {
  const { data } = await apiClient.get<Worker[]>("/workers", {
    params: includeInactive ? { includeInactive: "true" } : undefined,
  });
  return data;
}

export async function createWorker(payload: {
  firstName: string;
  lastName: string;
  trade?: string;
}): Promise<Worker> {
  const { data } = await apiClient.post<Worker>("/workers", payload);
  return data;
}

export async function updateWorker(
  id: string,
  payload: Partial<{
    firstName: string;
    lastName: string;
    trade: string;
    isActive: boolean;
  }>,
): Promise<Worker> {
  const { data } = await apiClient.patch<Worker>(`/workers/${id}`, payload);
  return data;
}

export async function fetchPlanningSlots(
  filters: PlanningFilters,
): Promise<ScheduleSlot[]> {
  const { data } = await apiClient.get<ScheduleSlot[]>("/planning", {
    params: filters,
  });
  return data;
}

export async function createPlanningSlot(
  payload: CreateSlotPayload,
): Promise<ScheduleSlot> {
  const { data } = await apiClient.post<ScheduleSlot>("/planning/slots", payload);
  return data;
}

export async function updatePlanningSlot(
  id: string,
  payload: Partial<CreateSlotPayload & { status: ScheduleStatus }>,
): Promise<ScheduleSlot> {
  const { data } = await apiClient.put<ScheduleSlot>(
    `/planning/slots/${id}`,
    payload,
  );
  return data;
}

export async function cancelPlanningSlot(id: string): Promise<ScheduleSlot> {
  const { data } = await apiClient.delete<ScheduleSlot>(`/planning/slots/${id}`);
  return data;
}

export async function fetchOccupationKpi(
  from: string,
  to: string,
): Promise<OccupationKpi> {
  const { data } = await apiClient.get<OccupationKpi>(
    "/planning/kpi/occupation",
    { params: { from, to } },
  );
  return data;
}
