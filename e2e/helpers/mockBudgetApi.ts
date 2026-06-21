import type { Page } from "@playwright/test";

interface BudgetSummaryMock {
  projectId: string;
  projectReference: string;
  budgetEnvelope: number;
  budgetConsumed: number;
  budgetRemaining: number;
  consumptionPercent: number;
  hasEnvelope: boolean;
  alert80Active: boolean;
  alert100Active: boolean;
  resourceCount: number;
  expenseCount: number;
}

interface ExpenseMock {
  id: string;
  projectId: string;
  category: string;
  label: string;
  amount: number;
  expenseDate: string;
  status: string;
  createdByName: string;
  createdAt: string;
}

const INITIAL_SUMMARY: BudgetSummaryMock = {
  projectId: "c-1",
  projectReference: "CHT-001",
  budgetEnvelope: 100_000,
  budgetConsumed: 79_000,
  budgetRemaining: 21_000,
  consumptionPercent: 79,
  hasEnvelope: true,
  alert80Active: false,
  alert100Active: false,
  resourceCount: 2,
  expenseCount: 3,
};

const INITIAL_EXPENSES: ExpenseMock[] = [
  {
    id: "exp-seed-1",
    projectId: "c-1",
    category: "Achat matériaux",
    label: "Béton",
    amount: 50_000,
    expenseDate: "01/06/2025",
    status: "Validée",
    createdByName: "Marc Dupont",
    createdAt: "01/06/2025",
  },
  {
    id: "exp-seed-2",
    projectId: "c-1",
    category: "Sous-traitance",
    label: "Électricité",
    amount: 29_000,
    expenseDate: "10/06/2025",
    status: "Validée",
    createdByName: "Marc Dupont",
    createdAt: "10/06/2025",
  },
  {
    id: "exp-draft",
    projectId: "c-1",
    category: "Location",
    label: "Grue (brouillon)",
    amount: 50_000,
    expenseDate: "12/06/2025",
    status: "Brouillon",
    createdByName: "Marc Dupont",
    createdAt: "12/06/2025",
  },
];

let summary = { ...INITIAL_SUMMARY };
let expenses = [...INITIAL_EXPENSES];
let nextExpenseId = 1;

function recomputeSummary() {
  const validatedTotal = expenses
    .filter((e) => e.status === "Validée")
    .reduce((sum, e) => sum + e.amount, 0);
  const percent = Math.round((validatedTotal / summary.budgetEnvelope) * 1000) / 10;
  const had80 = summary.alert80Active;
  const had100 = summary.alert100Active;
  summary = {
    ...summary,
    budgetConsumed: validatedTotal,
    budgetRemaining: summary.budgetEnvelope - validatedTotal,
    consumptionPercent: percent,
    expenseCount: expenses.length,
    alert80Active: had80 || percent >= 80,
    alert100Active: had100 || percent >= 100,
  };
}

export function resetBudgetMockState(): void {
  summary = { ...INITIAL_SUMMARY };
  expenses = [...INITIAL_EXPENSES];
  nextExpenseId = 1;
}

export async function installBudgetApiMock(page: Page): Promise<void> {
  await page.route("**/api/chantiers/*/budget/summary", async (route) => {
    await route.fulfill({ json: summary });
  });

  await page.route("**/api/chantiers/*/resources", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: [] });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/chantiers/*/expenses", async (route) => {
    const method = route.request().method();
    if (method === "GET") {
      await route.fulfill({ json: expenses });
      return;
    }
    if (method === "POST") {
      const body = route.request().postDataJSON() as {
        label: string;
        amount: number;
        category: string;
        expenseDate: string;
      };
      const expense: ExpenseMock = {
        id: `exp-e2e-${nextExpenseId++}`,
        projectId: "c-1",
        category: body.category,
        label: body.label,
        amount: body.amount,
        expenseDate: body.expenseDate.split("-").reverse().join("/"),
        status: "Validée",
        createdByName: "Marc Dupont",
        createdAt: "21/06/2025",
      };
      expenses = [expense, ...expenses];
      recomputeSummary();
      await route.fulfill({ status: 201, json: expense });
      return;
    }
    await route.continue();
  });

  await page.route("**/api/chantiers/*/expenses/*", async (route) => {
    if (route.request().method() === "DELETE") {
      const url = route.request().url();
      const id = url.split("/").pop()!;
      expenses = expenses.filter((e) => e.id !== id);
      recomputeSummary();
      await route.fulfill({ status: 200, json: {} });
      return;
    }
    await route.continue();
  });
}
