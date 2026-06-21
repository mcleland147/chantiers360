import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleName } from '@prisma/client';
import { memoryStorage } from 'multer';
import {
  ROLES_CHANTIER_ACCESS,
  ROLES_CHEF,
  ROLES_CONDUCTEUR,
} from '../auth/constants/api-roles';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PHOTO_MAX_FILES_PER_UPLOAD } from '../common/rules/photo-upload.rules';
import { PhotosService } from '../photos/photos.service';
import { ChantierTabsService } from './chantier-tabs.service';
import { ChangeChantierStatusDto } from './dto/change-chantier-status.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UploadPhotosDto } from './dto/upload-photos.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { CreateReserveDto } from './dto/create-reserve.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';
import { ProjectsService } from './projects.service';

@ApiTags('chantiers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chantiers')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly chantierTabsService: ChantierTabsService,
    private readonly photosService: PhotosService,
  ) {}

  @Get()
  @Roles(...ROLES_CHANTIER_ACCESS)
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('mine')
  @Roles(...ROLES_CHEF)
  @ApiOperation({
    summary: "Chantiers affectés à l'utilisateur connecté (chef de chantier)",
  })
  findMine(@CurrentUser() user: RequestUser) {
    return this.projectsService.findAssigned(user.id);
  }

  @Get(':id/history')
  @Roles(...ROLES_CHANTIER_ACCESS)
  getHistory(@Param('id') id: string) {
    return this.projectsService.getHistory(id);
  }

  @Get(':id/assignments')
  @Roles(...ROLES_CHANTIER_ACCESS)
  getAssignments(@Param('id') id: string) {
    return this.chantierTabsService.getAssignments(id);
  }

  @Post(':id/assignments')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ROLES_CONDUCTEUR)
  createAssignment(
    @Param('id') id: string,
    @Body() dto: CreateAssignmentDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chantierTabsService.createAssignment(
      id,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id/progress')
  @Roles(...ROLES_CHANTIER_ACCESS)
  getProgress(@Param('id') id: string) {
    return this.chantierTabsService.getProgress(id);
  }

  @Post(':id/progress')
  @HttpCode(HttpStatus.CREATED)
  @Roles('CONDUCTEUR_TRAVAUX', 'CHEF_CHANTIER')
  createProgress(
    @Param('id') id: string,
    @Body() dto: CreateProgressDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chantierTabsService.createProgress(
      id,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id/reserves')
  @Roles(...ROLES_CHANTIER_ACCESS)
  getReserves(@Param('id') id: string) {
    return this.chantierTabsService.getReserves(id);
  }

  @Post(':id/reserves')
  @HttpCode(HttpStatus.CREATED)
  @Roles('CONDUCTEUR_TRAVAUX', 'CHEF_CHANTIER')
  createReserve(
    @Param('id') id: string,
    @Body() dto: CreateReserveDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chantierTabsService.createReserve(
      id,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Patch(':id/reserves/:reserveId/prise-en-charge')
  @Roles('CONDUCTEUR_TRAVAUX', 'CHEF_CHANTIER')
  takeReserveCharge(
    @Param('id') id: string,
    @Param('reserveId') reserveId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chantierTabsService.takeReserveCharge(
      id,
      reserveId,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Patch(':id/reserves/:reserveId/levee')
  @Roles(...ROLES_CONDUCTEUR)
  validateReserveLevee(
    @Param('id') id: string,
    @Param('reserveId') reserveId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chantierTabsService.validateReserveLevee(
      id,
      reserveId,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id/photos')
  @Roles(...ROLES_CHANTIER_ACCESS)
  getPhotos(@Param('id') id: string) {
    return this.chantierTabsService.getPhotos(id);
  }

  @Post(':id/photos/upload')
  @HttpCode(HttpStatus.CREATED)
  @Roles('CONDUCTEUR_TRAVAUX', 'CHEF_CHANTIER')
  @ApiOperation({ summary: 'Upload multipart de photos (JPG/PNG, max 10 Mo)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', PHOTO_MAX_FILES_PER_UPLOAD, {
      storage: memoryStorage(),
      limits: {
        fileSize: parseInt(process.env.UPLOAD_MAX_SIZE ?? '', 10) || 10 * 1024 * 1024,
      },
    }),
  )
  uploadPhotos(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadPhotosDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.photosService.uploadPhotos({
      projectId: id,
      category: dto.category,
      comment: dto.comment,
      files: files ?? [],
      userId: user.id,
      role: user.role as UserRoleName,
    });
  }

  @Post(':id/photos')
  @HttpCode(HttpStatus.CREATED)
  @Roles('CONDUCTEUR_TRAVAUX', 'CHEF_CHANTIER')
  createPhoto(
    @Param('id') id: string,
    @Body() dto: CreatePhotoDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.chantierTabsService.createPhoto(
      id,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id')
  @Roles(...ROLES_CHANTIER_ACCESS)
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ROLES_CONDUCTEUR, 'ASSISTANTE_ADMINISTRATIVE')
  @ApiOperation({ summary: 'Créer un chantier (statut initial Préparation)' })
  create(@Body() dto: CreateChantierDto, @CurrentUser() user: RequestUser) {
    return this.projectsService.create(dto, user.id);
  }

  @Patch(':id/status')
  @Roles(...ROLES_CONDUCTEUR)
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeChantierStatusDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.projectsService.changeStatus(id, dto, user.id);
  }

  @Patch(':id')
  @Roles(...ROLES_CONDUCTEUR, 'ASSISTANTE_ADMINISTRATIVE')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChantierDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.projectsService.update(id, dto, user.id);
  }
}
