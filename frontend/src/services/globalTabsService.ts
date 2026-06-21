import type { ChantierPhoto, ChantierReserve, ReservePriority, ReserveStatus } from "../types/domain";
import type { Chantier } from "../types/domain";
import { apiClient } from "./apiClient";

export interface GlobalReserveFilters {
  search?: string;
  status?: ReserveStatus;
  priority?: ReservePriority;
  chantierId?: string;
  assigneeId?: string;
}

export interface GlobalPhotoFilters {
  chantierId?: string;
  category?: ChantierPhoto["category"];
  authorId?: string;
}

export async function fetchGlobalReserves(
  filters: GlobalReserveFilters = {},
): Promise<ChantierReserve[]> {
  const { data } = await apiClient.get<ChantierReserve[]>("/reserves", {
    params: filters,
  });
  return data;
}

export async function fetchGlobalPhotos(
  filters: GlobalPhotoFilters = {},
): Promise<ChantierPhoto[]> {
  const { data } = await apiClient.get<ChantierPhoto[]>("/photos", {
    params: filters,
  });
  return data;
}

export async function fetchAssignedChantiers(): Promise<Chantier[]> {
  const { data } = await apiClient.get<Chantier[]>("/chantiers/mine");
  return data;
}
