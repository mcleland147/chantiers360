import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { ChantierTabsService } from '../src/projects/chantier-tabs.service';
import { PhotosController } from '../src/photos/photos.controller';
import { PhotosService } from '../src/photos/photos.service';

describe('Photos delete API (TST-R11-A-06 / TST-R11-A-07)', () => {
  let app: INestApplication<App>;

  const photosService = {
    deletePhoto: jest.fn().mockResolvedValue(undefined),
    getPhotoFileStream: jest.fn(),
  };

  const chantierTabsService = {
    findAllPhotos: jest.fn().mockResolvedValue([]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PhotosController],
      providers: [
        { provide: PhotosService, useValue: photosService },
        { provide: ChantierTabsService, useValue: chantierTabsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: { switchToHttp: () => { getRequest: () => object } }) => {
          Object.assign(ctx.switchToHttp().getRequest(), {
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    photosService.deletePhoto.mockClear();
  });

  it('TST-R11-A-06 — DELETE /photos/:id renvoie 204', async () => {
    await request(app.getHttpServer())
      .delete('/api/photos/ph-1')
      .expect(204);
    expect(photosService.deletePhoto).toHaveBeenCalledWith(
      'ph-1',
      'u-conducteur',
      'CONDUCTEUR_TRAVAUX',
    );
  });

  it('TST-R11-A-07 — historisation déléguée au service delete', async () => {
    await request(app.getHttpServer()).delete('/api/photos/ph-2').expect(204);
    expect(photosService.deletePhoto).toHaveBeenCalledTimes(1);
  });
});
