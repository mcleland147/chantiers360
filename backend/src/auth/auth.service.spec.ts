import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

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
  });

  beforeEach(async () => {
    prisma.user.findUnique.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('jwt.token.here'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  it('login — retourne token et profil pour identifiants valides', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const result = await service.login({
      email: 'conducteur@batinova.fr',
      password: 'demo123',
    });

    expect(result.user.role).toBe('CONDUCTEUR_TRAVAUX');
    expect(result.token).toBe('jwt.token.here');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'u-conducteur',
      email: 'conducteur@batinova.fr',
      role: 'CONDUCTEUR_TRAVAUX',
    });
  });

  it('login — rejette un mot de passe incorrect', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(
      service.login({ email: 'conducteur@batinova.fr', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login — rejette un utilisateur inconnu', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({ email: 'unknown@batinova.fr', password: 'demo123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('login — rejette un utilisateur inactif', async () => {
    prisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

    await expect(
      service.login({ email: 'conducteur@batinova.fr', password: 'demo123' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('getProfile — retourne le profil actif', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const profile = await service.getProfile('u-conducteur');
    expect(profile.email).toBe('conducteur@batinova.fr');
  });

  it('resolveUserFromBearer — retourne utilisateur depuis JWT valide', async () => {
    jest.spyOn(jwtService, 'verify').mockReturnValue({
      sub: 'u-conducteur',
      email: 'conducteur@batinova.fr',
      role: 'CONDUCTEUR_TRAVAUX',
    });
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const user = await service.resolveUserFromBearer('Bearer valid.jwt.token');

    expect(user).toEqual({
      id: 'u-conducteur',
      email: 'conducteur@batinova.fr',
      role: 'CONDUCTEUR_TRAVAUX',
    });
  });

  it('resolveRequestUser — accepte X-User-Id en développement', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    prisma.user.findUnique.mockResolvedValue(mockUser);

    const user = await service.resolveRequestUser({
      headers: {},
      header: (name: string) =>
        name.toLowerCase() === 'x-user-id' ? 'u-conducteur' : undefined,
    } as never);

    expect(user?.id).toBe('u-conducteur');
    process.env.NODE_ENV = previousEnv;
  });

  it('resolveRequestUser — ignore X-User-Id en production', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const user = await service.resolveRequestUser({
      headers: {},
      header: (name: string) =>
        name.toLowerCase() === 'x-user-id' ? 'u-conducteur' : undefined,
    } as never);

    expect(user).toBeNull();
    process.env.NODE_ENV = previousEnv;
  });
});
