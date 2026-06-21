const WEAK_JWT_SECRETS = new Set([
  'dev-secret-change-in-production',
  'replace-with-strong-secret',
  'replace-with-strong-secret-at-least-32-chars',
  'test-jwt-secret',
  'changeme',
  'secret',
]);

const MIN_PRODUCTION_LENGTH = 32;

export function assertJwtSecretConfigured(secret: string | undefined): void {
  if (!secret?.trim()) {
    throw new Error(
      'JWT_SECRET est obligatoire. Définissez une clé forte dans backend/.env',
    );
  }
}

export function assertJwtSecretStrength(
  secret: string,
  nodeEnv: string | undefined,
): void {
  const normalized = secret.trim();
  if (nodeEnv !== 'production') {
    return;
  }

  if (normalized.length < MIN_PRODUCTION_LENGTH) {
    throw new Error(
      `JWT_SECRET trop court en production (minimum ${MIN_PRODUCTION_LENGTH} caractères).`,
    );
  }

  if (WEAK_JWT_SECRETS.has(normalized)) {
    throw new Error(
      'JWT_SECRET utilise une valeur par défaut interdite en production.',
    );
  }
}

export function isLegacyAuthAllowed(nodeEnv: string | undefined): boolean {
  return nodeEnv !== 'production';
}
