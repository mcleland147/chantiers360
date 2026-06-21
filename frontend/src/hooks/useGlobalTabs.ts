import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAssignedChantiers,
  fetchGlobalPhotos,
  fetchGlobalReserves,
  type GlobalPhotoFilters,
  type GlobalReserveFilters,
} from "../services/globalTabsService";

export const globalTabKeys = {
  reserves: (filters: GlobalReserveFilters) =>
    ["reserves", "global", filters] as const,
  photos: (filters: GlobalPhotoFilters) =>
    ["photos", "global", filters] as const,
  assignedChantiers: ["chantiers", "mine"] as const,
};

export function useGlobalReservesQuery(filters: GlobalReserveFilters = {}) {
  return useQuery({
    queryKey: globalTabKeys.reserves(filters),
    queryFn: () => fetchGlobalReserves(filters),
  });
}

export function useGlobalPhotosQuery(filters: GlobalPhotoFilters = {}) {
  return useQuery({
    queryKey: globalTabKeys.photos(filters),
    queryFn: () => fetchGlobalPhotos(filters),
  });
}

export function useAssignedChantiersQuery(enabled = true) {
  return useQuery({
    queryKey: globalTabKeys.assignedChantiers,
    queryFn: fetchAssignedChantiers,
    enabled,
  });
}

export function useGlobalOpenReservesCountQuery(enabled = true) {
  return useQuery({
    queryKey: globalTabKeys.reserves({}),
    queryFn: () => fetchGlobalReserves({}),
    enabled,
    select: (reserves) =>
      reserves.filter((r) => r.status === "Ouverte" || r.status === "En cours")
        .length,
  });
}

export function invalidateGlobalReserves(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ["reserves", "global"] });
}
