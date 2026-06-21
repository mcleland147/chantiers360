import { apiClient } from "./apiClient";

export interface BudgetSummary {
  projectId: string;
  projectReference: string;
  budgetEnvelope: number | null;
  budgetConsumed: number;
  budgetRemaining: number | null;
  consumptionPercent: number | null;
  hasEnvelope: boolean;
  alert80Active: boolean;
  alert100Active: boolean;
  resourceCount: number;
  expenseCount: number;
}

export interface ProjectResource {
  id: string;
  projectId: string;
  type: string;
  label: string;
  unitCost: number;
  quantity: number;
  totalPlanned: number;
  notes?: string;
  createdByName: string;
  createdAt: string;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  category: string;
  label: string;
  amount: number;
  expenseDate: string;
  supplier?: string;
  invoiceReference?: string;
  status: string;
  notes?: string;
  createdByName: string;
  createdAt: string;
}

export async function fetchBudgetSummary(
  chantierId: string,
): Promise<BudgetSummary> {
  const { data } = await apiClient.get<BudgetSummary>(
    `/chantiers/${chantierId}/budget/summary`,
  );
  return data;
}

export async function fetchResources(
  chantierId: string,
): Promise<ProjectResource[]> {
  const { data } = await apiClient.get<ProjectResource[]>(
    `/chantiers/${chantierId}/resources`,
  );
  return data;
}

export async function createResource(
  chantierId: string,
  payload: {
    type: string;
    label: string;
    unitCost: number;
    quantity?: number;
    notes?: string;
  },
): Promise<ProjectResource> {
  const { data } = await apiClient.post<ProjectResource>(
    `/chantiers/${chantierId}/resources`,
    payload,
  );
  return data;
}

export async function updateResource(
  chantierId: string,
  resourceId: string,
  payload: Partial<{
    type: string;
    label: string;
    unitCost: number;
    quantity: number;
    notes: string;
  }>,
): Promise<ProjectResource> {
  const { data } = await apiClient.patch<ProjectResource>(
    `/chantiers/${chantierId}/resources/${resourceId}`,
    payload,
  );
  return data;
}

export async function deleteResource(
  chantierId: string,
  resourceId: string,
): Promise<void> {
  await apiClient.delete(`/chantiers/${chantierId}/resources/${resourceId}`);
}

export async function fetchExpenses(
  chantierId: string,
): Promise<ProjectExpense[]> {
  const { data } = await apiClient.get<ProjectExpense[]>(
    `/chantiers/${chantierId}/expenses`,
  );
  return data;
}

export async function createExpense(
  chantierId: string,
  payload: {
    category: string;
    label: string;
    amount: number;
    expenseDate: string;
    supplier?: string;
    invoiceReference?: string;
    notes?: string;
  },
): Promise<ProjectExpense> {
  const { data } = await apiClient.post<ProjectExpense>(
    `/chantiers/${chantierId}/expenses`,
    payload,
  );
  return data;
}

export async function updateExpense(
  chantierId: string,
  expenseId: string,
  payload: Partial<{
    category: string;
    label: string;
    amount: number;
    expenseDate: string;
    supplier: string;
    invoiceReference: string;
    status: string;
    notes: string;
  }>,
): Promise<ProjectExpense> {
  const { data } = await apiClient.patch<ProjectExpense>(
    `/chantiers/${chantierId}/expenses/${expenseId}`,
    payload,
  );
  return data;
}

export async function deleteExpense(
  chantierId: string,
  expenseId: string,
): Promise<void> {
  await apiClient.delete(`/chantiers/${chantierId}/expenses/${expenseId}`);
}
