import { ConflictException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PlanningController } from '../src/planning/planning.controller';
import { PlanningService } from '../src/planning/planning.service';

describe('Planning API (TST-EVOL-002-03..04, 06)', () => {
  let app: INestApplication<App>;

  const mockSlot = {
    id: 'slot-1',
    workerId: 'w-1',
    workerName: 'Ahmed Benali',
    projectId: 'c-1',
    projectReference: 'CHT-001',
    projectName: 'Résidence Les Oliviers',
    startAt: '2025-06-16T08:00:00.000Z',
    endAt: '2025-06-16T12:00:00.000Z',
    status: 'Planifié',
    createdByName: 'Marc Dupont',
  };

  const mockKpi = {
    from: '2025-06-16T00:00:00.000Z',
    to: '2025-06-23T00:00:00.000Z',
    plannedHours: 16,
    referenceHoursPerWeek: 35,
    occupationPercent: 45.7,
    workers: [],
  };

  const planningService = {
    findSlots: jest.fn().mockResolvedValue([mockSlot]),
    createSlot: jest.fn().mockResolvedValue(mockSlot),
    updateSlot: jest.fn().mockResolvedValue(mockSlot),
    cancelSlot: jest.fn().mockResolvedValue({ ...mockSlot, status: 'Annulé' }),
    findConflicts: jest.fn().mockResolvedValue({ hasConflict: false }),
    getOccupationKpi: jest.fn().mockResolvedValue(mockKpi),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PlanningController],
      providers: [{ provide: PlanningService, useValue: planningService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: { switchToHttp: () => { getRequest: () => object } }) => {
          const req = ctx.switchToHttp().getRequest();
          Object.assign(req, {
            user: { id: 'u-conducteur', role: 'CONDUCTEUR_TRAVAUX' },
          });
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('TST-EVOL-002-03 — GET /planning retourne les créneaux', async () => {
    await request(app.getHttpServer())
      .get('/api/planning')
      .query({
        from: '2025-06-16T00:00:00.000Z',
        to: '2025-06-23T00:00:00.000Z',
      })
      .expect(200)
      .expect([mockSlot]);
  });

  it('TST-EVOL-002-03 — POST /planning/slots crée un créneau', async () => {
    await request(app.getHttpServer())
      .post('/api/planning/slots')
      .send({
        workerId: 'w-1',
        projectId: 'c-1',
        startAt: '2025-06-16T08:00:00.000Z',
        endAt: '2025-06-16T12:00:00.000Z',
      })
      .expect(201)
      .expect(mockSlot);
  });

  it('TST-EVOL-002-03 — PUT /planning/slots/:id modifie un créneau', async () => {
    await request(app.getHttpServer())
      .put('/api/planning/slots/slot-1')
      .send({ notes: 'Mise à jour' })
      .expect(200)
      .expect(mockSlot);
  });

  it('TST-EVOL-002-03 — DELETE /planning/slots/:id annule un créneau', async () => {
    await request(app.getHttpServer())
      .delete('/api/planning/slots/slot-1')
      .expect(200)
      .expect({ ...mockSlot, status: 'Annulé' });
  });

  it('TST-EVOL-002-04 — HTTP 409 en cas de conflit', async () => {
    planningService.createSlot.mockRejectedValueOnce(
      new ConflictException({
        message:
          'Conflit de planning — Ahmed Benali est déjà affecté sur CHT-001 le 16/06/2025 de 08:00 à 12:00.',
        conflict: mockSlot,
      }),
    );

    const res = await request(app.getHttpServer())
      .post('/api/planning/slots')
      .send({
        workerId: 'w-1',
        projectId: 'c-1',
        startAt: '2025-06-16T10:00:00.000Z',
        endAt: '2025-06-16T14:00:00.000Z',
      })
      .expect(409);

    expect(res.body.message.message).toMatch(/Conflit de planning/);
    expect(res.body.message.message).toMatch(/CHT-001/);
  });

  it('TST-EVOL-002-06 — GET /planning/kpi/occupation', async () => {
    await request(app.getHttpServer())
      .get('/api/planning/kpi/occupation')
      .query({
        from: '2025-06-16T00:00:00.000Z',
        to: '2025-06-23T00:00:00.000Z',
      })
      .expect(200)
      .expect(mockKpi);
  });
});
