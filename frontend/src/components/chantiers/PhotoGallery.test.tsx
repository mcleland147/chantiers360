import { cleanup, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PhotoGallery } from "./PhotoGallery";
import { samplePhotos } from "../../test/fixtures/chantierTabs";
import { renderWithProviders } from "../../test/test-utils";

vi.mock("../photos/AuthenticatedPhoto", () => ({
  AuthenticatedPhoto: ({ alt }: { alt: string }) => (
    <div data-testid="photo-thumb">{alt}</div>
  ),
}));

describe("PhotoGallery — Phase D", () => {
  it("T-D-COMP-010 — affiche les trois catégories photo MVP", () => {
    renderWithProviders(<PhotoGallery photos={samplePhotos} />);

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
    renderWithProviders(<PhotoGallery photos={samplePhotos} />);

    expect(screen.getAllByText("coulage_dalle.jpg").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /Avant travaux/i }));
    expect(screen.getAllByText("terrain_initial.jpg").length).toBeGreaterThan(0);
    expect(screen.queryByText("coulage_dalle.jpg")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Après travaux/i }));
    expect(screen.getAllByText("parking_fini.jpg").length).toBeGreaterThan(0);
  });

  it("T-D-COMP-012 — bouton Ajouter une photo pour Conducteur et Chef", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    renderWithProviders(
      <PhotoGallery photos={samplePhotos} canAdd onAdd={onAdd} />,
    );

    const addButton = screen.getByRole("button", { name: /Ajouter une photo/i });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);
    expect(onAdd).toHaveBeenCalledOnce();

    cleanup();
    renderWithProviders(<PhotoGallery photos={samplePhotos} canAdd={false} />);
    expect(
      screen.queryByRole("button", { name: /Ajouter une photo/i }),
    ).not.toBeInTheDocument();
  });
});
