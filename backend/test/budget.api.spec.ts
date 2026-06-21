import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { BudgetController } from '../src/budget/budget.controller';
import { BudgetService } from '../src/budget/budget.service';

describe('Budget API (TST-EVOL-003-03..04)', () => {
  let app: INestApplication<App>;

  const mockSummary = {
    projectId: 'c-1',
    projectReference: 'CHT-001',
    budgetEnvelope: 100_000,
    budgetConsumed: 85_000,
    budgetRemaining: 15_000,
    consumptionPercent: 85,
    hasEnvelope: true,
    alert80Active: true,
    alert100Active: false,
    resourceCount: 3,
    expenseCount: 8,
  };

  const mockExpense = {
    id: 'exp-1',
    projectId: 'c-1',
    category: 'Achat matériaux',
    label: 'Béton',
    amount: 15_000,
    expenseDate: '15/06/2025',
    status: 'Validée',
    createdByName: 'Marc Dupont',
    createdAt: '15/06/2025',
  };

  const budgetService = {
    listResources: jest.fn().mockResolvedValue([]),
    createResource: jest.fn().mockResolvedValue({
      id: 'res-1',
      projectId: 'c-1',
      type: 'Matériel',
      label: 'Grue',
      unitCost: 5000,
      quantity: 2,
      totalPlanned: 10_000,
      createdByName: 'Marc Dupont',
      createdAt: '15/06/2025',
    }),
    updateResource: jest.fn(),
    deleteResource: jest.fn().mockResolvedValue(undefined),
    listExpenses: jest.fn().mockResolvedValue([mockExpense]),
    createExpense: jest.fn().mockResolvedValue(mockExpense),
    updateExpense: jest.fn().mockResolvedValue(mockExpense),
    deleteExpense: jest.fn().mockResolvedValue(undefined),
    getSummary: jest.fn().mockResolvedValue(mockSummary),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BudgetController],
      providers: [{ provide: BudgetService, useValue: budgetService }],
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

  it('TST-EVOL-003-03 — CRUD dépense POST', async () => {
    await request(app.getHttpServer())
      .post('/api/chantiers/c-1/expenses')
      .send({
        category: 'ACHAT_MATERIAUX',
        label: 'Béton',
        amount: 15000,
        expenseDate: '2025-06-15',
      })
      .expect(201)
      .expect(mockExpense);
  });

  it('TST-EVOL-003-03 — RG-BUD-01 montant <= 0 rejeté', async () => {
    await request(app.getHttpServer())
      .post('/api/chantiers/c-1/expenses')
      .send({
        category: 'ACHAT_MATERIAUX',
        label: 'Invalid',
        amount: 0,
        expenseDate: '2025-06-15',
      })
      .expect(400);
  });

  it('TST-EVOL-003-03 — GET expenses liste', async () => {
    await request(app.getHttpServer())
      .get('/api/chantiers/c-1/expenses')
      .expect(200)
      .expect([mockExpense]);
  });

  it('TST-EVOL-003-04 — GET budget/summary', async () => {
    await request(app.getHttpServer())
      .get('/api/chantiers/c-1/budget/summary')
      .expect(200)
      .expect(mockSummary);
  });

  it('TST-EVOL-003-04 — summary inclut alertes 80/100', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api/chantiers/c-1/budget/summary')
      .expect(200);
    expect(body.alert80Active).toBe(true);
    expect(body.alert100Active).toBe(false);
    expect(body.budgetConsumed).toBe(85_000);
  });
});
