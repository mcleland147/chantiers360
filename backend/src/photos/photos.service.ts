import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { UserRoleName } from '@prisma/client';
import type { ReadStream } from 'fs';
import { canAddPhoto } from '../common/rules/chantier-tabs.rules';
import { PHOTO_MAX_FILES_PER_UPLOAD } from '../common/rules/photo-upload.rules';
import {
  photoCategoryFromFrench,
  photoCategoryToFrench,
  formatDateFr,
} from '../common/mappers/chantier.mapper';
import { HistoryService } from '../history/history.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { PhotoResponse } from '../projects/chantier-tabs.service';

export interface UploadPhotosInput {
  projectId: string;
  category: string;
  comment?: string;
  files: Express.Multer.File[];
  userId: string;
  role: UserRoleName;
}

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly historyService: HistoryService,
  ) {}

  async uploadPhotos(input: UploadPhotosInput): Promise<PhotoResponse[]> {
    if (!canAddPhoto(input.role)) {
      throw new ForbiddenException(
        'Action réservée au conducteur ou au chef de chantier.',
      );
    }

    await this.assertCanAccessProject(
      input.projectId,
      input.userId,
      input.role,
    );

    if (!input.files?.length) {
      throw new UnsupportedMediaTypeException('Aucun fichier fourni.');
    }
    if (input.files.length > PHOTO_MAX_FILES_PER_UPLOAD) {
      throw new PayloadTooLargeException(
        `Maximum ${PHOTO_MAX_FILES_PER_UPLOAD} fichiers par envoi.`,
      );
    }

    let category;
    try {
      category = photoCategoryFromFrench(input.category);
    } catch {
      throw new UnsupportedMediaTypeException('Catégorie photo invalide.');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: input.projectId },
    });
    if (!project) {
      throw new NotFoundException('Chantier introuvable.');
    }

    const author = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });

    const results: PhotoResponse[] = [];

    for (const file of input.files) {
      const validationError = this.storage.validateUploadFile({
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
      });
      if (validationError) {
        if (validationError.includes('Taille maximale')) {
          throw new PayloadTooLargeException(validationError);
        }
        throw new UnsupportedMediaTypeException(validationError);
      }

      const stored = await this.storage.savePhotoFile({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        projectId: input.projectId,
      });

      const row = await this.prisma.photo.create({
        data: {
          projectId: input.projectId,
          fileName: stored.originalFileName,
          originalFileName: stored.originalFileName,
          storageKey: stored.storageKey,
          mimeType: stored.mimeType,
          fileSizeBytes: stored.fileSizeBytes,
          fileUrl: '/api/photos/pending',
          category,
          comment: input.comment?.trim() || undefined,
          addedById: input.userId,
        },
      });

      const fileUrl = `/api/photos/${row.id}/file`;
      await this.prisma.photo.update({
        where: { id: row.id },
        data: { fileUrl },
      });

      await this.historyService.recordEvent({
        projectId: input.projectId,
        userId: input.userId,
        action: 'Ajout photo',
        newValue: `${stored.originalFileName} (${input.category})`,
      });

      results.push(
        this.mapPhotoRow(
          { ...row, fileUrl },
          project,
          author,
        ),
      );
    }

    return results;
  }

  async deletePhoto(
    photoId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<void> {
    if (!canAddPhoto(role)) {
      throw new ForbiddenException(
        'Action réservée au conducteur ou au chef de chantier.',
      );
    }

    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
    });
    if (!photo || photo.deletedAt) {
      throw new NotFoundException('Photo introuvable.');
    }

    await this.assertCanAccessProject(photo.projectId, userId, role);

    await this.prisma.photo.update({
      where: { id: photoId },
      data: {
        deletedAt: new Date(),
        deletedById: userId,
      },
    });

    await this.storage.deleteFile(photo.storageKey);

    await this.historyService.recordEvent({
      projectId: photo.projectId,
      userId,
      action: 'Suppression photo',
      oldValue: photo.originalFileName,
    });
  }

  async getPhotoFileStream(
    photoId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<{ stream: ReadStream; mimeType: string; fileName: string }> {
    const photo = await this.prisma.photo.findUnique({
      where: { id: photoId },
    });
    if (!photo || photo.deletedAt) {
      throw new NotFoundException('Photo introuvable.');
    }

    await this.assertCanAccessProject(photo.projectId, userId, role);

    if (this.storage.isLegacyStorageKey(photo.storageKey)) {
      throw new NotFoundException('Fichier non disponible pour cette photo.');
    }

    const exists = await this.storage.fileExists(photo.storageKey);
    if (!exists) {
      throw new NotFoundException('Fichier photo introuvable sur le serveur.');
    }

    return {
      stream: this.storage.createReadStream(photo.storageKey),
      mimeType: photo.mimeType,
      fileName: photo.originalFileName,
    };
  }

  private async assertCanAccessProject(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<void> {
    if (role === 'DIRECTION' || role === 'ASSISTANTE_ADMINISTRATIVE') {
      return;
    }
    if (role === 'CONDUCTEUR_TRAVAUX') {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, conductorId: userId },
      });
      if (!project) {
        throw new ForbiddenException('Accès chantier refusé.');
      }
      return;
    }
    if (role === 'CHEF_CHANTIER') {
      const assignment = await this.prisma.assignment.findFirst({
        where: { projectId, userId, isActive: true },
      });
      if (!assignment) {
        throw new ForbiddenException('Accès chantier refusé.');
      }
      return;
    }
    throw new ForbiddenException('Accès refusé.');
  }

  private mapPhotoRow(
    row: {
      id: string;
      projectId: string;
      fileName: string;
      fileUrl: string;
      category: import('@prisma/client').PhotoCategory;
      comment: string | null;
      createdAt: Date;
      addedById: string;
    },
    project: { reference: string; name: string },
    author: { firstName: string; lastName: string } | null,
  ): PhotoResponse {
    return {
      id: row.id,
      chantierId: row.projectId,
      chantierReference: project.reference,
      chantierName: project.name,
      category: photoCategoryToFrench(row.category),
      fileName: row.fileName,
      fileUrl: row.fileUrl,
      authorName: author
        ? `${author.firstName} ${author.lastName}`
        : 'Utilisateur',
      date: formatDateFr(row.createdAt),
      comment: row.comment ?? undefined,
    };
  }
}
