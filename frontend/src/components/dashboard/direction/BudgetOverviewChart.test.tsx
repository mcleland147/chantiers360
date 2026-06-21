import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BudgetOverviewChart } from "./BudgetOverviewChart";

describe("BudgetOverviewChart — Phase F", () => {
  it("T-F-COMP-004 — affiche la vue budget consolidée", () => {
    render(
      <BudgetOverviewChart
        data={{ totalBudget: 10_000_000, totalSpent: 6_000_000, chantierCount: 8 }}
      />,
    );

    expect(screen.getByText("Vue budget")).toBeInTheDocument();
    expect(screen.getByText("Consolidé sur 8 chantiers")).toBeInTheDocument();
    expect(screen.getByText("Budget total")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
