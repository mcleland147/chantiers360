import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ROLES_PLANNING_READ,
  ROLES_PLANNING_WRITE,
} from '../auth/constants/api-roles';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { CreateWorkerDto, UpdateWorkerDto } from './dto/worker.dto';
import { WorkersService } from './workers.service';

@ApiTags('workers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Get()
  @Roles(...ROLES_PLANNING_READ)
  @ApiOperation({ summary: 'Liste des ouvriers (actifs par défaut)' })
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.workersService.findAll(includeInactive !== 'true');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ROLES_PLANNING_WRITE)
  @ApiOperation({ summary: 'Créer un ouvrier terrain' })
  create(@Body() dto: CreateWorkerDto) {
    return this.workersService.create(dto);
  }

  @Patch(':id')
  @Roles(...ROLES_PLANNING_WRITE)
  @ApiOperation({ summary: 'Modifier ou désactiver un ouvrier' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.workersService.update(id, dto);
  }
}
