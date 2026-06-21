import { Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProjectExpense } from "../../services/budgetService";
import { classNames } from "../../utils/classNames";

const EXPENSE_CATEGORIES = [
  "ACHAT_MATERIAUX",
  "LOCATION",
  "SOUS_TRAITANCE",
  "MAIN_OEUVRE",
  "FRAIS_GENERAUX",
  "AUTRE",
] as const;

interface ExpenseTableProps {
  expenses: ProjectExpense[];
  canWrite: boolean;
  onCreate: (payload: {
    category: string;
    label: string;
    amount: number;
    expenseDate: string;
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

function statusClass(status: string): string {
  if (status === "Validée") return "bg-emerald-100 text-emerald-800";
  if (status === "Brouillon") return "bg-slate-100 text-slate-600";
  return "bg-red-100 text-red-700";
}

export function ExpenseTable({
  expenses,
  canWrite,
  onCreate,
  onDelete,
  isPending,
}: ExpenseTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!label.trim() || value <= 0 || !expenseDate) {
      setError("Libellé, montant (> 0) et date requis.");
      return;
    }
    await onCreate({
      category,
      label: label.trim(),
      amount: value,
      expenseDate,
    });
    setLabel("");
    setAmount("");
    setExpenseDate("");
    setShowForm(false);
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm" data-testid="expense-table">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Dépenses</h3>
        {canWrite && (
          <button
            type="button"
            className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white"
            onClick={() => setShowForm((v) => !v)}
            data-testid="expense-add-btn"
          >
            {showForm ? "Annuler" : "Ajouter dépense"}
          </button>
        )}
      </div>

      {showForm && canWrite && (
        <form onSubmit={handleSubmit} className="border-b border-border bg-slate-50 p-4 space-y-3" data-testid="expense-form">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Libellé"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              data-testid="expense-label"
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              data-testid="expense-amount"
            />
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
              data-testid="expense-date"
            />
          </div>
          {error && <p className="text-xs text-red-600" data-testid="expense-form-error">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            data-testid="expense-submit"
          >
            Enregistrer
          </button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-slate-50 text-left text-xs text-muted">
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Libellé</th>
              <th className="px-4 py-2 font-medium">Catégorie</th>
              <th className="px-4 py-2 font-medium">Montant</th>
              <th className="px-4 py-2 font-medium">Statut</th>
              {canWrite && <th className="px-4 py-2" />}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={canWrite ? 6 : 5} className="px-4 py-6 text-center text-muted">
                  Aucune dépense enregistrée
                </td>
              </tr>
            ) : (
              expenses.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2">{row.expenseDate}</td>
                  <td className="px-4 py-2">{row.label}</td>
                  <td className="px-4 py-2">{row.category}</td>
                  <td className="px-4 py-2 font-mono">{formatCurrency(row.amount)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={classNames(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        statusClass(row.status),
                      )}
                    >
                      {row.status}
                    </span>
                  </td>
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
