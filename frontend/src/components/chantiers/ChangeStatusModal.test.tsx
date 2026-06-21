import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChangeStatusModal } from "./ChangeStatusModal";

describe("ChangeStatusModal — Phase G", () => {
  it("T-G-COMP-003 — exige un motif en retour arrière", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ChangeStatusModal
        currentStatus="Réalisation"
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "Démarrage");
    expect(screen.getByText(/Motif du retour arrière/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Confirmer/i }));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(
      screen.getByPlaceholderText(/RG-DATA-004/),
      "Retard matériaux",
    );
    await user.click(screen.getByRole("button", { name: /Confirmer/i }));

    expect(onSubmit).toHaveBeenCalledWith("Démarrage", "Retard matériaux");
  });
});

describe("ChangeStatusModal — Phase J", () => {
  it("T-J-COMP-002 — désactive Clôture si réserves ouvertes", () => {
    render(
      <ChangeStatusModal
        currentStatus="Réception"
        openReservesCount={3}
        isOpen
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
    const clotureOption = screen.getByRole("option", {
      name: /Clôture \(réserves ouvertes\)/i,
    });
    expect(clotureOption).toBeDisabled();
  });
});
