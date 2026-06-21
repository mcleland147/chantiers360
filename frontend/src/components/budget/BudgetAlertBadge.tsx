import { AlertTriangle } from "lucide-react";
import { classNames } from "../../utils/classNames";

interface BudgetAlertBadgeProps {
  alert80Active?: boolean;
  alert100Active?: boolean;
}

export function BudgetAlertBadge({
  alert80Active,
  alert100Active,
}: BudgetAlertBadgeProps) {
  if (!alert80Active && !alert100Active) return null;

  return (
    <div className="flex flex-wrap gap-2" data-testid="budget-alert-badges">
      {alert80Active && (
        <span
          className={classNames(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            "bg-amber-100 text-amber-800",
          )}
          data-testid="budget-alert-80"
        >
          <AlertTriangle size={12} />
          Alerte 80 %
        </span>
      )}
      {alert100Active && (
        <span
          className={classNames(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
            "bg-red-100 text-red-800",
          )}
          data-testid="budget-alert-100"
        >
          <AlertTriangle size={12} />
          Dépassement budget
        </span>
      )}
    </div>
  );
}
