import {
  Controller,
  Get,
  INestApplication,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { DashboardController } from '../src/dashboard/dashboard.controller';
import { DashboardService } from '../src/dashboard/dashboard.service';

describe('Dashboard API (Supertest)', () => {
  let app: INestApplication<App>;

  const dashboardService = {
    getConducteurDashboard: jest.fn().mockResolvedValue({
      kpis: {
        activeChantiers: 4,
        lateChantiers: 2,
        openReserves: 5,
        criticalReserves: 2,
      },
      alerts: [],
      recentChantiers: [],
      recentReserves: [],
    }),
    getDirectionDashboard: jest.fn().mockResolvedValue({
      kpis: {
        totalChantiers: 20,
        lateChantiers: 3,
        openReserves: 12,
        criticalReserves: 4,
      },
      atRiskChantiers: [],
      statusDistribution: [],
      conductorDistribution: [],
      monthlyTrend: [],
      budget: { totalBudget: 100, totalSpent: 50, chantierCount: 20 },
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'test-secret' }),
      ],
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: dashboardService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: object } };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'u-conducteur',
            email: 'conducteur@batinova.fr',
            role: 'CONDUCTEUR_TRAVAUX',
          };
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

  it('T-H-API-001 — GET /api/dashboard/conducteur', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/conducteur')
      .set('Authorization', 'Bearer test')
      .expect(200)
      .expect((res) => {
        expect(res.body.kpis.activeChantiers).toBe(4);
        expect(res.body.kpis.criticalReserves).toBe(2);
      });
  });

  it('T-H-API-002 — GET /api/dashboard/direction', async () => {
    const directionModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'test-secret' }),
      ],
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: dashboardService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: object } };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = {
            id: 'u-direction',
            email: 'direction@batinova.fr',
            role: 'DIRECTION',
          };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const directionApp = directionModule.createNestApplication();
    directionApp.setGlobalPrefix('api');
    await directionApp.init();

    await request(directionApp.getHttpServer())
      .get('/api/dashboard/direction')
      .set('Authorization', 'Bearer test')
      .expect(200)
      .expect((res) => {
        expect(res.body.kpis.totalChantiers).toBe(20);
      });

    await directionApp.close();
  });
});
