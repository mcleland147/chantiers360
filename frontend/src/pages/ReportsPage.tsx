import { PagePlaceholder } from "../components/common/PagePlaceholder";

/** Placeholder — route accessible mais hors navigation MVP */
export function ReportsPage() {
  return (
    <PagePlaceholder
      title="Rapports"
      description="Exports et rapports — hors périmètre MVP prioritaire."
    />
  );
}

export const reportsHandle = {
  title: "Rapports",
  subtitle: "Génération et export de rapports",
};
