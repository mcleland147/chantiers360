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

@ApiTags('reserves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reserves')
export class IssuesController {
  constructor(private readonly chantierTabsService: ChantierTabsService) {}

  @Get()
  @Roles(...ROLES_RESERVES_PHOTOS)
  @ApiOperation({ summary: 'Liste globale des réserves (filtres + périmètre rôle)' })
  findAll(
    @CurrentUser() user: RequestUser,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('chantierId') chantierId?: string,
    @Query('assigneeId') assigneeId?: string,
  ) {
    return this.chantierTabsService.findAllReserves(
      { search, status, priority, chantierId, assigneeId },
      user.id,
      user.role as UserRoleName,
    );
  }
}
