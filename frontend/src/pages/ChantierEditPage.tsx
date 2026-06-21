import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  ChantierForm,
  type ChantierFormValues,
} from "../components/chantiers/ChantierForm";
import { PageHeader } from "../components/common/PageHeader";
import { PagePlaceholder } from "../components/common/PagePlaceholder";
import { LoadingState } from "../components/common/LoadingState";
import { inputDateToIso } from "../data/conductors";
import { useChantierQuery, useUpdateChantierMutation } from "../hooks/useChantiers";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string | { message?: string } };
    if (typeof body?.message === "string") return body.message;
    if (body?.message && typeof body.message === "object" && body.message.message) {
      return body.message.message;
    }
  }
  return "Une erreur est survenue lors de la modification.";
}

export function ChantierEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chantier, isLoading, isError } = useChantierQuery(id);
  const updateMutation = useUpdateChantierMutation(id ?? "");

  if (isLoading) {
    return <LoadingState label="Chargement du chantier…" />;
  }

  if (isError || !chantier || !id) {
    return (
      <div className="p-5">
        <PagePlaceholder
          title="Chantier introuvable"
          description="Impossible de charger ce chantier pour modification."
        />
      </div>
    );
  }

  const handleSubmit = (values: ChantierFormValues) => {
    updateMutation.mutate(
      {
        name: values.name.trim(),
        client: values.client.trim(),
        address: values.address.trim(),
        conductorId: values.conductorId,
        startDate: inputDateToIso(values.startDate),
        expectedEndDate: inputDateToIso(values.expectedEndDate),
        budget: values.budget ? Number(values.budget) : undefined,
      },
      {
        onSuccess: () => {
          void navigate(`/chantiers/${id}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Modifier le chantier"
        description={`${chantier.reference} — ${chantier.name}`}
      />
      <div className="flex-1 p-5">
        <Link
          to={`/chantiers/${id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
        >
          <ArrowLeft size={14} />
          Retour à la fiche
        </Link>
        <div className="max-w-3xl rounded-xl border border-border bg-white p-5 shadow-sm">
          <ChantierForm
            isEdit
            initial={chantier}
            isSubmitting={updateMutation.isPending}
            error={
              updateMutation.isError
                ? extractErrorMessage(updateMutation.error)
                : null
            }
            onSubmit={handleSubmit}
            onCancel={() => void navigate(`/chantiers/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}
