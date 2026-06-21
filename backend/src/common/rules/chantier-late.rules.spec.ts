import { isActiveProject, isProjectLate } from './chantier-late.rules';

describe('chantier-late.rules — RG-001', () => {
  const now = new Date('2025-06-20');

  it('T-H-RG-001 — retard si date dépassée et statut actif', () => {
    expect(
      isProjectLate(new Date('2025-04-15'), 'REALISATION', now),
    ).toBe(true);
  });

  it('T-H-RG-002 — pas de retard si statut Clôture', () => {
    expect(
      isProjectLate(new Date('2025-04-15'), 'CLOTURE', now),
    ).toBe(false);
  });

  it('T-H-RG-003 — pas de retard si date future', () => {
    expect(
      isProjectLate(new Date('2025-12-31'), 'REALISATION', now),
    ).toBe(false);
  });

  it('T-H-RG-004 — chantier actif exclut Clôture', () => {
    expect(isActiveProject('REALISATION')).toBe(true);
    expect(isActiveProject('CLOTURE')).toBe(false);
  });
});
