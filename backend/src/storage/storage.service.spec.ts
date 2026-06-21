import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  PHOTO_DEFAULT_MAX_SIZE_BYTES,
  validatePhotoMimeType,
} from '../common/rules/photo-upload.rules';
import { StorageService } from './storage.service';

describe('StorageService (TST-R11-A-01 / TST-R11-A-02)', () => {
  let service: StorageService;
  let uploadDir: string;

  beforeEach(async () => {
    uploadDir = await mkdtemp(join(tmpdir(), 'c360-upload-'));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'UPLOAD_DIR') return uploadDir;
              if (key === 'UPLOAD_MAX_SIZE') return String(PHOTO_DEFAULT_MAX_SIZE_BYTES);
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get(StorageService);
    service.onModuleInit();
  });

  afterEach(async () => {
    await rm(uploadDir, { recursive: true, force: true });
  });

  it('TST-R11-A-01 — accepte JPG et PNG', () => {
    expect(validatePhotoMimeType('image/jpeg')).toBeNull();
    expect(validatePhotoMimeType('image/png')).toBeNull();
    expect(
      service.validateUploadFile({
        originalName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
      }),
    ).toBeNull();
  });

  it('TST-R11-A-01 — rejette PDF', () => {
    expect(
      service.validateUploadFile({
        originalName: 'doc.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
      }),
    ).toContain('non autorisé');
  });

  it('TST-R11-A-02 — rejette fichier > 10 Mo', () => {
    expect(
      service.validateUploadFile({
        originalName: 'big.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: PHOTO_DEFAULT_MAX_SIZE_BYTES + 1,
      }),
    ).toContain('Taille maximale');
  });

  it('enregistre et relit un fichier', async () => {
    const buffer = Buffer.from('fake-image');
    const stored = await service.savePhotoFile({
      buffer,
      originalName: 'facade.jpg',
      mimeType: 'image/jpeg',
      projectId: 'proj-1',
    });
    const onDisk = await readFile(stored.absolutePath);
    expect(onDisk.equals(buffer)).toBe(true);
    await service.deleteFile(stored.storageKey);
  });
});
