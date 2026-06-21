import { useState } from "react";
import type { ChantierDetail } from "../../types/domain";
import { conductorOptions, isoDateToInput } from "../../data/conductors";

export interface ChantierFormValues {
  reference: string;
  name: string;
  client: string;
  address: string;
  conductorId: string;
  startDate: string;
  expectedEndDate: string;
  budget: string;
}

interface ChantierFormProps {
  initial?: Partial<ChantierDetail>;
  isEdit?: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onSubmit: (values: ChantierFormValues) => void;
  onCancel: () => void;
}

function buildInitialValues(initial?: Partial<ChantierDetail>): ChantierFormValues {
  return {
    reference: initial?.reference ?? "",
    name: initial?.name ?? "",
    client: initial?.client ?? "",
    address: initial?.address ?? "",
    conductorId: initial?.conductorId ?? conductorOptions[0].id,
    startDate: initial?.startDate ? isoDateToInput(initial.startDate) : "",
    expectedEndDate: initial?.expectedEndDate
      ? isoDateToInput(initial.expectedEndDate)
      : "",
    budget: initial?.budget ? String(initial.budget) : "",
  };
}

export function ChantierForm({
  initial,
  isEdit = false,
  isSubmitting = false,
  error,
  onSubmit,
  onCancel,
}: ChantierFormProps) {
  const [values, setValues] = useState<ChantierFormValues>(() =>
    buildInitialValues(initial),
  );

  const update = (field: keyof ChantierFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="chantier-form">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block text-sm" htmlFor="chantier-reference">
          <span className="mb-1 block font-medium text-slate-900">Référence</span>
          <input
            id="chantier-reference"
            required
            disabled={isEdit}
            value={values.reference}
            onChange={(e) => update("reference", e.target.value)}
            placeholder="CHT-099"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm disabled:bg-slate-50"
          />
        </label>
        <label className="block text-sm" htmlFor="chantier-name">
          <span className="mb-1 block font-medium text-slate-900">Nom du chantier</span>
          <input
            id="chantier-name"
            required
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm" htmlFor="chantier-client">
          <span className="mb-1 block font-medium text-slate-900">Client</span>
          <input
            id="chantier-client"
            required
            value={values.client}
            onChange={(e) => update("client", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-900">Conducteur</span>
          <select
            required
            value={values.conductorId}
            onChange={(e) => update("conductorId", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          >
            {conductorOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm md:col-span-2" htmlFor="chantier-address">
          <span className="mb-1 block font-medium text-slate-900">Adresse</span>
          <input
            id="chantier-address"
            required
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm" htmlFor="chantier-start-date">
          <span className="mb-1 block font-medium text-slate-900">Date de début</span>
          <input
            id="chantier-start-date"
            required
            type="date"
            value={values.startDate}
            onChange={(e) => update("startDate", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm" htmlFor="chantier-end-date">
          <span className="mb-1 block font-medium text-slate-900">Date fin prévue</span>
          <input
            id="chantier-end-date"
            required
            type="date"
            value={values.expectedEndDate}
            onChange={(e) => update("expectedEndDate", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-900">Budget (€)</span>
          <input
            type="number"
            min={0}
            value={values.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </label>
      </div>

      {!isEdit && (
        <p className="text-xs text-muted">
          Le statut initial sera « Préparation » (RG-DATA-002).
        </p>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {isSubmitting ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le chantier"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
