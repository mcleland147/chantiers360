import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanningCalendar } from "./PlanningCalendar";
import type { ScheduleSlot, Worker } from "../../types/domain";

const workers: Worker[] = [
  {
    id: "w-1",
    firstName: "Ahmed",
    lastName: "Benali",
    fullName: "Ahmed Benali",
    trade: "Maçon",
    isActive: true,
  },
];

describe("PlanningCalendar (TST-EVOL-002-07, 08)", () => {
  it("affiche la vue semaine avec créneaux actifs", () => {
    const slots: ScheduleSlot[] = [
      {
        id: "slot-active",
        workerId: "w-1",
        workerName: "Ahmed Benali",
        projectId: "c-1",
        projectReference: "CHT-001",
        projectName: "Oliviers",
        startAt: "2025-06-16T08:00:00.000Z",
        endAt: "2025-06-16T12:00:00.000Z",
        status: "Planifié",
        createdByName: "Marc Dupont",
      },
    ];

    render(
      <PlanningCalendar
        viewMode="week"
        anchorDate={new Date("2025-06-16T12:00:00.000Z")}
        workers={workers}
        slots={slots}
      />,
    );

    expect(screen.getByTestId("planning-calendar-week")).toBeInTheDocument();
    expect(screen.getByTestId("planning-slot-slot-active")).toHaveTextContent("CHT-001");
    expect(screen.getByTestId("planning-slot-slot-active")).toHaveTextContent("Planifié");
  });

  it("affiche un créneau annulé avec style distinct", () => {
    const slots: ScheduleSlot[] = [
      {
        id: "slot-cancelled",
        workerId: "w-1",
        workerName: "Ahmed Benali",
        projectId: "c-1",
        projectReference: "CHT-003",
        projectName: "Haussmann",
        startAt: "2025-06-17T08:00:00.000Z",
        endAt: "2025-06-17T12:00:00.000Z",
        status: "Annulé",
        createdByName: "Marc Dupont",
      },
    ];

    render(
      <PlanningCalendar
        viewMode="week"
        anchorDate={new Date("2025-06-17T12:00:00.000Z")}
        workers={workers}
        slots={slots}
      />,
    );

    const button = screen.getByTestId("planning-slot-slot-cancelled");
    expect(button.className).toMatch(/line-through/);
    expect(button).toHaveTextContent("Annulé");
  });
});
