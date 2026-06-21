import { INestApplication, PayloadTooLargeException, UnsupportedMediaTypeException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PhotosService } from '../src/photos/photos.service';
import { ProjectsController } from '../src/projects/projects.controller';
import { ProjectsService } from '../src/projects/projects.service';
import { ChantierTabsService } from '../src/projects/chantier-tabs.service';

describe('Photos upload API (TST-R11-A-03..05)', () => {
  let app: INestApplication<App>;

  const mockPhoto = {
    id: 'ph-upload-1',
    chantierId: 'c-3',
    chantierReference: 'CHT-003',
    chantierName: 'Test',
    category: 'Pendant travaux',
    fileName: 'test.jpg',
    fileUrl: '/api/photos/ph-upload-1/file',
    authorName: 'Jean Moreau',
    date: '13/05/2025',
  };

  const photosService = {
    uploadPhotos: jest.fn().mockResolvedValue([mockPhoto]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: {} },
        { provide: ChantierTabsService, useValue: {} },
        { provide: PhotosService, useValue: photosService },
      ],
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
    photosService.uploadPhotos.mockClear();
  });

  it('TST-R11-A-03 — POST multipart 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/chantiers/c-3/photos/upload')
      .field('category', 'Pendant travaux')
      .attach('files', Buffer.from('fake-jpeg'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(201);
    expect(photosService.uploadPhotos).toHaveBeenCalled();
    expect(res.body[0].fileName).toBe('test.jpg');
  });

  it('TST-R11-A-04 — rejette type invalide via service', async () => {
    photosService.uploadPhotos.mockRejectedValueOnce(
      new UnsupportedMediaTypeException('Format non autorisé'),
    );
    const res = await request(app.getHttpServer())
      .post('/api/chantiers/c-3/photos/upload')
      .field('category', 'Pendant travaux')
      .attach('files', Buffer.from('%PDF'), {
        filename: 'doc.pdf',
        contentType: 'application/pdf',
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('TST-R11-A-05 — rejette taille excessive via service', async () => {
    photosService.uploadPhotos.mockRejectedValueOnce(
      new PayloadTooLargeException('Taille maximale dépassée'),
    );
    const res = await request(app.getHttpServer())
      .post('/api/chantiers/c-3/photos/upload')
      .field('category', 'Pendant travaux')
      .attach('files', Buffer.alloc(100), {
        filename: 'big.jpg',
        contentType: 'image/jpeg',
      });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
