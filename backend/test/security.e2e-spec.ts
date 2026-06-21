import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { IssuesController } from '../src/issues/issues.controller';
import { PhotosController } from '../src/photos/photos.controller';
import { ChantierTabsService } from '../src/projects/chantier-tabs.service';
import { PhotosService } from '../src/photos/photos.service';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsService } from '../src/projects/projects.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';
import { DashboardController } from '../src/dashboard/dashboard.controller';
import { DashboardService } from '../src/dashboard/dashboard.service';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  configureCors,
  configureSwagger,
} from '../src/bootstrap/app-config';

describe('Security API — Phase K1 (Supertest)', () => {
  let app: INestApplication<App>;
  let conducteurToken: string;

  const mockProject = {
    id: 'c-1',
    reference: 'CHT-001',
    name: 'Résidence Les Oliviers',
    status: 'Réalisation',
  };

  const mockUser = {
    id: 'u-conducteur',
    firstName: 'Marc',
    lastName: 'Dupont',
    email: 'conducteur@batinova.fr',
    passwordHash: '',
    isActive: true,
    roleId: 'role-1',
    role: { id: 'role-1', name: 'CONDUCTEUR_TRAVAUX' as const, description: '' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prisma = {
    user: { findUnique: jest.fn() },
    issue: { findMany: jest.fn().mockResolvedValue([]) },
    photo: { findMany: jest.fn().mockResolvedValue([]) },
    assignment: { findMany: jest.fn().mockResolvedValue([]) },
    project: { findMany: jest.fn().mockResolvedValue([]) },
  };

  const projectsService = {
    findAll: jest.fn().mockResolvedValue([mockProject]),
    findOne: jest.fn().mockResolvedValue(mockProject),
    getHistory: jest.fn().mockResolvedValue([]),
    findAssigned: jest.fn().mockResolvedValue([]),
  };

  const chantierTabsService = {
    getAssignments: jest.fn().mockResolvedValue([]),
    getProgress: jest.fn().mockResolvedValue([]),
    getReserves: jest.fn().mockResolvedValue([]),
    getPhotos: jest.fn().mockResolvedValue([]),
    findAllReserves: jest.fn().mockResolvedValue([]),
    findAllPhotos: jest.fn().mockResolvedValue([]),
  };

  const dashboardService = {
    getConducteurDashboard: jest.fn().mockResolvedValue({ kpis: {} }),
    getDirectionDashboard: jest.fn().mockResolvedValue({ kpis: {} }),
  };

  const usersService = {
    findAssignable: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'k1-test-jwt-secret-for-security-e2e-suite';
    process.env.NODE_ENV = 'test';
    mockUser.passwordHash = await bcrypt.hash('demo123', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [
        ProjectsController,
        IssuesController,
        PhotosController,
        UsersController,
        DashboardController,
      ],
      providers: [
        AuthService,
        JwtAuthGuard,
        RolesGuard,
        { provide: ProjectsService, useValue: projectsService },
        { provide: ChantierTabsService, useValue: chantierTabsService },
        { provide: PhotosService, useValue: { uploadPhotos: jest.fn() } },
        { provide: DashboardService, useValue: dashboardService },
        { provide: UsersService, useValue: usersService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    configureCors(app);
    configureSwagger(app);
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma.user.findUnique.mockResolvedValue(mockUser);
    const authService = moduleFixture.get(AuthService);
    const login = await authService.login({
      email: 'conducteur@batinova.fr',
      password: 'demo123',
    });
    conducteurToken = login.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('T-K1-SEC-001 — GET /chantiers sans JWT → 401', () => {
    return request(app.getHttpServer()).get('/api/chantiers').expect(401);
  });

  it('T-K1-SEC-002 — GET /chantiers avec JWT → 200', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers')
      .set('Authorization', `Bearer ${conducteurToken}`)
      .expect(200);
  });

  it('T-K1-SEC-003 — X-User-Id seul ignoré (JWT requis)', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers')
      .set('X-User-Id', 'u-conducteur')
      .expect(401);
  });

  it('T-K1-SEC-004 — GET /reserves sans JWT → 401', () => {
    return request(app.getHttpServer()).get('/api/reserves').expect(401);
  });

  it('T-K1-SEC-005 — GET /photos sans JWT → 401', () => {
    return request(app.getHttpServer()).get('/api/photos').expect(401);
  });

  it('T-K1-SEC-006 — GET /dashboard/conducteur sans JWT → 401', () => {
    return request(app.getHttpServer())
      .get('/api/dashboard/conducteur')
      .expect(401);
  });

  it('T-K1-SEC-007 — GET /users/assignable sans JWT → 401', () => {
    return request(app.getHttpServer()).get('/api/users/assignable').expect(401);
  });

  it('T-K1-SEC-008 — GET /chantiers/:id/history sans JWT → 401', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers/c-1/history')
      .expect(401);
  });
});
