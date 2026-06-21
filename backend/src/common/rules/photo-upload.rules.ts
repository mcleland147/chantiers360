export const PHOTO_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
] as const;

export const PHOTO_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'] as const;

export const PHOTO_MAX_FILES_PER_UPLOAD = 10;

export const PHOTO_DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function parseUploadMaxSizeBytes(raw: string | undefined): number {
  const parsed = Number(raw);
  if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
    return PHOTO_DEFAULT_MAX_SIZE_BYTES;
  }
  return Math.floor(parsed);
}

export function validatePhotoMimeType(mimeType: string): string | null {
  if (
    !PHOTO_ALLOWED_MIME_TYPES.includes(
      mimeType as (typeof PHOTO_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    return 'Format non autorisé — JPG, JPEG ou PNG uniquement (RG-PHO-01).';
  }
  return null;
}

export function validatePhotoExtension(fileName: string): string | null {
  const lower = fileName.toLowerCase();
  const ok = PHOTO_ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
  if (!ok) {
    return 'Extension non autorisée — JPG, JPEG ou PNG uniquement (RG-PHO-01).';
  }
  return null;
}

export function validatePhotoFileSize(
  sizeBytes: number,
  maxBytes: number,
): string | null {
  if (sizeBytes <= 0) {
    return 'Fichier vide.';
  }
  if (sizeBytes > maxBytes) {
    return `Taille maximale dépassée (${Math.round(maxBytes / (1024 * 1024))} Mo par fichier, RG-PHO-02).`;
  }
  return null;
}

export function extensionFromMimeType(mimeType: string): string {
  if (mimeType === 'image/png') return '.png';
  return '.jpg';
}

export function sanitizeOriginalFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'photo';
  return base.replace(/[^\w.\-() ]+/g, '_').slice(0, 200) || 'photo.jpg';
}
