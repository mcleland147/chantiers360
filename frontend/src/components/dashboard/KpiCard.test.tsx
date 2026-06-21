import { render, screen } from "@testing-library/react";
import { FolderKanban } from "lucide-react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("affiche label, valeur et sous-titre", () => {
    render(
      <KpiCard
        label="Chantiers actifs"
        value={12}
        subtitle="2 démarrés ce mois"
        icon={FolderKanban}
        iconBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
      />,
    );

    expect(screen.getByText("Chantiers actifs")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("2 démarrés ce mois")).toBeInTheDocument();
  });
});
