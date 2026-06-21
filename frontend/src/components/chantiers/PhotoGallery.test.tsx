import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhotoGallery } from "./PhotoGallery";
import { samplePhotos } from "../../test/fixtures/chantierTabs";

describe("PhotoGallery — Phase D", () => {
  it("T-D-COMP-010 — affiche les trois catégories photo MVP", () => {
    render(<PhotoGallery photos={samplePhotos} />);

    expect(
      screen.getByRole("button", { name: /Avant travaux/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Pendant travaux/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Après travaux/i }),
    ).toBeInTheDocument();
  });

  it("T-D-COMP-011 — filtre les photos par catégorie", async () => {
    const user = userEvent.setup();
    render(<PhotoGallery photos={samplePhotos} />);

    expect(screen.getByText("coulage_dalle.jpg")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Avant travaux/i }));
    expect(screen.getByText("terrain_initial.jpg")).toBeInTheDocument();
    expect(screen.queryByText("coulage_dalle.jpg")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Après travaux/i }));
    expect(screen.getByText("parking_fini.jpg")).toBeInTheDocument();
  });

  it("T-D-COMP-012 — bouton Ajouter une photo pour Conducteur et Chef", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const { rerender } = render(
      <PhotoGallery photos={samplePhotos} canAdd onAdd={onAdd} />,
    );

    const addButton = screen.getByRole("button", { name: /Ajouter une photo/i });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(onAdd).toHaveBeenCalledOnce();

    rerender(<PhotoGallery photos={samplePhotos} canAdd={false} />);
    expect(
      screen.queryByRole("button", { name: /Ajouter une photo/i }),
    ).not.toBeInTheDocument();
  });
});
