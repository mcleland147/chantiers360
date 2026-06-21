import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureSwagger } from '../src/bootstrap/app-config';

describe('Swagger (Supertest)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'swagger-test-jwt-secret-min-32-chars';
    process.env.NODE_ENV = 'development';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    configureSwagger(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('T-H-SWAGGER-001 — OpenAPI JSON expose auth et dashboard', async () => {
    const candidates = ['/api/docs-json', '/docs-json'];
    let response: request.Response | null = null;

    for (const path of candidates) {
      const res = await request(app.getHttpServer()).get(path);
      if (res.status === 200) {
        response = res;
        break;
      }
    }

    expect(response).not.toBeNull();
    const paths = Object.keys(response!.body.paths ?? {});
    expect(paths.some((p) => p.includes('/auth/login'))).toBe(true);
    expect(paths.some((p) => p.includes('/dashboard/conducteur'))).toBe(true);
    expect(paths.some((p) => p.includes('/dashboard/direction'))).toBe(true);
    expect(paths.some((p) => p.includes('/chantiers'))).toBe(true);
  });

  it('T-K1-SWAGGER-001 — Swagger désactivé en production', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ENABLE_SWAGGER;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const prodApp = moduleFixture.createNestApplication();
    prodApp.setGlobalPrefix('api');
    configureSwagger(prodApp);
    await prodApp.init();

    await request(prodApp.getHttpServer()).get('/api/docs-json').expect(404);

    await prodApp.close();
    process.env.NODE_ENV = 'development';
  });
});
