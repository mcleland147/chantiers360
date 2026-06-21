import { Check } from "lucide-react";
import { Fragment } from "react";
import type { ChantierStatus } from "../../types/domain";
import { classNames } from "../../utils/classNames";

const PHASES: ChantierStatus[] = [
  "Préparation",
  "Planification",
  "Démarrage",
  "Réalisation",
  "Réception",
  "Clôture",
];

interface PhaseStepperProps {
  currentStatus: ChantierStatus;
  isLate?: boolean;
}

export function PhaseStepper({ currentStatus, isLate }: PhaseStepperProps) {
  const currentIndex = PHASES.indexOf(currentStatus);

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">
          Cycle de vie du chantier
        </h3>
        {isLate && (
          <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
            Indicateur retard actif
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <ol className="flex min-w-[540px] items-start">
          {PHASES.map((phase, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <Fragment key={phase}>
                {index > 0 && (
                  <li
                    className="flex min-w-0 flex-1 list-none items-center self-start pt-4"
                    aria-hidden
                  >
                    <div
                      className={classNames(
                        "h-0.5 w-full",
                        index <= currentIndex ? "bg-accent" : "bg-border",
                      )}
                    />
                  </li>
                )}
                <li className="flex shrink-0 flex-col items-center">
                  <div
                    className={classNames(
                      "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                      isCurrent &&
                        "border-accent bg-accent text-white shadow-sm shadow-accent/30",
                      isPast && "border-accent bg-accent/10 text-accent",
                      isFuture && "border-border bg-white text-muted",
                    )}
                  >
                    {isPast ? <Check size={14} /> : index + 1}
                  </div>
                  <span
                    className={classNames(
                      "mt-2 max-w-[72px] text-center text-[10px] leading-tight font-medium",
                      isCurrent
                        ? "text-accent"
                        : isPast
                          ? "text-slate-700"
                          : "text-muted",
                    )}
                  >
                    {phase}
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
