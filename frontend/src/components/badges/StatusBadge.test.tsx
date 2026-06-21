import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ChantierStatusBadge,
  LateBadge,
  PriorityBadge,
  ReserveStatusBadge,
} from "./StatusBadge";

describe("StatusBadge", () => {
  it("affiche le statut chantier Réalisation", () => {
    render(<ChantierStatusBadge status="Réalisation" />);
    expect(screen.getByText("Réalisation")).toBeInTheDocument();
  });

  it("affiche le badge En retard séparément du statut", () => {
    render(<LateBadge />);
    expect(screen.getByText("En retard")).toBeInTheDocument();
  });

  it("affiche les statuts réserve officiels", () => {
    render(<ReserveStatusBadge status="Levée" />);
    expect(screen.getByText("Levée")).toBeInTheDocument();
  });

  it("affiche les priorités réserve", () => {
    render(<PriorityBadge priority="Critique" />);
    expect(screen.getByText("Critique")).toBeInTheDocument();
  });
});
