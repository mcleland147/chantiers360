import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddPhotoModal } from "./AddPhotoModal";
import { AddProgressModal } from "./AddProgressModal";
import { AssignMemberModal } from "./AssignMemberModal";
import { CreateReserveModal } from "./CreateReserveModal";

describe("Modales onglets — T-G-TABS-FORMS", () => {
  it("T-G-FORMS-COMP-001 — AssignMemberModal soumet l'affectation", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AssignMemberModal
        isOpen
        users={[
          {
            id: "u-chef",
            firstName: "Jean",
            lastName: "Moreau",
            fullName: "Jean Moreau",
            role: "CHEF_CHANTIER",
          },
        ]}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "u-chef");
    await user.type(
      screen.getByPlaceholderText(/Chef de chantier/i),
      "Chef de chantier",
    );
    await user.click(screen.getByRole("button", { name: "Affecter" }));

    expect(onSubmit).toHaveBeenCalledWith({
      userId: "u-chef",
      functionLabel: "Chef de chantier",
    });
  });

  it("T-G-FORMS-COMP-002 — AddProgressModal exige un commentaire", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AddProgressModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />,
    );

    await user.type(
      screen.getByPlaceholderText(/avancement terrain/i),
      "Coulage terminé",
    );
    await user.type(screen.getByPlaceholderText("0 – 100"), "55");
    await user.click(screen.getByRole("button", { name: "Enregistrer" }));

    expect(onSubmit).toHaveBeenCalledWith({
      comment: "Coulage terminé",
      percent: 55,
    });
  });

  it("T-G-FORMS-COMP-003 — CreateReserveModal soumet titre et priorité", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CreateReserveModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />,
    );

    await user.type(
      screen.getByPlaceholderText(/Description courte/i),
      "Fuite toiture",
    );
    await user.selectOptions(screen.getByRole("combobox"), "Haute");
    await user.click(screen.getByRole("button", { name: "Créer la réserve" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Fuite toiture",
        priority: "Haute",
      }),
    );
  });

  it("T-G-FORMS-COMP-004 — AddPhotoModal soumet URL et catégorie", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddPhotoModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    await user.type(
      screen.getByPlaceholderText("facade-sud.jpg"),
      "facade-sud.jpg",
    );
    await user.selectOptions(screen.getByRole("combobox"), "Après travaux");
    await user.click(screen.getByRole("button", { name: "Ajouter" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "facade-sud.jpg",
        category: "Après travaux",
      }),
    );
  });
});
