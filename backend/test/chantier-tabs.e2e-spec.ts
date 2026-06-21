import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { ChantierTabsService } from '../src/projects/chantier-tabs.service';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsService } from '../src/projects/projects.service';

describe('Chantier tabs API (Supertest)', () => {
  let app: INestApplication<App>;

  const mockAssignment = {
    id: 'a-1',
    chantierId: 'c-3',
    collaboratorName: 'Jean Moreau',
    jobTitle: 'Chef de chantier',
    assignedAt: '10/01/2024',
    isActive: true,
  };

  const mockProgress = {
    id: 'p-1',
    chantierId: 'c-3',
    date: '13/05/2025',
    authorName: 'Jean Moreau',
    comment: 'Ravalement façade nord en pause',
    percent: 45,
  };

  const mockReserve = {
    id: 'r-4',
    chantierId: 'c-3',
    reference: 'RSV-042',
    title: 'Fissure mur porteur nord',
    chantierReference: 'CHT-003',
    chantierName: 'Immeuble Haussmann Rénov.',
    priority: 'Critique',
    status: 'En cours',
    assigneeName: 'Jean Moreau',
    createdAt: '12/05/2025',
  };

  const mockPhoto = {
    id: 'ph-1',
    chantierId: 'c-3',
    category: 'Pendant travaux',
    fileName: 'ravalement-nord.jpg',
    authorName: 'Jean Moreau',
    date: '13/05/2025',
  };

  const chantierTabsService = {
    getAssignments: jest.fn().mockResolvedValue([mockAssignment]),
    createAssignment: jest.fn().mockResolvedValue(mockAssignment),
    getProgress: jest.fn().mockResolvedValue([mockProgress]),
    createProgress: jest.fn().mockResolvedValue(mockProgress),
    getReserves: jest.fn().mockResolvedValue([mockReserve]),
    createReserve: jest.fn().mockResolvedValue(mockReserve),
    validateReserveLevee: jest.fn().mockResolvedValue({
      ...mockReserve,
      status: 'Levée',
    }),
    takeReserveCharge: jest.fn().mockResolvedValue({
      ...mockReserve,
      status: 'En cours',
      assigneeName: 'Marc Dupont',
      takenAt: '14/05/2025',
    }),
    getPhotos: jest.fn().mockResolvedValue([mockPhoto]),
    createPhoto: jest.fn().mockResolvedValue(mockPhoto),
  };

  const projectsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    changeStatus: jest.fn(),
    getHistory: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: projectsService },
        { provide: ChantierTabsService, useValue: chantierTabsService },
      ],
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

  it('T-G-TABS-API-001 — GET /api/chantiers/:id/assignments', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers/c-3/assignments')
      .expect(200)
      .expect((res) => {
        expect(res.body[0].collaboratorName).toBe('Jean Moreau');
      });
  });

  it('T-G-TABS-API-002 — GET /api/chantiers/:id/progress', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers/c-3/progress')
      .expect(200)
      .expect((res) => {
        expect(res.body[0].percent).toBe(45);
      });
  });

  it('T-G-TABS-API-003 — GET /api/chantiers/:id/reserves', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers/c-3/reserves')
      .expect(200)
      .expect((res) => {
        expect(res.body[0].title).toBe('Fissure mur porteur nord');
        expect(res.body[0].priority).toBe('Critique');
      });
  });

  it('T-J-API-001 — PATCH prise en charge réserve', () => {
    return request(app.getHttpServer())
      .patch('/api/chantiers/c-3/reserves/r-4/prise-en-charge')
      .set('Authorization', 'Bearer mock-token')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('En cours');
        expect(res.body.takenAt).toBeDefined();
      });
  });

  it('T-G-TABS-API-004 — PATCH levée réserve', () => {
    return request(app.getHttpServer())
      .patch('/api/chantiers/c-3/reserves/r-4/levee')
      .set('Authorization', 'Bearer mock-token')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('Levée');
      });
  });

  it('T-G-TABS-API-005 — GET /api/chantiers/:id/photos', () => {
    return request(app.getHttpServer())
      .get('/api/chantiers/c-3/photos')
      .expect(200)
      .expect((res) => {
        expect(res.body[0].category).toBe('Pendant travaux');
      });
  });

  it('T-G-TABS-API-006 — POST avancement avec commentaire', () => {
    return request(app.getHttpServer())
      .post('/api/chantiers/c-3/progress')
      .set('Authorization', 'Bearer mock-token')
      .send({ comment: 'Mise à jour terrain', percent: 50 })
      .expect(201)
      .expect((res) => {
        expect(res.body.comment).toBe('Ravalement façade nord en pause');
      });
  });

  it('T-G-FORMS-API-002 — POST affectation membre', () => {
    return request(app.getHttpServer())
      .post('/api/chantiers/c-3/assignments')
      .set('Authorization', 'Bearer mock-token')
      .send({ userId: 'u-chef', functionLabel: 'Électricien' })
      .expect(201)
      .expect((res) => {
        expect(res.body.collaboratorName).toBe('Jean Moreau');
      });
  });

  it('T-G-FORMS-API-003 — POST création réserve', () => {
    return request(app.getHttpServer())
      .post('/api/chantiers/c-3/reserves')
      .set('Authorization', 'Bearer mock-token')
      .send({ title: 'Nouvelle réserve E2E', priority: 'Haute' })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe('Fissure mur porteur nord');
      });
  });

  it('T-G-FORMS-API-004 — POST ajout photo', () => {
    return request(app.getHttpServer())
      .post('/api/chantiers/c-3/photos')
      .set('Authorization', 'Bearer mock-token')
      .send({
        fileName: 'test.jpg',
        category: 'Pendant travaux',
        fileUrl: '/uploads/test.jpg',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.fileName).toBe('ravalement-nord.jpg');
      });
  });
});
