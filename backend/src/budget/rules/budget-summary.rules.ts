/** RG-BUD-04 / RG-BUD-05 — agrégats budget (VALIDATED only côté appelant). */

export interface BudgetSummaryNumbers {
  budgetEnvelope: number | null;
  budgetConsumed: number;
  budgetRemaining: number | null;
  consumptionPercent: number | null;
  hasEnvelope: boolean;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}

export function computeBudgetSummary(
  budgetEnvelope: number | null | undefined,
  validatedConsumed: number,
): BudgetSummaryNumbers {
  const envelope =
    budgetEnvelope !== null && budgetEnvelope !== undefined
      ? roundMoney(budgetEnvelope)
      : null;
  const consumed = roundMoney(validatedConsumed);
  const hasEnvelope = envelope !== null && envelope > 0;
  const remaining = hasEnvelope ? roundMoney(envelope - consumed) : null;
  const consumptionPercent = hasEnvelope
    ? roundPercent((consumed / envelope) * 100)
    : null;

  return {
    budgetEnvelope: envelope,
    budgetConsumed: consumed,
    budgetRemaining: remaining,
    consumptionPercent,
    hasEnvelope,
  };
}

/** RG-BUD-02 — seuil 80 % atteint ou dépassé. */
export function isBudget80ThresholdReached(consumptionPercent: number | null): boolean {
  return consumptionPercent !== null && consumptionPercent >= 80;
}

/** RG-BUD-03 — seuil 100 % atteint ou dépassé. */
export function isBudget100ThresholdReached(consumptionPercent: number | null): boolean {
  return consumptionPercent !== null && consumptionPercent >= 100;
}

export function shouldCreateBudgetAlert(
  thresholdPercent: 80 | 100,
  consumptionPercent: number | null,
  alertEnabled: boolean,
  alreadyExists: boolean,
): boolean {
  if (!alertEnabled || alreadyExists || consumptionPercent === null) {
    return false;
  }
  if (thresholdPercent === 80) {
    return isBudget80ThresholdReached(consumptionPercent);
  }
  return isBudget100ThresholdReached(consumptionPercent);
}
