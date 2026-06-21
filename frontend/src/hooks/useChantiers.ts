import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChantierStatus } from "../types/domain";
import {
  changeChantierStatus,
  createChantier,
  fetchChantier,
  fetchChantierHistory,
  fetchChantiers,
  updateChantier,
  type CreateChantierPayload,
  type UpdateChantierPayload,
} from "../services/chantierService";

export const chantierKeys = {
  all: ["chantiers"] as const,
  detail: (id: string) => ["chantiers", id] as const,
  history: (id: string) => ["chantiers", id, "history"] as const,
};

export function useChantiersQuery() {
  return useQuery({
    queryKey: chantierKeys.all,
    queryFn: fetchChantiers,
  });
}

export function useChantierQuery(id: string | undefined) {
  return useQuery({
    queryKey: chantierKeys.detail(id ?? ""),
    queryFn: () => fetchChantier(id!),
    enabled: Boolean(id),
  });
}

export function useChantierHistoryQuery(id: string | undefined) {
  return useQuery({
    queryKey: chantierKeys.history(id ?? ""),
    queryFn: () => fetchChantierHistory(id!),
    enabled: Boolean(id),
  });
}

export function useCreateChantierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChantierPayload) => createChantier(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chantierKeys.all });
    },
  });
}

export function useUpdateChantierMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateChantierPayload) => updateChantier(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chantierKeys.all });
      void queryClient.invalidateQueries({ queryKey: chantierKeys.detail(id) });
    },
  });
}

export function useChangeChantierStatusMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { status: ChantierStatus; reason?: string }) =>
      changeChantierStatus(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chantierKeys.all });
      void queryClient.invalidateQueries({ queryKey: chantierKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: chantierKeys.history(id) });
    },
  });
}
