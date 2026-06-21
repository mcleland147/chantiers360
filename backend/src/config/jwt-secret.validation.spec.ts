import {
  assertJwtSecretConfigured,
  assertJwtSecretStrength,
  isLegacyAuthAllowed,
} from './jwt-secret.validation';

describe('jwt-secret.validation — Phase K1', () => {
  it('T-K1-RG-001 — refuse démarrage sans JWT_SECRET', () => {
    expect(() => assertJwtSecretConfigured(undefined)).toThrow(/JWT_SECRET/);
    expect(() => assertJwtSecretConfigured('   ')).toThrow(/JWT_SECRET/);
  });

  it('T-K1-RG-002 — refuse secret faible en production', () => {
    expect(() =>
      assertJwtSecretStrength(
        'replace-with-strong-secret-at-least-32-chars',
        'production',
      ),
    ).toThrow(/défaut interdite/);
    expect(() => assertJwtSecretStrength('short-secret', 'production')).toThrow(
      /trop court/,
    );
  });

  it('T-K1-RG-003 — accepte secret fort en production', () => {
    expect(() =>
      assertJwtSecretStrength(
        'a-very-long-and-random-production-secret-key-2026!',
        'production',
      ),
    ).not.toThrow();
  });

  it('T-K1-RG-004 — legacy auth interdit en production', () => {
    expect(isLegacyAuthAllowed('production')).toBe(false);
    expect(isLegacyAuthAllowed('development')).toBe(true);
  });
});
