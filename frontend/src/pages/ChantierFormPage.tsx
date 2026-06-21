import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ChantierForm, type ChantierFormValues } from "../components/chantiers/ChantierForm";
import { PageHeader } from "../components/common/PageHeader";
import { inputDateToIso } from "../data/conductors";
import { useCreateChantierMutation } from "../hooks/useChantiers";
import { isAxiosError } from "axios";

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const body = error.response?.data as { message?: string | { message?: string } };
    if (typeof body?.message === "string") return body.message;
    if (body?.message && typeof body.message === "object" && body.message.message) {
      return body.message.message;
    }
  }
  return "Une erreur est survenue lors de l'enregistrement.";
}

export function ChantierFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateChantierMutation();

  const handleSubmit = (values: ChantierFormValues) => {
    createMutation.mutate(
      {
        reference: values.reference.trim(),
        name: values.name.trim(),
        client: values.client.trim(),
        address: values.address.trim(),
        conductorId: values.conductorId,
        startDate: inputDateToIso(values.startDate),
        expectedEndDate: inputDateToIso(values.expectedEndDate),
        budget: values.budget ? Number(values.budget) : undefined,
      },
      {
        onSuccess: (chantier) => {
          void navigate(`/chantiers/${chantier.id}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        title="Nouveau chantier"
        description="Création d'un chantier — statut initial Préparation"
      />
      <div className="flex-1 p-5">
        <Link
          to="/chantiers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-hover"
        >
          <ArrowLeft size={14} />
          Retour à la liste
        </Link>
        <div className="max-w-3xl rounded-xl border border-border bg-white p-5 shadow-sm">
          <ChantierForm
            isSubmitting={createMutation.isPending}
            error={
              createMutation.isError
                ? extractErrorMessage(createMutation.error)
                : null
            }
            onSubmit={handleSubmit}
            onCancel={() => void navigate("/chantiers")}
          />
        </div>
      </div>
    </div>
  );
}
