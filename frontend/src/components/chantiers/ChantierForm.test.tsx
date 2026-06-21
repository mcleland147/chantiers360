import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChantierForm } from "./ChantierForm";

describe("ChantierForm — Phase G", () => {
  it("T-G-COMP-001 — affiche les champs obligatoires de création", () => {
    render(
      <ChantierForm onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByLabelText(/Référence/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom du chantier/i)).toBeInTheDocument();
    expect(screen.getByText(/statut initial sera « Préparation »/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Créer le chantier/i })).toBeInTheDocument();
  });

  it("T-G-COMP-002 — soumet les valeurs du formulaire", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<ChantierForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("CHT-099"), "CHT-099");
    await user.type(screen.getByLabelText(/Nom du chantier/i), "Test chantier");
    await user.type(screen.getByLabelText(/^Client$/i), "Client test");
    await user.type(screen.getByLabelText(/^Adresse$/i), "1 rue Test");
    await user.clear(screen.getByLabelText(/Date de début/i));
    await user.type(screen.getByLabelText(/Date de début/i), "2025-01-01");
    await user.clear(screen.getByLabelText(/Date fin prévue/i));
    await user.type(screen.getByLabelText(/Date fin prévue/i), "2025-12-31");
    await user.click(screen.getByRole("button", { name: /Créer le chantier/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: "CHT-099",
        name: "Test chantier",
        client: "Client test",
      }),
    );
  });
});
