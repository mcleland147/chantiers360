import { Test, TestingModule } from '@nestjs/testing';
import { computeConducteurKpis, buildAlertsFromData, computeBudgetOverview } from './dashboard.helpers';
import { buildChantierResponse } from '../common/builders/chantier-response.builder';
import { ProjectWithRelations } from '../projects/repositories/projects.repository';

describe('dashboard.helpers — Phase H', () => {
  const mockProject = {
    id: 'p-1',
    reference: 'CHT-003',
    name: 'Immeuble Haussmann',
    client: 'Client',
    address: 'Paris',
    budget: 5_800_000,
    startDate: new Date('2024-01-10'),
    expectedEndDate: new Date('2025-04-15'),
    receptionDate: null,
    status: 'REALISATION' as const,
    conductorId: 'u-conducteur',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2025-05-14'),
    conductor: {
      id: 'u-conducteur',
      firstName: 'Marc',
      lastName: 'Dupont',
      email: 'conducteur@batinova.fr',
      passwordHash: '',
      isActive: true,
      roleId: 'r1',
      createdAt: new Date(),
      updatedAt: new Date(),
      role: { id: 'r1', name: 'CONDUCTEUR_TRAVAUX' as const, description: '' },
    },
    issues: [{ status: 'EN_COURS' as const }],
    progress: [{ progressRatio: 45 }],
    _count: { issues: 2 },
  } satisfies ProjectWithRelations;

  const chantier = buildChantierResponse(mockProject, 1_640_000);

  it('T-H-RG-005 — calcule KPI conducteur depuis données réelles', () => {
    const issues = [
      {
        id: 'i-1',
        projectId: 'p-1',
        title: 'Critique',
        description: '',
        priority: 'CRITIQUE' as const,
        status: 'EN_COURS' as const,
        createdById: 'u-chef',
        closedById: null,
        createdAt: new Date('2025-05-12'),
        closedAt: null,
        project: mockProject,
      },
    ];

    const kpis = computeConducteurKpis(
      [chantier],
      issues,
      new Date('2025-06-20'),
    );

    expect(kpis.activeChantiers).toBe(1);
    expect(kpis.lateChantiers).toBe(1);
    expect(kpis.openReserves).toBe(1);
    expect(kpis.criticalReserves).toBe(1);
  });

  it('T-H-RG-006 — génère alertes retard et réserve critique', () => {
    const issues = [
      {
        id: 'i-1',
        projectId: 'p-1',
        title: 'Critique',
        description: '',
        priority: 'CRITIQUE' as const,
        status: 'EN_COURS' as const,
        createdById: 'u-chef',
        closedById: null,
        createdAt: new Date('2025-05-12'),
        closedAt: null,
        project: mockProject,
      },
    ];

    const alerts = buildAlertsFromData(
      [chantier],
      issues,
      new Date('2025-06-20'),
    );

    expect(alerts.some((a) => a.type === 'RETARD_CHANTIER')).toBe(true);
    expect(alerts.some((a) => a.type === 'RESERVE_CRITIQUE')).toBe(true);
  });

  it('TST-EVOL-003-05 — dashboard budget réel (VALIDATED via budgetSpent)', () => {
    const chantiers = [
      buildChantierResponse(mockProject, 4_700_000),
      buildChantierResponse(
        { ...mockProject, id: 'p-2', budget: 200_000 },
        50_000,
      ),
    ];
    const overview = computeBudgetOverview(chantiers);
    expect(overview.totalSpent).toBe(4_750_000);
    expect(overview.totalRemaining).toBeGreaterThan(0);
    expect(overview.chantiersOver80).toBe(1);
    expect(overview.consumptionPercent).toBeGreaterThan(0);
  });
});
