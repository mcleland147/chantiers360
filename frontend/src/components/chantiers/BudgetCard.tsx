import { Euro, TrendingDown, TrendingUp } from "lucide-react";
import type { ChantierDetail } from "../../types/domain";
import { classNames } from "../../utils/classNames";

interface BudgetCardProps {
  chantier: ChantierDetail;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BudgetCard({ chantier }: BudgetCardProps) {
  const { budget, budgetSpent } = chantier;
  const remaining = budget - budgetSpent;
  const percentUsed = budget > 0 ? Math.round((budgetSpent / budget) * 100) : 0;
  const isOverBudget = budgetSpent > budget;

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
          <Euro size={15} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Budget</h3>
          <p className="text-xs text-muted">Suivi financier du chantier</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Budget total</span>
          <span className="font-mono font-semibold text-slate-900">
            {formatCurrency(budget)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Dépensé</span>
          <span className="font-mono font-semibold text-slate-900">
            {formatCurrency(budgetSpent)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Restant</span>
          <span
            className={classNames(
              "font-mono font-semibold",
              isOverBudget ? "text-red-600" : "text-emerald-600",
            )}
          >
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-muted">Consommation</span>
          <span
            className={classNames(
              "font-mono font-medium",
              percentUsed > 90 ? "text-red-600" : "text-slate-700",
            )}
          >
            {percentUsed}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={classNames(
              "h-full rounded-full transition-all",
              percentUsed > 90 ? "bg-red-500" : "bg-accent",
            )}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted">
          {isOverBudget ? (
            <>
              <TrendingUp size={12} className="text-red-500" />
              Dépassement budgétaire
            </>
          ) : (
            <>
              <TrendingDown size={12} className="text-emerald-500" />
              Dans les limites prévues
            </>
          )}
        </div>
      </div>
    </div>
  );
}
