import { LoadingState } from "../common/LoadingState";
import { PagePlaceholder } from "../common/PagePlaceholder";
import {
  useBudgetSummaryQuery,
  useCreateExpenseMutation,
  useCreateResourceMutation,
  useDeleteExpenseMutation,
  useDeleteResourceMutation,
  useExpensesQuery,
  useResourcesQuery,
} from "../../hooks/useBudget";
import { canManageBudget } from "../../utils/chantierPermissions";
import type { UserRole } from "../../types/domain";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import { ExpenseTable } from "./ExpenseTable";
import { ResourceTable } from "./ResourceTable";

interface BudgetTabProps {
  chantierId: string;
  userRole: UserRole;
}

export function BudgetTab({ chantierId, userRole }: BudgetTabProps) {
  const canWrite = canManageBudget(userRole);
  const { data: summary, isLoading: summaryLoading, isError: summaryError } =
    useBudgetSummaryQuery(chantierId);
  const { data: resources = [], isLoading: resourcesLoading } =
    useResourcesQuery(chantierId);
  const { data: expenses = [], isLoading: expensesLoading } =
    useExpensesQuery(chantierId);

  const createResource = useCreateResourceMutation(chantierId);
  const deleteResource = useDeleteResourceMutation(chantierId);
  const createExpense = useCreateExpenseMutation(chantierId);
  const deleteExpense = useDeleteExpenseMutation(chantierId);

  if (summaryLoading || resourcesLoading || expensesLoading) {
    return <LoadingState label="Chargement du budget…" />;
  }

  if (summaryError || !summary) {
    return (
      <PagePlaceholder
        title="Budget indisponible"
        description="Impossible de charger la synthèse budget pour ce chantier."
      />
    );
  }

  return (
    <div className="space-y-5" data-testid="budget-tab">
      <BudgetSummaryCard summary={summary} />
      <ResourceTable
        resources={resources}
        canWrite={canWrite}
        onCreate={async (payload) => {
          await createResource.mutateAsync(payload);
        }}
        onDelete={async (id) => {
          await deleteResource.mutateAsync(id);
        }}
        isPending={createResource.isPending || deleteResource.isPending}
      />
      <ExpenseTable
        expenses={expenses}
        canWrite={canWrite}
        onCreate={async (payload) => {
          await createExpense.mutateAsync(payload);
        }}
        onDelete={async (id) => {
          await deleteExpense.mutateAsync(id);
        }}
        isPending={createExpense.isPending || deleteExpense.isPending}
      />
    </div>
  );
}
