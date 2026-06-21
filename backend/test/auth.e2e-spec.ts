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
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import {
  CurrentUser,
  RequestUser,
} from '../src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { UserContextGuard } from '../src/auth/guards/user-context.guard';
import { PrismaService } from '../src/prisma/prisma.service';

@Controller('test-auth')
class TestAuthContextController {
  @Get('context')
  @UseGuards(UserContextGuard)
  getContext(@CurrentUser() user: RequestUser) {
    return user;
  }
}

describe('Auth API (Supertest)', () => {
  let app: INestApplication<App>;
  let validToken: string;

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
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeAll(async () => {
    mockUser.passwordHash = await bcrypt.hash('demo123', 10);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({
          secret: 'test-jwt-secret',
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [AuthController, TestAuthContextController],
      providers: [
        AuthService,
        JwtAuthGuard,
        UserContextGuard,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

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

    prisma.user.findUnique.mockImplementation(
      ({ where }: { where: { id?: string; email?: string } }) => {
        if (
          where.id === 'u-conducteur' ||
          where.email === 'conducteur@batinova.fr'
        ) {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      },
    );

    const authService = moduleFixture.get(AuthService);
    const login = await authService.login({
      email: 'conducteur@batinova.fr',
      password: 'demo123',
    });
    validToken = login.token;
  });

  beforeEach(() => {
    prisma.user.findUnique.mockImplementation(
      ({ where }: { where: { id?: string; email?: string } }) => {
        if (
          where.id === 'u-conducteur' ||
          where.email === 'conducteur@batinova.fr'
        ) {
          return Promise.resolve(mockUser);
        }
        return Promise.resolve(null);
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('T-API-AUTH-001 — POST /api/auth/login identifiants valides', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'conducteur@batinova.fr', password: 'demo123' })
      .expect(200)
      .expect((res) => {
        expect(res.body.token).toBeDefined();
        expect(res.body.user.role).toBe('CONDUCTEUR_TRAVAUX');
        expect(res.body.user.email).toBe('conducteur@batinova.fr');
      });
  });

  it('T-API-AUTH-002 — POST /api/auth/login identifiants invalides', () => {
    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'conducteur@batinova.fr', password: 'wrong' })
      .expect(401);
  });

  it('T-API-AUTH-003 — GET /api/auth/me avec JWT valide', () => {
    return request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('u-conducteur');
        expect(res.body.role).toBe('CONDUCTEUR_TRAVAUX');
      });
  });

  it('T-API-AUTH-004 — GET /api/auth/me sans token', () => {
    return request(app.getHttpServer()).get('/api/auth/me').expect(401);
  });

  it('T-API-AUTH-005 — UserContextGuard accepte Bearer JWT', () => {
    return request(app.getHttpServer())
      .get('/api/test-auth/context')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe('u-conducteur');
        expect(res.body.role).toBe('CONDUCTEUR_TRAVAUX');
      });
  });

  it('T-API-AUTH-006 — UserContextGuard accepte X-User-Id en développement', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      await request(app.getHttpServer())
        .get('/api/test-auth/context')
        .set('X-User-Id', 'u-conducteur')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe('u-conducteur');
        });
    } finally {
      process.env.NODE_ENV = previousEnv;
    }
  });

  it('T-K1-SEC-009 — UserContextGuard refuse X-User-Id en production', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      await request(app.getHttpServer())
        .get('/api/test-auth/context')
        .set('X-User-Id', 'u-conducteur')
        .expect(401);
    } finally {
      process.env.NODE_ENV = previousEnv;
    }
  });

  it('T-API-AUTH-007 — route protégée sans auth → 401', () => {
    return request(app.getHttpServer())
      .get('/api/test-auth/context')
      .expect(401);
  });
});
