import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream, promises as fs } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import type { ReadStream } from 'fs';
import {
  extensionFromMimeType,
  parseUploadMaxSizeBytes,
  sanitizeOriginalFileName,
  validatePhotoExtension,
  validatePhotoFileSize,
  validatePhotoMimeType,
} from '../common/rules/photo-upload.rules';

export interface StoredPhotoFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  projectId: string;
}

export interface StoredPhotoFileResult {
  storageKey: string;
  absolutePath: string;
  fileSizeBytes: number;
  mimeType: string;
  originalFileName: string;
}

@Injectable()
export class StorageService implements OnModuleInit {
  private uploadDir!: string;
  private maxFileSizeBytes!: number;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.uploadDir =
      this.config.get<string>('UPLOAD_DIR') ??
      join(process.cwd(), 'uploads');
    this.maxFileSizeBytes = parseUploadMaxSizeBytes(
      this.config.get<string>('UPLOAD_MAX_SIZE'),
    );
    void this.ensureUploadDir();
  }

  getMaxFileSizeBytes(): number {
    return this.maxFileSizeBytes;
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  async ensureUploadDir(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  validateUploadFile(input: {
    originalName: string;
    mimeType: string;
    sizeBytes: number;
  }): string | null {
    const extError = validatePhotoExtension(input.originalName);
    if (extError) return extError;
    const mimeError = validatePhotoMimeType(input.mimeType);
    if (mimeError) return mimeError;
    return validatePhotoFileSize(input.sizeBytes, this.maxFileSizeBytes);
  }

  buildStorageKey(projectId: string, mimeType: string): string {
    const ext = extensionFromMimeType(mimeType);
    return `projects/${projectId}/${randomUUID()}${ext}`;
  }

  resolveAbsolutePath(storageKey: string): string {
    const normalized = storageKey.replace(/\\/g, '/');
    if (normalized.includes('..') || normalized.startsWith('/')) {
      throw new InternalServerErrorException('Clé de stockage invalide.');
    }
    const absolute = resolve(this.uploadDir, normalized);
    const root = resolve(this.uploadDir);
    if (!absolute.startsWith(root)) {
      throw new InternalServerErrorException('Clé de stockage invalide.');
    }
    return absolute;
  }

  async savePhotoFile(
    input: StoredPhotoFileInput,
  ): Promise<StoredPhotoFileResult> {
    const validationError = this.validateUploadFile({
      originalName: input.originalName,
      mimeType: input.mimeType,
      sizeBytes: input.buffer.length,
    });
    if (validationError) {
      throw new Error(validationError);
    }

    const storageKey = this.buildStorageKey(input.projectId, input.mimeType);
    const absolutePath = this.resolveAbsolutePath(storageKey);
    await fs.mkdir(join(absolutePath, '..'), { recursive: true });
    await fs.writeFile(absolutePath, input.buffer);

    return {
      storageKey,
      absolutePath,
      fileSizeBytes: input.buffer.length,
      mimeType: input.mimeType,
      originalFileName: sanitizeOriginalFileName(input.originalName),
    };
  }

  createReadStream(storageKey: string): ReadStream {
    const absolutePath = this.resolveAbsolutePath(storageKey);
    return createReadStream(absolutePath);
  }

  async fileExists(storageKey: string): Promise<boolean> {
    try {
      await fs.access(this.resolveAbsolutePath(storageKey));
      return true;
    } catch {
      return false;
    }
  }

  async deleteFile(storageKey: string): Promise<void> {
    if (storageKey.startsWith('legacy/')) {
      return;
    }
    try {
      await fs.unlink(this.resolveAbsolutePath(storageKey));
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code !== 'ENOENT') {
        throw err;
      }
    }
  }

  isLegacyStorageKey(storageKey: string): boolean {
    return storageKey.startsWith('legacy/');
  }
}
