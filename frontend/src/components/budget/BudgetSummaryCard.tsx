import type { BudgetSummary } from "../../services/budgetService";
import { classNames } from "../../utils/classNames";
import { BudgetAlertBadge } from "./BudgetAlertBadge";

interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function progressBarColor(percent: number | null): string {
  if (percent === null) return "bg-slate-400";
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}

export function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  const percent = summary.consumptionPercent ?? 0;
  const barWidth =
    summary.consumptionPercent !== null
      ? Math.min(100, Math.max(0, summary.consumptionPercent))
      : 0;

  if (!summary.hasEnvelope) {
    return (
      <div
        className="rounded-xl border border-border bg-white p-5 shadow-sm"
        data-testid="budget-summary-card"
      >
        <h3 className="text-sm font-semibold text-slate-900">Synthèse budget</h3>
        <p className="mt-2 text-sm text-muted">
          Aucune enveloppe budgétaire définie pour ce chantier.
        </p>
        <p className="mt-1 text-sm text-slate-700">
          Dépenses validées : {formatCurrency(summary.budgetConsumed)}
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border border-border bg-white p-5 shadow-sm"
      data-testid="budget-summary-card"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Synthèse budget</h3>
          <p className="text-xs text-muted">
            Consommé sur dépenses validées uniquement
          </p>
        </div>
        <BudgetAlertBadge
          alert80Active={summary.alert80Active}
          alert100Active={summary.alert100Active}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Enveloppe
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900" data-testid="budget-envelope">
            {formatCurrency(summary.budgetEnvelope ?? 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Consommé
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900" data-testid="budget-consumed">
            {formatCurrency(summary.budgetConsumed)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Restant
          </p>
          <p
            className={classNames(
              "mt-0.5 text-sm font-semibold",
              (summary.budgetRemaining ?? 0) < 0 ? "text-red-600" : "text-emerald-600",
            )}
            data-testid="budget-remaining"
          >
            {formatCurrency(summary.budgetRemaining ?? 0)}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
            Consommation
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900" data-testid="budget-percent">
            {percent}%
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={classNames("h-full rounded-full transition-all", progressBarColor(summary.consumptionPercent))}
            style={{ width: `${barWidth}%` }}
            role="progressbar"
            aria-valuenow={barWidth}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
}
