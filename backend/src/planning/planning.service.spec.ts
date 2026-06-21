import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from '../history/history.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkersService } from '../workers/workers.service';
import { PlanningService } from './planning.service';

describe('PlanningService — RG-PLA-04 (TST-EVOL-002-09)', () => {
  let service: PlanningService;

  const prisma = {
    project: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    workerSchedule: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    assignment: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const workersService = {
    ensureActiveForScheduling: jest.fn(),
  };

  const historyService = {
    recordEvent: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        { provide: PrismaService, useValue: prisma },
        { provide: WorkersService, useValue: workersService },
        { provide: HistoryService, useValue: historyService },
      ],
    }).compile();

    service = module.get(PlanningService);
  });

  it('conducteur — POST refusé sur chantier non référent (403)', async () => {
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(
      service.createSlot(
        {
          workerId: 'w-1',
          projectId: 'c-2',
          startAt: '2025-06-16T08:00:00.000Z',
          endAt: '2025-06-16T12:00:00.000Z',
        },
        'u-conducteur',
        'CONDUCTEUR_TRAVAUX',
      ),
    ).rejects.toThrow(new ForbiddenException('Accès chantier refusé.'));
  });

  it('direction — POST créneau interdit (403)', async () => {
    await expect(
      service.createSlot(
        {
          workerId: 'w-1',
          projectId: 'c-1',
          startAt: '2025-06-16T08:00:00.000Z',
          endAt: '2025-06-16T12:00:00.000Z',
        },
        'u-direction',
        'DIRECTION',
      ),
    ).rejects.toThrow('Action réservée au conducteur de travaux.');
  });

  it('assistante — POST créneau interdit (403)', async () => {
    await expect(
      service.createSlot(
        {
          workerId: 'w-1',
          projectId: 'c-1',
          startAt: '2025-06-16T08:00:00.000Z',
          endAt: '2025-06-16T12:00:00.000Z',
        },
        'u-assistante',
        'ASSISTANTE_ADMINISTRATIVE',
      ),
    ).rejects.toThrow('Action réservée au conducteur de travaux.');
  });

  it('GET — conducteur filtré sur chantier hors périmètre retourne vide', async () => {
    prisma.project.findMany.mockResolvedValue([{ id: 'c-1' }]);

    const result = await service.findSlots(
      {
        from: '2025-06-16T00:00:00.000Z',
        to: '2025-06-23T00:00:00.000Z',
        projectId: 'c-2',
      },
      'u-conducteur',
      'CONDUCTEUR_TRAVAUX',
    );

    expect(result).toEqual([]);
    expect(prisma.workerSchedule.findMany).not.toHaveBeenCalled();
  });

  it('GET — conducteur limité aux chantiers référents', async () => {
    prisma.project.findMany.mockResolvedValue([{ id: 'c-1' }, { id: 'c-3' }]);
    prisma.workerSchedule.findMany.mockResolvedValue([]);

    await service.findSlots(
      {
        from: '2025-06-16T00:00:00.000Z',
        to: '2025-06-23T00:00:00.000Z',
      },
      'u-conducteur',
      'CONDUCTEUR_TRAVAUX',
    );

    expect(prisma.workerSchedule.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: { in: ['c-1', 'c-3'] },
        }),
      }),
    );
  });
});
