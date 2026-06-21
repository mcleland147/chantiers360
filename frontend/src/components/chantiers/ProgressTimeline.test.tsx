import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProgressTimeline } from "./ProgressTimeline";
import { sampleProgressUpdates } from "../../test/fixtures/chantierTabs";

describe("ProgressTimeline — Phase D", () => {
  it("T-D-COMP-004 — affiche date, auteur, commentaire et pourcentage", () => {
    render(<ProgressTimeline updates={sampleProgressUpdates} />);

    expect(screen.getByText("14/05/2025")).toBeInTheDocument();
    expect(screen.getByText("Jean Moreau")).toBeInTheDocument();
    expect(
      screen.getByText("Coulage dalle niveau R+3 terminé."),
    ).toBeInTheDocument();
    expect(screen.getByText("67 %")).toBeInTheDocument();

    expect(screen.getByText("07/05/2025")).toBeInTheDocument();
    expect(screen.getByText("Marc Dupont")).toBeInTheDocument();
    expect(
      screen.getByText("Réunion de coordination avec les sous-traitants."),
    ).toBeInTheDocument();
  });

  it("T-D-COMP-005 — bouton Ajouter une mise à jour pour Conducteur et Chef", () => {
    const { rerender } = render(
      <ProgressTimeline updates={sampleProgressUpdates} canAdd />,
    );
    expect(
      screen.getByRole("button", { name: /Ajouter une mise à jour/i }),
    ).toBeInTheDocument();

    rerender(
      <ProgressTimeline updates={sampleProgressUpdates} canAdd={false} />,
    );
    expect(
      screen.queryByRole("button", { name: /Ajouter une mise à jour/i }),
    ).not.toBeInTheDocument();
  });

  it("T-D-COMP-006 — déclenche onAdd au clic", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <ProgressTimeline
        updates={sampleProgressUpdates}
        canAdd
        onAdd={onAdd}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: /Ajouter une mise à jour/i }),
    );
    expect(onAdd).toHaveBeenCalledOnce();
  });
});
