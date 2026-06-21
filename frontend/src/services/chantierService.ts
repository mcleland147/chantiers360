import type { Chantier, ChantierDetail, ChantierStatus, HistoryEntry } from "../types/domain";
import { apiClient } from "./apiClient";

export interface CreateChantierPayload {
  reference: string;
  name: string;
  client: string;
  address: string;
  conductorId: string;
  startDate: string;
  expectedEndDate: string;
  budget?: number;
}

export interface UpdateChantierPayload {
  name?: string;
  client?: string;
  address?: string;
  conductorId?: string;
  startDate?: string;
  expectedEndDate?: string;
  budget?: number;
}

export interface ChangeStatusPayload {
  status: ChantierStatus;
  reason?: string;
}

function toChantierDetail(data: ChantierDetail): ChantierDetail {
  return {
    ...data,
    description: data.description ?? "",
    budgetSpent: data.budgetSpent ?? 0,
  };
}

export async function fetchChantiers(): Promise<Chantier[]> {
  const { data } = await apiClient.get<Chantier[]>("/chantiers");
  return data;
}

export async function fetchChantier(id: string): Promise<ChantierDetail> {
  const { data } = await apiClient.get<ChantierDetail>(`/chantiers/${id}`);
  return toChantierDetail(data);
}

export async function createChantier(
  payload: CreateChantierPayload,
): Promise<ChantierDetail> {
  const { data } = await apiClient.post<ChantierDetail>("/chantiers", payload);
  return toChantierDetail(data);
}

export async function updateChantier(
  id: string,
  payload: UpdateChantierPayload,
): Promise<ChantierDetail> {
  const { data } = await apiClient.patch<ChantierDetail>(
    `/chantiers/${id}`,
    payload,
  );
  return toChantierDetail(data);
}

export async function changeChantierStatus(
  id: string,
  payload: ChangeStatusPayload,
): Promise<ChantierDetail> {
  const { data } = await apiClient.patch<ChantierDetail>(
    `/chantiers/${id}/status`,
    payload,
  );
  return toChantierDetail(data);
}

export async function fetchChantierHistory(id: string): Promise<HistoryEntry[]> {
  const { data } = await apiClient.get<HistoryEntry[]>(
    `/chantiers/${id}/history`,
  );
  return data.map((entry) => ({
    ...entry,
    chantierId: id,
  }));
}
