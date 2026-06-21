import {
  Body,
  Controller,
  Delete,
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
  ROLES_BUDGET_READ,
  ROLES_BUDGET_WRITE,
} from '../auth/constants/api-roles';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BudgetService } from './budget.service';
import {
  CreateExpenseDto,
  CreateResourceDto,
  UpdateExpenseDto,
  UpdateResourceDto,
} from './dto/budget.dto';

@ApiTags('budget')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chantiers')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get(':id/resources')
  @Roles(...ROLES_BUDGET_READ)
  @ApiOperation({ summary: 'Liste des ressources budgétées du chantier' })
  listResources(
    @Param('id') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.listResources(
      projectId,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Post(':id/resources')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ROLES_BUDGET_WRITE)
  @ApiOperation({ summary: 'Créer une ressource budgétée' })
  createResource(
    @Param('id') projectId: string,
    @Body() dto: CreateResourceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.createResource(
      projectId,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Patch(':id/resources/:rid')
  @Roles(...ROLES_BUDGET_WRITE)
  @ApiOperation({ summary: 'Modifier une ressource budgétée' })
  updateResource(
    @Param('id') projectId: string,
    @Param('rid') resourceId: string,
    @Body() dto: UpdateResourceDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.updateResource(
      projectId,
      resourceId,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Delete(':id/resources/:rid')
  @Roles(...ROLES_BUDGET_WRITE)
  @ApiOperation({ summary: 'Supprimer une ressource budgétée' })
  deleteResource(
    @Param('id') projectId: string,
    @Param('rid') resourceId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.deleteResource(
      projectId,
      resourceId,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id/expenses')
  @Roles(...ROLES_BUDGET_READ)
  @ApiOperation({ summary: 'Liste des dépenses du chantier' })
  listExpenses(
    @Param('id') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.listExpenses(
      projectId,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Post(':id/expenses')
  @HttpCode(HttpStatus.CREATED)
  @Roles(...ROLES_BUDGET_WRITE)
  @ApiOperation({ summary: 'Créer une dépense' })
  createExpense(
    @Param('id') projectId: string,
    @Body() dto: CreateExpenseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.createExpense(
      projectId,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Patch(':id/expenses/:eid')
  @Roles(...ROLES_BUDGET_WRITE)
  @ApiOperation({ summary: 'Modifier une dépense' })
  updateExpense(
    @Param('id') projectId: string,
    @Param('eid') expenseId: string,
    @Body() dto: UpdateExpenseDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.updateExpense(
      projectId,
      expenseId,
      dto,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Delete(':id/expenses/:eid')
  @Roles(...ROLES_BUDGET_WRITE)
  @ApiOperation({ summary: 'Supprimer une dépense' })
  deleteExpense(
    @Param('id') projectId: string,
    @Param('eid') expenseId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.deleteExpense(
      projectId,
      expenseId,
      user.id,
      user.role as UserRoleName,
    );
  }

  @Get(':id/budget/summary')
  @Roles(...ROLES_BUDGET_READ)
  @ApiOperation({ summary: 'Synthèse budget chantier (VALIDATED only)' })
  getSummary(
    @Param('id') projectId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.budgetService.getSummary(
      projectId,
      user.id,
      user.role as UserRoleName,
    );
  }
}
