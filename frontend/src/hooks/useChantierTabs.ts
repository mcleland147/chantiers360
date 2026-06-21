import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAssignment,
  createPhoto,
  createProgressUpdate,
  createReserve,
  fetchAssignableUsers,
  fetchChantierAssignments,
  fetchChantierPhotos,
  fetchChantierProgress,
  fetchChantierReserves,
  takeReserveCharge,
  validateReserveLevee,
  type CreateAssignmentPayload,
  type CreatePhotoPayload,
  type CreateProgressPayload,
  type CreateReservePayload,
} from "../services/chantierTabsService";
import { chantierKeys } from "./useChantiers";
import { invalidateGlobalReserves } from "./useGlobalTabs";

export const chantierTabKeys = {
  assignments: (id: string) => ["chantiers", id, "assignments"] as const,
  progress: (id: string) => ["chantiers", id, "progress"] as const,
  reserves: (id: string) => ["chantiers", id, "reserves"] as const,
  photos: (id: string) => ["chantiers", id, "photos"] as const,
};

export const userKeys = {
  assignable: ["users", "assignable"] as const,
};

function invalidateTabHistory(
  queryClient: ReturnType<typeof useQueryClient>,
  chantierId: string,
  tab: keyof typeof chantierTabKeys,
) {
  void queryClient.invalidateQueries({
    queryKey: chantierTabKeys[tab](chantierId),
  });
  void queryClient.invalidateQueries({
    queryKey: chantierKeys.detail(chantierId),
  });
  void queryClient.invalidateQueries({
    queryKey: chantierKeys.history(chantierId),
  });
  if (tab === "reserves") {
    void queryClient.invalidateQueries({ queryKey: chantierKeys.all });
    invalidateGlobalReserves(queryClient);
  }
}

export function useAssignableUsersQuery(enabled = true) {
  return useQuery({
    queryKey: userKeys.assignable,
    queryFn: fetchAssignableUsers,
    enabled,
  });
}

export function useChantierAssignmentsQuery(
  chantierId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: chantierTabKeys.assignments(chantierId ?? ""),
    queryFn: () => fetchChantierAssignments(chantierId!),
    enabled: Boolean(chantierId) && enabled,
  });
}

export function useChantierProgressQuery(
  chantierId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: chantierTabKeys.progress(chantierId ?? ""),
    queryFn: () => fetchChantierProgress(chantierId!),
    enabled: Boolean(chantierId) && enabled,
  });
}

export function useChantierReservesQuery(
  chantierId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: chantierTabKeys.reserves(chantierId ?? ""),
    queryFn: () => fetchChantierReserves(chantierId!),
    enabled: Boolean(chantierId) && enabled,
  });
}

export function useChantierPhotosQuery(
  chantierId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: chantierTabKeys.photos(chantierId ?? ""),
    queryFn: () => fetchChantierPhotos(chantierId!),
    enabled: Boolean(chantierId) && enabled,
  });
}

export function useCreateAssignmentMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) =>
      createAssignment(chantierId, payload),
    onSuccess: () => invalidateTabHistory(queryClient, chantierId, "assignments"),
  });
}

export function useCreateProgressMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProgressPayload) =>
      createProgressUpdate(chantierId, payload),
    onSuccess: () => invalidateTabHistory(queryClient, chantierId, "progress"),
  });
}

export function useCreateReserveMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReservePayload) =>
      createReserve(chantierId, payload),
    onSuccess: () => invalidateTabHistory(queryClient, chantierId, "reserves"),
  });
}

export function useCreatePhotoMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePhotoPayload) =>
      createPhoto(chantierId, payload),
    onSuccess: () => invalidateTabHistory(queryClient, chantierId, "photos"),
  });
}

export function useTakeReserveChargeMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reserveId: string) => takeReserveCharge(chantierId, reserveId),
    onSuccess: () => invalidateTabHistory(queryClient, chantierId, "reserves"),
  });
}

export function useValidateReserveLeveeMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reserveId: string) =>
      validateReserveLevee(chantierId, reserveId),
    onSuccess: () => invalidateTabHistory(queryClient, chantierId, "reserves"),
  });
}
