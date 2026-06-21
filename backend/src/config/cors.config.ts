export function parseCorsOrigins(raw: string | undefined): string[] {
  const value = raw?.trim() || 'http://localhost:5173';
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
