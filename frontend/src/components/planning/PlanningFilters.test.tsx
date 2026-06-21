import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PlanningFilters } from "./PlanningFilters";

describe("PlanningFilters (TST-EVOL-002-07)", () => {
  it("filtre par chantier et ouvrier", async () => {
    const user = userEvent.setup();
    const onProjectChange = vi.fn();
    const onWorkerChange = vi.fn();

    render(
      <PlanningFilters
        chantiers={[
          {
            id: "c-1",
            reference: "CHT-001",
            name: "Oliviers",
            client: "X",
            address: "Y",
            conductorName: "Marc",
            status: "Réalisation",
            startDate: "2024-01-01",
            expectedEndDate: "2025-01-01",
            openReservesCount: 0,
          },
        ]}
        workers={[
          {
            id: "w-1",
            firstName: "Ahmed",
            lastName: "Benali",
            fullName: "Ahmed Benali",
            trade: "Maçon",
            isActive: true,
          },
        ]}
        projectId=""
        workerId=""
        onProjectChange={onProjectChange}
        onWorkerChange={onWorkerChange}
      />,
    );

    await user.selectOptions(
      screen.getByTestId("planning-filter-chantier"),
      "c-1",
    );
    await user.selectOptions(screen.getByTestId("planning-filter-worker"), "w-1");

    expect(onProjectChange).toHaveBeenCalledWith("c-1");
    expect(onWorkerChange).toHaveBeenCalledWith("w-1");
  });
});
