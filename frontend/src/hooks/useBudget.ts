import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  createResource,
  deleteExpense,
  deleteResource,
  fetchBudgetSummary,
  fetchExpenses,
  fetchResources,
  updateExpense,
  updateResource,
} from "../services/budgetService";
import { chantierKeys } from "./useChantiers";

export const budgetKeys = {
  summary: (chantierId: string) => ["budget", chantierId, "summary"] as const,
  resources: (chantierId: string) => ["budget", chantierId, "resources"] as const,
  expenses: (chantierId: string) => ["budget", chantierId, "expenses"] as const,
};

function invalidateBudget(queryClient: ReturnType<typeof useQueryClient>, chantierId: string) {
  void queryClient.invalidateQueries({ queryKey: budgetKeys.summary(chantierId) });
  void queryClient.invalidateQueries({ queryKey: budgetKeys.expenses(chantierId) });
  void queryClient.invalidateQueries({ queryKey: budgetKeys.resources(chantierId) });
  void queryClient.invalidateQueries({ queryKey: chantierKeys.all });
  void queryClient.invalidateQueries({ queryKey: chantierKeys.detail(chantierId) });
}

export function useBudgetSummaryQuery(chantierId: string | undefined) {
  return useQuery({
    queryKey: budgetKeys.summary(chantierId ?? ""),
    queryFn: () => fetchBudgetSummary(chantierId!),
    enabled: Boolean(chantierId),
  });
}

export function useResourcesQuery(chantierId: string | undefined) {
  return useQuery({
    queryKey: budgetKeys.resources(chantierId ?? ""),
    queryFn: () => fetchResources(chantierId!),
    enabled: Boolean(chantierId),
  });
}

export function useExpensesQuery(chantierId: string | undefined) {
  return useQuery({
    queryKey: budgetKeys.expenses(chantierId ?? ""),
    queryFn: () => fetchExpenses(chantierId!),
    enabled: Boolean(chantierId),
  });
}

export function useCreateResourceMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createResource.bind(null, chantierId),
    onSuccess: () => invalidateBudget(queryClient, chantierId),
  });
}

export function useDeleteResourceMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (resourceId: string) => deleteResource(chantierId, resourceId),
    onSuccess: () => invalidateBudget(queryClient, chantierId),
  });
}

export function useCreateExpenseMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense.bind(null, chantierId),
    onSuccess: () => invalidateBudget(queryClient, chantierId),
  });
}

export function useUpdateExpenseMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      expenseId,
      payload,
    }: {
      expenseId: string;
      payload: Parameters<typeof updateExpense>[2];
    }) => updateExpense(chantierId, expenseId, payload),
    onSuccess: () => invalidateBudget(queryClient, chantierId),
  });
}

export function useDeleteExpenseMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(chantierId, expenseId),
    onSuccess: () => invalidateBudget(queryClient, chantierId),
  });
}

export function useUpdateResourceMutation(chantierId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      resourceId,
      payload,
    }: {
      resourceId: string;
      payload: Parameters<typeof updateResource>[2];
    }) => updateResource(chantierId, resourceId, payload),
    onSuccess: () => invalidateBudget(queryClient, chantierId),
  });
}
