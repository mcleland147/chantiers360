import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AssignmentsList } from "./AssignmentsList";
import { sampleAssignments } from "../../test/fixtures/chantierTabs";

describe("AssignmentsList — Phase D", () => {
  it("T-D-COMP-001 — affiche les affectations avec statuts Actif et Inactif", () => {
    render(<AssignmentsList assignments={sampleAssignments} />);

    expect(screen.getByText("Jean Moreau")).toBeInTheDocument();
    expect(screen.getByText("Michel Durand")).toBeInTheDocument();
    expect(screen.getByText("Chef de chantier")).toBeInTheDocument();
    expect(screen.getByText("Actif")).toBeInTheDocument();
    expect(screen.getByText("Inactif")).toBeInTheDocument();
    expect(screen.getByText(/1 membre actif sur 2/)).toBeInTheDocument();
  });

  it("T-D-COMP-002 — bouton Affecter un membre visible conducteur uniquement", () => {
    const { rerender } = render(
      <AssignmentsList assignments={sampleAssignments} canAssign />,
    );
    expect(
      screen.getByRole("button", { name: /Affecter un membre/i }),
    ).toBeInTheDocument();

    rerender(<AssignmentsList assignments={sampleAssignments} canAssign={false} />);
    expect(
      screen.queryByRole("button", { name: /Affecter un membre/i }),
    ).not.toBeInTheDocument();
  });

  it("T-D-COMP-003 — déclenche onAssign au clic conducteur", async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();
    render(
      <AssignmentsList
        assignments={sampleAssignments}
        canAssign
        onAssign={onAssign}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Affecter un membre/i }),
    );
    expect(onAssign).toHaveBeenCalledOnce();
  });
});
