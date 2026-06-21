import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistoryTimeline } from "./HistoryTimeline";
import { sampleHistoryEntries } from "../../test/fixtures/chantierTabs";

describe("HistoryTimeline — Phase D", () => {
  it("T-D-COMP-013 — affichage lecture seule avec auteur, action et valeurs", () => {
    render(<HistoryTimeline entries={sampleHistoryEntries} />);

    expect(
      screen.getByText("Traçabilité complète — consultation seule (RG-012)"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Marc Dupont")).toHaveLength(2);
    expect(screen.getByText("Changement de statut")).toBeInTheDocument();
    expect(screen.getAllByText(/Ancienne valeur :/)).toHaveLength(2);
    expect(screen.getAllByText(/Nouvelle valeur :/)).toHaveLength(2);
    expect(screen.getByText("Validation levée réserve")).toBeInTheDocument();
    expect(
      screen.getByText(/Retard livraison matériaux — reprise planification/),
    ).toBeInTheDocument();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("T-D-COMP-014 — affiche motif de retour arrière quand présent", () => {
    render(<HistoryTimeline entries={sampleHistoryEntries} />);
    expect(screen.getByText(/Motif :/)).toBeInTheDocument();
  });
});
