import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { UserRoleName } from '@prisma/client';
import type { Response } from 'express';
import { ROLES_CHANTIER_ACCESS, ROLES_RESERVES_PHOTOS } from '../auth/constants/api-roles';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChantierTabsService } from '../projects/chantier-tabs.service';
import { PhotosService } from './photos.service';

@ApiTags('photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('photos')
export class PhotosController {
  constructor(
    private readonly chantierTabsService: ChantierTabsService,
    private readonly photosService: PhotosService,
  ) {}

  @Get()
  @Roles(...ROLES_RESERVES_PHOTOS)
  @ApiOperation({ summary: 'Galerie globale des photos (filtres + périmètre rôle)' })
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('chantierId') chantierId?: string,
    @Query('category') category?: string,
    @Query('authorId') authorId?: string,
  ) {
    return this.chantierTabsService.findAllPhotos(
      { chantierId, category, authorId },
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id/file')
  @Roles(...ROLES_CHANTIER_ACCESS)
  @ApiOperation({ summary: 'Télécharger le fichier photo (stream authentifié)' })
  @ApiProduces('image/jpeg', 'image/png')
  async getFile(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { stream, mimeType, fileName } =
      await this.photosService.getPhotoFileStream(
        id,
        user.id,
        user.role as UserRoleName,
      );
    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename="${fileName.replace(/"/g, '')}"`,
      'Cache-Control': 'private, max-age=3600',
    });
    return new StreamableFile(stream);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('CONDUCTEUR_TRAVAUX', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Supprimer une photo (soft delete + fichier)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: RequestUser,
  ): Promise<void> {
    await this.photosService.deletePhoto(
      id,
      user.id,
      user.role as UserRoleName,
    );
  }
}
