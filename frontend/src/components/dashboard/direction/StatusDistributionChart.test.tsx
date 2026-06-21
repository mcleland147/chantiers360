import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusDistributionChart } from "./StatusDistributionChart";

const sampleData = [
  { status: "Réalisation" as const, count: 3 },
  { status: "Préparation" as const, count: 1 },
];

describe("StatusDistributionChart — Phase F", () => {
  it("T-F-COMP-001 — affiche la répartition par statut MVP", () => {
    render(<StatusDistributionChart data={sampleData} />);

    expect(screen.getByText("Répartition par statut")).toBeInTheDocument();
    expect(screen.getByText("Réalisation")).toBeInTheDocument();
    expect(screen.getByText("Préparation")).toBeInTheDocument();
    expect(screen.queryByText("Exécution")).not.toBeInTheDocument();
    expect(screen.queryByText("Problème")).not.toBeInTheDocument();
  });
});
