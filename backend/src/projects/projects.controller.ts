import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleName } from '@prisma/client';
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
import { ChantierTabsService } from './chantier-tabs.service';
import { ChangeChantierStatusDto } from './dto/change-chantier-status.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
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
