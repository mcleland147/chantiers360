import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MonthlyTrendChart } from "./MonthlyTrendChart";

const trendData = [
  { label: "Avr 2025", activeChantiers: 7, openReserves: 6 },
  { label: "Mai 2025", activeChantiers: 7, openReserves: 5 },
];

describe("MonthlyTrendChart — Phase F", () => {
  it("T-F-COMP-003 — affiche la tendance et le filtre période", async () => {
    const user = userEvent.setup();
    const onPeriodChange = vi.fn();

    render(
      <MonthlyTrendChart
        data={trendData}
        period="quarter"
        onPeriodChange={onPeriodChange}
      />,
    );

    expect(screen.getByText("Tendance mensuelle")).toBeInTheDocument();
    expect(screen.getByText("Avr 2025")).toBeInTheDocument();
    expect(screen.getByText("Chantiers actifs")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mois" }));
    expect(onPeriodChange).toHaveBeenCalledWith("month");
  });
});
