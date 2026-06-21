import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BudgetSummaryCard } from "./BudgetSummaryCard";
import type { BudgetSummary } from "../../services/budgetService";

const baseSummary: BudgetSummary = {
  projectId: "c-1",
  projectReference: "CHT-001",
  budgetEnvelope: 100_000,
  budgetConsumed: 85_000,
  budgetRemaining: 15_000,
  consumptionPercent: 85,
  hasEnvelope: true,
  alert80Active: true,
  alert100Active: false,
  resourceCount: 3,
  expenseCount: 5,
};

describe("BudgetSummaryCard — TST-EVOL-003-06", () => {
  it("TST-EVOL-003-06 — affiche enveloppe, consommé, restant et %", () => {
    render(<BudgetSummaryCard summary={baseSummary} />);
    expect(screen.getByTestId("budget-envelope")).toHaveTextContent("100");
    expect(screen.getByTestId("budget-consumed")).toHaveTextContent("85");
    expect(screen.getByTestId("budget-remaining")).toHaveTextContent("15");
    expect(screen.getByTestId("budget-percent")).toHaveTextContent("85%");
  });

  it("TST-EVOL-003-06 — badge alerte 80 % visible", () => {
    render(<BudgetSummaryCard summary={baseSummary} />);
    expect(screen.getByTestId("budget-alert-80")).toBeInTheDocument();
    expect(screen.queryByTestId("budget-alert-100")).not.toBeInTheDocument();
  });

  it("TST-EVOL-003-06 — message si enveloppe absente", () => {
    render(
      <BudgetSummaryCard
        summary={{
          ...baseSummary,
          hasEnvelope: false,
          budgetEnvelope: null,
          budgetRemaining: null,
          consumptionPercent: null,
        }}
      />,
    );
    expect(screen.getByText(/Aucune enveloppe budgétaire/)).toBeInTheDocument();
  });
});
