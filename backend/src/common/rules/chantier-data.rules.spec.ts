import { ProjectStatus } from '@prisma/client';
import {
  getInitialProjectStatus,
  isBackwardStatusTransition,
  isValidStatusTransition,
  requiresStatusChangeReason,
  validateChantierFields,
  validateChantierClosure,
  validateStatusChange,
} from './chantier-data.rules';

describe('chantier-data.rules — Phase G', () => {
  const validFields = {
    reference: 'CHT-001',
    name: 'Résidence Les Oliviers',
    client: 'Mairie de Lyon',
    address: '12 rue des Oliviers',
    conductorId: 'u-conducteur',
    startDate: new Date('2024-03-01'),
    expectedEndDate: new Date('2025-09-30'),
  };

  it('T-G-RG-001 — valide référence et champs obligatoires', () => {
    expect(validateChantierFields(validFields)).toBeNull();
    expect(
      validateChantierFields({ ...validFields, reference: 'INVALID' }),
    ).not.toBeNull();
    expect(validateChantierFields({ ...validFields, name: '' })).not.toBeNull();
  });

  it('T-G-RG-002 — statut initial Préparation à la création', () => {
    expect(getInitialProjectStatus()).toBe('PREPARATION');
  });

  it('T-G-RG-003 — autorise uniquement les transitions ±1', () => {
    expect(
      isValidStatusTransition('PREPARATION', 'PLANIFICATION'),
    ).toBe(true);
    expect(
      isValidStatusTransition('PREPARATION', 'DEMARRAGE'),
    ).toBe(false);
    expect(isValidStatusTransition('REALISATION', 'RECEPTION')).toBe(
      true,
    );
  });

  it('T-G-RG-004 — motif obligatoire en retour arrière', () => {
    expect(
      isBackwardStatusTransition('REALISATION', 'DEMARRAGE'),
    ).toBe(true);
    expect(
      requiresStatusChangeReason('REALISATION', 'DEMARRAGE'),
    ).toBe(true);
    expect(
      validateStatusChange('REALISATION', 'DEMARRAGE', undefined),
    ).toContain('RG-DATA-004');
    expect(
      validateStatusChange(
        'REALISATION',
        'DEMARRAGE',
        'Retard livraison matériaux',
      ),
    ).toBeNull();
    expect(
      validateStatusChange('DEMARRAGE', 'REALISATION', undefined),
    ).toBeNull();
  });

  it('T-J-RG-002 — clôture interdite si réserves ouvertes (REC-013)', () => {
    expect(validateChantierClosure(1)).toContain('REC-013');
    expect(validateChantierClosure(0)).toBeNull();
    expect(
      validateStatusChange('RECEPTION', 'CLOTURE', undefined, 2),
    ).toContain('REC-013');
    expect(
      validateStatusChange('RECEPTION', 'CLOTURE', undefined, 0),
    ).toBeNull();
  });
});
