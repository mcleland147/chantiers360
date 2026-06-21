import type { ChantierDetail } from "../../types/domain";
import { isChantierLateFromEntity } from "../../utils/chantierRules";
import { BudgetCard } from "./BudgetCard";
import { ChantierInfoCard } from "./ChantierInfoCard";
import { PhaseStepper } from "./PhaseStepper";

interface ChantierInformationsTabProps {
  chantier: ChantierDetail;
}

export function ChantierInformationsTab({
  chantier,
}: ChantierInformationsTabProps) {
  const isLate = isChantierLateFromEntity(chantier);

  return (
    <div className="space-y-5">
      <PhaseStepper currentStatus={chantier.status} isLate={isLate} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChantierInfoCard chantier={chantier} />
        </div>
        <div>
          <BudgetCard chantier={chantier} />
        </div>
      </div>
    </div>
  );
}
