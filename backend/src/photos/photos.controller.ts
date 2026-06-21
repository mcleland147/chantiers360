import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleName } from '@prisma/client';
import { ROLES_RESERVES_PHOTOS } from '../auth/constants/api-roles';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ChantierTabsService } from '../projects/chantier-tabs.service';

@ApiTags('photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('photos')
export class PhotosController {
  constructor(private readonly chantierTabsService: ChantierTabsService) {}

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
}
