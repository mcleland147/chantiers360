import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddPhotoModal } from "./AddPhotoModal";

describe("AddPhotoModal (TST-R11-A-08)", () => {
  it("affiche le sélecteur de fichiers et soumet files + catégorie", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddPhotoModal isOpen onClose={vi.fn()} onSubmit={onSubmit} />);

    const file = new File(["img"], "facade.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("photo-file-input");
    await user.upload(input, file);
    await user.selectOptions(screen.getByRole("combobox"), "Après travaux");
    await user.click(screen.getByRole("button", { name: "Envoyer" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "Après travaux",
        files: expect.arrayContaining([
          expect.objectContaining({ name: "facade.jpg" }),
        ]),
      }),
    );
  });

  it("refuse un envoi sans fichier", async () => {
    const user = userEvent.setup();
    render(<AddPhotoModal isOpen onClose={vi.fn()} onSubmit={vi.fn()} />);
    const submit = screen.getByRole("button", { name: "Envoyer" });
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(screen.queryByText(/Sélectionnez au moins une photo/)).not.toBeInTheDocument();
  });
});
