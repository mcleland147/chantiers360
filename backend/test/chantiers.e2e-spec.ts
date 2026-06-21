import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { ChantierTabsService } from '../src/projects/chantier-tabs.service';
import { ProjectsService } from '../src/projects/projects.service';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsRepository } from '../src/projects/repositories/projects.repository';
import { HistoryService } from '../src/history/history.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Chantiers API (Supertest)', () => {
  let app: INestApplication<App>;
  const mockProject = {
    id: 'c-1',
    reference: 'CHT-001',
    name: 'Résidence Les Oliviers',
    client: 'Mairie de Lyon',
    address: '12 rue des Oliviers, Lyon 69003',
    conductorId: 'u-conducteur',
    conductorName: 'Marc Dupont',
    status: 'Réalisation',
    startDate: '01/03/2024',
    expectedEndDate: '30/09/2025',
    budget: 2450000,
    budgetSpent: 0,
    openReservesCount: 0,
    description: '',
  };

  const projectsService = {
    findAll: jest.fn().mockResolvedValue([mockProject]),
    findOne: jest.fn().mockResolvedValue(mockProject),
    create: jest.fn().mockResolvedValue({
      ...mockProject,
      id: 'c-new',
      reference: 'CHT-099',
      name: 'Nouveau chantier',
      status: 'Préparation',
    }),
    update: jest.fn().mockResolvedValue(mockProject),
    changeStatus: jest.fn().mockResolvedValue({
      ...mockProject,
      status: 'Réception',
    }),
    getHistory: jest.fn().mockResolvedValue([
      {
        id: 'h-1',
        date: '20/06/2025 10:00',
        authorName: 'Marc Dupont',
        action: 'Création chantier',
        newValue: 'CHT-099 — Nouveau chantier',
      },
    ]),
  };

  const chantierTabsService = {
    getAssignments: jest.fn().mockResolvedValue([]),
    getProgress: jest.fn().mockResolvedValue([]),
    getReserves: jest.fn().mockResolvedValue([]),
    getPhotos: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: projectsService },
        { provide: ChantierTabsService, useValue: chantierTabsService },
        { provide: ProjectsRepository, useValue: {} },
        { provide: HistoryService, useValue: {} },
        { provide: PrismaService, useValue: {} },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { user: object } };
        }) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'u-conducteur', email: 'conducteur@batinova.fr', role: 'CONDUCTEUR_TRAVAUX' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('T-G-API-001 — GET /api/chantiers liste les chantiers (auth mockée)', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(1);
        expect(res.body[0].reference).toBe('CHT-001');
        expect(res.body[0].status).toBe('Réalisation');
      });
  });

  it('T-G-API-002 — POST /api/chantiers crée un chantier', () => {
    return request(app.getHttpServer())
      .post('/api/chantiers')
      .set('Authorization', 'Bearer mock-token')
      .send({
        reference: 'CHT-099',
        name: 'Nouveau chantier',
        client: 'Client test',
        address: '1 rue Test',
        conductorId: 'u-conducteur',
        startDate: '2025-01-01',
        expectedEndDate: '2025-12-31',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.reference).toBe('CHT-099');
        expect(res.body.status).toBe('Préparation');
      });
  });

  it('T-G-API-003 — PATCH /api/chantiers/:id/status change le statut', () => {
    return request(app.getHttpServer())
      .patch('/api/chantiers/c-1/status')
      .set('Authorization', 'Bearer mock-token')
      .send({ status: 'Réception' })
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('Réception');
      });
  });

  it('T-G-API-004 — POST /api/chantiers rejette référence invalide', () => {
    return request(app.getHttpServer())
      .post('/api/chantiers')
      .set('Authorization', 'Bearer mock-token')
      .send({
        reference: 'BAD',
        name: 'Test',
        client: 'Client',
        address: 'Adresse',
        conductorId: 'u-conducteur',
        startDate: '2025-01-01',
        expectedEndDate: '2025-12-31',
      })
      .expect(400);
  });

  it('T-G-API-005 — GET /api/chantiers/:id/history retourne historique', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers/c-1/history')
      .expect(200)
      .expect((res) => {
        expect(res.body[0].action).toBe('Création chantier');
      });
  });
});
