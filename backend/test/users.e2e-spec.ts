import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('Users API (Supertest)', () => {
  let app: INestApplication<App>;

  const prisma = {
    user: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: 'u-chef',
          firstName: 'Jean',
          lastName: 'Moreau',
          role: { name: 'CHEF_CHANTIER' },
        },
      ]),
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
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
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('T-G-FORMS-API-001 — GET /api/users/assignable', () => {
    return request(app.getHttpServer())
      .get('/api/users/assignable')
      .expect(200)
      .expect((res) => {
        expect(res.body[0].fullName).toBe('Jean Moreau');
      });
  });
});
