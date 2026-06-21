import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProjectResource } from "../../services/budgetService";

const RESOURCE_TYPES = [
  "MAIN_OEUVRE",
  "MATERIEL",
  "SOUS_TRAITANT",
  "AUTRE",
] as const;

interface ResourceTableProps {
  resources: ProjectResource[];
  canWrite: boolean;
  onCreate: (payload: {
    type: string;
    label: string;
    unitCost: number;
    quantity: number;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isPending?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ResourceTable({
  resources,
  canWrite,
  onCreate,
  onDelete,
  isPending,
}: ResourceTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<string>(RESOURCE_TYPES[0]);
  const [label, setLabel] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cost = Number(unitCost);
    const qty = Number(quantity);
    if (!label.trim() || cost <= 0 || qty <= 0) {
      setError("Libellé, coût unitaire et quantité requis (> 0).");
      return;
    }
    await onCreate({ type, label: label.trim(), unitCost: cost, quantity: qty });
    setLabel("");
    setUnitCost("");
    setQuantity("1");
    setShowForm(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm" data-testid="resource-table">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Ressources prévues</h3>
        {canWrite && (
          <button
            type="button"
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white"
            onClick={() => setShowForm((v) => !v)}
            data-testid="resource-add-btn"
          >
            {showForm ? "Annuler" : "Ajouter"}
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <form onSubmit={handleSubmit} className="border-b border-border bg-slate-50 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Libellé"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Coût unitaire"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Quantité"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Enregistrer
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs text-muted">
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Libellé</th>
              <th className="px-4 py-2 font-medium">Coût unit.</th>
              <th className="px-4 py-2 font-medium">Qté</th>
              <th className="px-4 py-2 font-medium">Total prévu</th>
              {canWrite && <th className="px-4 py-2" />}
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 6 : 5} className="px-4 py-6 text-center text-muted">
                  Aucune ressource budgétée
                </td>
              </tr>
            ) : (
              resources.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{row.type}</td>
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-4 py-2 font-mono">{formatCurrency(row.unitCost)}</td>
                  <td className="px-4 py-2">{row.quantity}</td>
                  <td className="px-4 py-2 font-mono">{formatCurrency(row.totalPlanned)}</td>
                  {canWrite && (
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        aria-label="Supprimer"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => void onDelete(row.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
