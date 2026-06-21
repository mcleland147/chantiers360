import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { WorkersController } from '../src/workers/workers.controller';
import { WorkersService } from '../src/workers/workers.service';

describe('Workers API (TST-EVOL-002-05)', () => {
  let app: INestApplication<App>;

  const mockWorker = {
    id: 'w-1',
    firstName: 'Ahmed',
    lastName: 'Benali',
    fullName: 'Ahmed Benali',
    trade: 'Maçon',
    isActive: true,
  };

  const workersService = {
    findAll: jest.fn().mockResolvedValue([mockWorker]),
    create: jest.fn().mockResolvedValue(mockWorker),
    update: jest.fn().mockResolvedValue({ ...mockWorker, isActive: false }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [WorkersController],
      providers: [{ provide: WorkersService, useValue: workersService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
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

  it('GET /workers liste les ouvriers actifs', async () => {
    await request(app.getHttpServer()).get('/api/workers').expect(200).expect([mockWorker]);
  });

  it('POST /workers crée un ouvrier', async () => {
    await request(app.getHttpServer())
      .post('/api/workers')
      .send({ firstName: 'Ahmed', lastName: 'Benali', trade: 'Maçon' })
      .expect(201)
      .expect(mockWorker);
  });

  it('PATCH /workers/:id désactive un ouvrier', async () => {
    await request(app.getHttpServer())
      .patch('/api/workers/w-1')
      .send({ isActive: false })
      .expect(200)
      .expect({ ...mockWorker, isActive: false });
  });
});
