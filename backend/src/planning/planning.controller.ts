import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRoleName } from '@prisma/client';
import {
  ROLES_PLANNING_KPI,
  ROLES_PLANNING_READ,
  ROLES_PLANNING_WRITE,
} from '../auth/constants/api-roles';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ConflictQueryDto,
  CreateScheduleSlotDto,
  PlanningQueryDto,
  UpdateScheduleSlotDto,
} from './dto/planning.dto';
import { PlanningService } from './planning.service';

@ApiTags('planning')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get()
  @Roles(...ROLES_PLANNING_READ)
  @ApiOperation({ summary: 'Créneaux planning sur une plage de dates' })
  findSlots(
    @Query() query: PlanningQueryDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.planningService.findSlots(
      query,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get('conflicts')
  @Roles(...ROLES_PLANNING_WRITE)
  @ApiOperation({ summary: 'Vérifier un conflit avant enregistrement' })
  findConflicts(@Query() query: ConflictQueryDto) {
    return this.planningService.findConflicts(query);
  }

  @Get('kpi/occupation')
  @Roles(...ROLES_PLANNING_KPI)
  @ApiOperation({ summary: 'KPI occupation (% / 35 h semaine)' })
  getOccupationKpi(
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.planningService.getOccupationKpi(
      from,
      to,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Post('slots')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ROLES_PLANNING_WRITE)
  @ApiOperation({ summary: 'Créer un créneau ouvrier' })
  createSlot(
    @Body() dto: CreateScheduleSlotDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.planningService.createSlot(
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Put('slots/:id')
  @Roles(...ROLES_PLANNING_WRITE)
  @ApiOperation({ summary: 'Modifier un créneau' })
  updateSlot(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleSlotDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.planningService.updateSlot(
      id,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Delete('slots/:id')
  @Roles(...ROLES_PLANNING_WRITE)
  @ApiOperation({ summary: 'Annuler un créneau (statut Annulé)' })
  cancelSlot(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.planningService.cancelSlot(
      id,
      user.id,
      user.role as UserRoleName,
    );
  }
}
