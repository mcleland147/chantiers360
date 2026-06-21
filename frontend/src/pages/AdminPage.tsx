import { PagePlaceholder } from "../components/common/PagePlaceholder";

/** Placeholder — route accessible mais hors navigation MVP */
export function AdminPage() {
  return (
    <PagePlaceholder
      title="Administration"
      description="Configuration système — hors périmètre MVP (rôle Administrateur non retenu)."
    />
  );
}

export const adminHandle = {
  title: "Administration",
  subtitle: "Configuration système",
};
