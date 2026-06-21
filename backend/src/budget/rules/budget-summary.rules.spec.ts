import {
  computeBudgetSummary,
  isBudget100ThresholdReached,
  isBudget80ThresholdReached,
  shouldCreateBudgetAlert,
} from './budget-summary.rules';

describe('budget-summary.rules — TST-EVOL-003-01', () => {
  it('TST-EVOL-003-01 — budget restant = enveloppe − consommé VALIDATED', () => {
    const summary = computeBudgetSummary(100_000, 85_000);
    expect(summary.budgetConsumed).toBe(85_000);
    expect(summary.budgetRemaining).toBe(15_000);
    expect(summary.consumptionPercent).toBe(85);
  });

  it('TST-EVOL-003-01 — enveloppe absente sans erreur', () => {
    const summary = computeBudgetSummary(null, 12_000);
    expect(summary.hasEnvelope).toBe(false);
    expect(summary.budgetRemaining).toBeNull();
    expect(summary.consumptionPercent).toBeNull();
    expect(summary.budgetConsumed).toBe(12_000);
  });
});

describe('budget-summary.rules — TST-EVOL-003-02 alertes', () => {
  it('TST-EVOL-003-02 — seuil 80 % détecté', () => {
    expect(isBudget80ThresholdReached(79)).toBe(false);
    expect(isBudget80ThresholdReached(80)).toBe(true);
    expect(isBudget80ThresholdReached(85)).toBe(true);
  });

  it('TST-EVOL-003-02 — seuil 100 % détecté', () => {
    expect(isBudget100ThresholdReached(99)).toBe(false);
    expect(isBudget100ThresholdReached(100)).toBe(true);
    expect(isBudget100ThresholdReached(101)).toBe(true);
  });

  it('TST-EVOL-003-02 — idempotence création alerte (une seule par seuil)', () => {
    expect(shouldCreateBudgetAlert(80, 81, true, false)).toBe(true);
    expect(shouldCreateBudgetAlert(80, 85, true, true)).toBe(false);
    expect(shouldCreateBudgetAlert(100, 101, true, false)).toBe(true);
    expect(shouldCreateBudgetAlert(100, 105, true, true)).toBe(false);
  });
});

describe('budget-summary.rules — VALIDATED only (RG-BUD-05)', () => {
  it('agrégat reçoit uniquement le total VALIDATED (appelant filtre)', () => {
    const validatedOnly = 50_000;
    const summary = computeBudgetSummary(100_000, validatedOnly);
    expect(summary.budgetConsumed).toBe(50_000);
    expect(summary.budgetRemaining).toBe(50_000);
  });
});
