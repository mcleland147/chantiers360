import {
  canAddPhoto,
  canAddProgressUpdate,
  canAssignMember,
  canCreateReserve,
  canTakeChargeReserve,
  canValidateReserveLevee,
  validateAssignmentFields,
  validatePhotoFields,
  validateProgressComment,
  validateProgressPercent,
  validateReserveFields,
  validateReserveLeveeTransition,
  validateReservePriseEnChargeTransition,
} from './chantier-tabs.rules';

describe('chantier-tabs.rules', () => {
  it('T-G-TABS-RG-001 — commentaire avancement obligatoire', () => {
    expect(validateProgressComment('')).toContain('RG-TABS-001');
    expect(validateProgressComment('  ')).toContain('RG-TABS-001');
    expect(validateProgressComment('Travaux OK')).toBeNull();
  });

  it('T-G-TABS-RG-002 — pourcentage avancement 0-100', () => {
    expect(validateProgressPercent(-1)).toContain('RG-TABS-002');
    expect(validateProgressPercent(101)).toContain('RG-TABS-002');
    expect(validateProgressPercent(50.5)).toContain('RG-TABS-002');
    expect(validateProgressPercent(undefined)).toBeNull();
    expect(validateProgressPercent(67)).toBeNull();
  });

  it('T-G-TABS-RG-003 — champs réserve obligatoires', () => {
    expect(
      validateReserveFields({ title: '', priority: 'HAUTE' }),
    ).toContain('RG-TABS-003');
    expect(
      validateReserveFields({ title: 'Fissure', priority: undefined }),
    ).toContain('RG-TABS-003');
    expect(
      validateReserveFields({ title: 'Fissure', priority: 'CRITIQUE' }),
    ).toBeNull();
  });

  it('T-G-TABS-RG-004 — levée réserve depuis En cours uniquement', () => {
    expect(validateReserveLeveeTransition('OUVERTE')).toContain('RG-TABS-004');
    expect(validateReserveLeveeTransition('LEVEE')).toContain('RG-TABS-004');
    expect(validateReserveLeveeTransition('EN_COURS')).toBeNull();
  });

  it('T-J-RG-001 — prise en charge depuis Ouverte uniquement', () => {
    expect(validateReservePriseEnChargeTransition('EN_COURS')).toContain(
      'RG-TABS-008',
    );
    expect(validateReservePriseEnChargeTransition('LEVEE')).toContain(
      'RG-TABS-008',
    );
    expect(validateReservePriseEnChargeTransition('OUVERTE')).toBeNull();
  });

  it('T-G-TABS-RG-005 — champs photo obligatoires', () => {
    expect(validatePhotoFields({ fileName: '', category: 'Avant travaux' })).toContain(
      'RG-TABS-005',
    );
    expect(validatePhotoFields({ fileName: 'photo.jpg', category: '' })).toContain(
      'RG-TABS-005',
    );
    expect(
      validatePhotoFields({ fileName: 'photo.jpg', category: 'Avant travaux' }),
    ).toBeNull();
  });

  it('T-G-TABS-RG-006 — champs affectation obligatoires', () => {
    expect(
      validateAssignmentFields({ userId: '', functionLabel: 'Chef' }),
    ).toContain('RG-TABS-006');
    expect(
      validateAssignmentFields({ userId: 'u-chef', functionLabel: '' }),
    ).toContain('RG-TABS-006');
    expect(
      validateAssignmentFields({ userId: 'u-chef', functionLabel: 'Chef de chantier' }),
    ).toBeNull();
  });

  it('T-G-TABS-RG-007 — permissions par rôle', () => {
    expect(canAssignMember('CONDUCTEUR_TRAVAUX')).toBe(true);
    expect(canAssignMember('CHEF_CHANTIER')).toBe(false);
    expect(canAddProgressUpdate('CHEF_CHANTIER')).toBe(true);
    expect(canAddProgressUpdate('DIRECTION')).toBe(false);
    expect(canCreateReserve('CHEF_CHANTIER')).toBe(true);
    expect(canTakeChargeReserve('CHEF_CHANTIER')).toBe(true);
    expect(canTakeChargeReserve('DIRECTION')).toBe(false);
    expect(canValidateReserveLevee('CONDUCTEUR_TRAVAUX')).toBe(true);
    expect(canValidateReserveLevee('CHEF_CHANTIER')).toBe(false);
    expect(canAddPhoto('CONDUCTEUR_TRAVAUX')).toBe(true);
    expect(canAddPhoto('ASSISTANTE_ADMINISTRATIVE')).toBe(false);
  });
});
