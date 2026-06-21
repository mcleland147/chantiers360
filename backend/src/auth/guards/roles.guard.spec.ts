import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard — Phase K1', () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  function mockContext(user?: { role: string }): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as ExecutionContext;
  }

  it('T-K1-RG-005 — autorise un rôle autorisé', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['CONDUCTEUR_TRAVAUX']);

    expect(
      guard.canActivate(
        mockContext({ role: 'CONDUCTEUR_TRAVAUX' }),
      ),
    ).toBe(true);
  });

  it('T-K1-RG-006 — refuse un rôle non autorisé', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['DIRECTION']);

    expect(() =>
      guard.canActivate(mockContext({ role: 'CHEF_CHANTIER' })),
    ).toThrow(ForbiddenException);
  });

  it('T-K1-RG-007 — laisse passer si aucun rôle requis', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext())).toBe(true);
  });
});
