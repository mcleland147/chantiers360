import { isChantierLate } from './chantier.rules';

describe('chantier.rules — RG-001', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-20'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('retourne true si date fin dépassée et statut ≠ Clôture', () => {
    expect(isChantierLate('15/04/2025', 'Réalisation')).toBe(true);
  });

  it('retourne false si statut Clôture', () => {
    expect(isChantierLate('15/04/2025', 'Clôture')).toBe(false);
  });

  it('retourne false si date fin future', () => {
    expect(isChantierLate('31/12/2026', 'Réalisation')).toBe(false);
  });
});
