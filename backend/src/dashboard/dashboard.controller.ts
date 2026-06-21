import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('conducteur')
  @Roles('CONDUCTEUR_TRAVAUX')
  @ApiOperation({ summary: 'Tableau de bord conducteur de travaux' })
  @ApiResponse({ status: 200, description: 'KPI, alertes, listes récentes' })
  @ApiResponse({ status: 403, description: 'Rôle non autorisé' })
  getConducteur(@CurrentUser() user: RequestUser) {
    return this.dashboardService.getConducteurDashboard(user.id);
  }

  @Get('direction')
  @Roles('DIRECTION')
  @ApiOperation({ summary: 'Tableau de bord direction (consultation seule)' })
  @ApiResponse({ status: 200, description: 'Vue consolidée entreprise' })
  @ApiResponse({ status: 403, description: 'Rôle non autorisé' })
  getDirection() {
    return this.dashboardService.getDirectionDashboard();
  }
}
