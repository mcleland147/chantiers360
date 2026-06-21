import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReservesList } from "./ReservesList";
import { sampleReserves } from "../../test/fixtures/chantierTabs";

describe("ReservesList — Phase D", () => {
  it("T-D-COMP-007 — affiche réserves avec statuts et priorités MVP", () => {
    render(<ReservesList reserves={sampleReserves} />);

    expect(screen.getByText("Fissure mur porteur nord")).toBeInTheDocument();
    expect(screen.getAllByText("Ouverte")).toHaveLength(2);
    expect(screen.getByText("En cours")).toBeInTheDocument();
    expect(screen.getByText("Levée")).toBeInTheDocument();
    expect(screen.getByText("Critique")).toBeInTheDocument();
    expect(screen.getByText("Haute")).toBeInTheDocument();
    expect(screen.getByText("Moyenne")).toBeInTheDocument();
    expect(screen.getByText("Faible")).toBeInTheDocument();

    expect(screen.queryByText(/Problème/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Résolu/i)).not.toBeInTheDocument();
  });

  it("T-J-COMP-001 — Prendre en charge visible sur réserves Ouverte", async () => {
    const user = userEvent.setup();
    const onTakeCharge = vi.fn();

    render(
      <ReservesList
        reserves={sampleReserves}
        canTakeCharge
        onTakeCharge={onTakeCharge}
      />,
    );

    const takeButtons = screen.getAllByRole("button", {
      name: /Prendre en charge/i,
    });
    expect(takeButtons.length).toBeGreaterThan(0);
    await user.click(takeButtons[0]!);
    expect(onTakeCharge).toHaveBeenCalled();
  });

  it("T-D-COMP-008 — Valider la levée visible conducteur sur réserves En cours", async () => {
    const user = userEvent.setup();
    const onValidateLevee = vi.fn();

    render(
      <ReservesList
        reserves={sampleReserves}
        canValidateLevee
        onValidateLevee={onValidateLevee}
      />,
    );

    const validateButtons = screen.getAllByRole("button", {
      name: /Valider la levée/i,
    });
    expect(validateButtons).toHaveLength(1);

    const enCoursRow = screen.getByRole("row", {
      name: /RSV-042.*Fissure mur porteur nord/i,
    });
    expect(within(enCoursRow).getByText("En cours")).toBeInTheDocument();

    await user.click(validateButtons[0]!);
    expect(onValidateLevee).toHaveBeenCalledWith("r-1");
  });

  it("T-D-COMP-009 — pas de Valider la levée sans droit conducteur", () => {
    render(<ReservesList reserves={sampleReserves} canValidateLevee={false} />);
    expect(
      screen.queryByRole("button", { name: /Valider la levée/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Action" })).not.toBeInTheDocument();
  });
});
