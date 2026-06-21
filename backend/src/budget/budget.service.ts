import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ExpenseCategory,
  ExpenseStatus,
  ProjectExpense,
  ProjectResource,
  ResourceType,
  UserRoleName,
} from '@prisma/client';
import { formatDateFr } from '../common/mappers/chantier.mapper';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExpenseDto,
  CreateResourceDto,
  UpdateExpenseDto,
  UpdateResourceDto,
} from './dto/budget.dto';
import {
  EXPENSE_CATEGORY_FROM_FRENCH,
  EXPENSE_STATUS_FROM_FRENCH,
  EXPENSE_STATUS_TO_FRENCH,
  expenseCategoryToFrench,
  expenseStatusToFrench,
  RESOURCE_TYPE_FROM_FRENCH,
  resourceTypeToFrench,
} from './mappers/budget.mapper';
import {
  computeBudgetSummary,
  roundPercent,
  shouldCreateBudgetAlert,
} from './rules/budget-summary.rules';

export interface ResourceResponse {
  id: string;
  projectId: string;
  type: string;
  label: string;
  unitCost: number;
  quantity: number;
  totalPlanned: number;
  notes?: string;
  createdByName: string;
  createdAt: string;
}

export interface ExpenseResponse {
  id: string;
  projectId: string;
  category: string;
  label: string;
  amount: number;
  expenseDate: string;
  supplier?: string;
  invoiceReference?: string;
  status: string;
  notes?: string;
  createdByName: string;
  createdAt: string;
}

export interface BudgetSummaryResponse {
  projectId: string;
  projectReference: string;
  budgetEnvelope: number | null;
  budgetConsumed: number;
  budgetRemaining: number | null;
  consumptionPercent: number | null;
  hasEnvelope: boolean;
  alert80Active: boolean;
  alert100Active: boolean;
  resourceCount: number;
  expenseCount: number;
}

@Injectable()
export class BudgetService {
  constructor(private readonly prisma: PrismaService) {}

  async getValidatedExpenseTotal(projectId: string): Promise<number> {
    const result = await this.prisma.projectExpense.aggregate({
      where: { projectId, status: 'VALIDATED' },
      _sum: { amount: true },
    });
    return result._sum.amount ? Number(result._sum.amount) : 0;
  }

  async getValidatedExpenseTotalsByProjectIds(
    projectIds: string[],
  ): Promise<Map<string, number>> {
    if (projectIds.length === 0) {
      return new Map();
    }
    const rows = await this.prisma.projectExpense.groupBy({
      by: ['projectId'],
      where: { projectId: { in: projectIds }, status: 'VALIDATED' },
      _sum: { amount: true },
    });
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.projectId, row._sum.amount ? Number(row._sum.amount) : 0);
    }
    return map;
  }

  async listResources(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<ResourceResponse[]> {
    await this.assertCanReadProject(projectId, userId, role);
    const rows = await this.prisma.projectResource.findMany({
      where: { projectId },
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.mapResource(row));
  }

  async createResource(
    projectId: string,
    dto: CreateResourceDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ResourceResponse> {
    await this.assertCanWriteProject(projectId, userId, role);
    const type = this.parseResourceType(dto.type);
    const quantity = dto.quantity ?? 1;
    const totalPlanned = dto.unitCost * quantity;

    const row = await this.prisma.projectResource.create({
      data: {
        projectId,
        type,
        label: dto.label.trim(),
        unitCost: dto.unitCost,
        quantity,
        totalPlanned,
        notes: dto.notes?.trim(),
        createdById: userId,
      },
      include: { createdBy: true },
    });
    return this.mapResource(row);
  }

  async updateResource(
    projectId: string,
    resourceId: string,
    dto: UpdateResourceDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ResourceResponse> {
    await this.assertCanWriteProject(projectId, userId, role);
    const existing = await this.findResourceOrThrow(projectId, resourceId);

    const unitCost =
      dto.unitCost !== undefined ? dto.unitCost : Number(existing.unitCost);
    const quantity =
      dto.quantity !== undefined ? dto.quantity : Number(existing.quantity);
    const totalPlanned = unitCost * quantity;

    const row = await this.prisma.projectResource.update({
      where: { id: resourceId },
      data: {
        type: dto.type ? this.parseResourceType(dto.type) : undefined,
        label: dto.label?.trim(),
        unitCost: dto.unitCost,
        quantity: dto.quantity,
        totalPlanned,
        notes: dto.notes !== undefined ? dto.notes?.trim() : undefined,
      },
      include: { createdBy: true },
    });
    return this.mapResource(row);
  }

  async deleteResource(
    projectId: string,
    resourceId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<void> {
    await this.assertCanWriteProject(projectId, userId, role);
    await this.findResourceOrThrow(projectId, resourceId);
    await this.prisma.projectResource.delete({ where: { id: resourceId } });
  }

  async listExpenses(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<ExpenseResponse[]> {
    await this.assertCanReadProject(projectId, userId, role);
    const rows = await this.prisma.projectExpense.findMany({
      where: { projectId },
      include: { createdBy: true },
      orderBy: [{ expenseDate: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map((row) => this.mapExpense(row));
  }

  async createExpense(
    projectId: string,
    dto: CreateExpenseDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ExpenseResponse> {
    await this.assertCanWriteProject(projectId, userId, role);
    this.assertPositiveAmount(dto.amount);

    const row = await this.prisma.projectExpense.create({
      data: {
        projectId,
        category: this.parseExpenseCategory(dto.category),
        label: dto.label.trim(),
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
        supplier: dto.supplier?.trim(),
        invoiceReference: dto.invoiceReference?.trim(),
        status: dto.status ?? 'VALIDATED',
        notes: dto.notes?.trim(),
        createdById: userId,
      },
      include: { createdBy: true },
    });

    await this.syncBudgetAlerts(projectId);
    return this.mapExpense(row);
  }

  async updateExpense(
    projectId: string,
    expenseId: string,
    dto: UpdateExpenseDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ExpenseResponse> {
    await this.assertCanWriteProject(projectId, userId, role);
    await this.findExpenseOrThrow(projectId, expenseId);

    if (dto.amount !== undefined) {
      this.assertPositiveAmount(dto.amount);
    }

    const row = await this.prisma.projectExpense.update({
      where: { id: expenseId },
      data: {
        category: dto.category
          ? this.parseExpenseCategory(dto.category)
          : undefined,
        label: dto.label?.trim(),
        amount: dto.amount,
        expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
        supplier: dto.supplier !== undefined ? dto.supplier?.trim() : undefined,
        invoiceReference:
          dto.invoiceReference !== undefined
            ? dto.invoiceReference?.trim()
            : undefined,
        status: dto.status,
        notes: dto.notes !== undefined ? dto.notes?.trim() : undefined,
      },
      include: { createdBy: true },
    });

    await this.syncBudgetAlerts(projectId);
    return this.mapExpense(row);
  }

  async deleteExpense(
    projectId: string,
    expenseId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<void> {
    await this.assertCanWriteProject(projectId, userId, role);
    await this.findExpenseOrThrow(projectId, expenseId);
    await this.prisma.projectExpense.delete({ where: { id: expenseId } });
    await this.syncBudgetAlerts(projectId);
  }

  async getSummary(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<BudgetSummaryResponse> {
    await this.assertCanReadProject(projectId, userId, role);
    return this.buildSummary(projectId);
  }

  async buildSummary(projectId: string): Promise<BudgetSummaryResponse> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        reference: true,
        budget: true,
        budgetAlertAt80: true,
        budgetAlertAt100: true,
      },
    });
    if (!project) {
      throw new NotFoundException('Chantier introuvable.');
    }

    const consumed = await this.getValidatedExpenseTotal(projectId);
    const envelope = project.budget ? Number(project.budget) : null;
    const summary = computeBudgetSummary(envelope, consumed);

    const [resourceCount, expenseCount, alert80, alert100] =
      await Promise.all([
        this.prisma.projectResource.count({ where: { projectId } }),
        this.prisma.projectExpense.count({ where: { projectId } }),
        this.prisma.alert.findFirst({
          where: { projectId, type: 'BUDGET_80' },
        }),
        this.prisma.alert.findFirst({
          where: { projectId, type: 'BUDGET_100' },
        }),
      ]);

    return {
      projectId: project.id,
      projectReference: project.reference,
      budgetEnvelope: summary.budgetEnvelope,
      budgetConsumed: summary.budgetConsumed,
      budgetRemaining: summary.budgetRemaining,
      consumptionPercent: summary.consumptionPercent,
      hasEnvelope: summary.hasEnvelope,
      alert80Active: !!alert80 && alert80.status === 'ACTIVE',
      alert100Active: !!alert100 && alert100.status === 'ACTIVE',
      resourceCount,
      expenseCount,
    };
  }

  async syncBudgetAlerts(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: {
        budget: true,
        budgetAlertAt80: true,
        budgetAlertAt100: true,
      },
    });
    if (!project?.budget) {
      return;
    }

    const consumed = await this.getValidatedExpenseTotal(projectId);
    const envelope = Number(project.budget);
    const { consumptionPercent } = computeBudgetSummary(envelope, consumed);
    if (consumptionPercent === null) {
      return;
    }

    const [existing80, existing100] = await Promise.all([
      this.prisma.alert.findFirst({
        where: { projectId, type: 'BUDGET_80' },
      }),
      this.prisma.alert.findFirst({
        where: { projectId, type: 'BUDGET_100' },
      }),
    ]);

    if (
      shouldCreateBudgetAlert(
        80,
        consumptionPercent,
        project.budgetAlertAt80,
        !!existing80,
      )
    ) {
      await this.prisma.alert.create({
        data: {
          projectId,
          type: 'BUDGET_80',
          message: `Budget consommé à ${roundPercent(consumptionPercent)} % (seuil 80 %)`,
          status: 'ACTIVE',
        },
      });
    }

    if (
      shouldCreateBudgetAlert(
        100,
        consumptionPercent,
        project.budgetAlertAt100,
        !!existing100,
      )
    ) {
      await this.prisma.alert.create({
        data: {
          projectId,
          type: 'BUDGET_100',
          message: `Budget consommé à ${roundPercent(consumptionPercent)} % (seuil 100 %)`,
          status: 'ACTIVE',
        },
      });
    }
  }

  private mapResource(
    row: ProjectResource & { createdBy: { firstName: string; lastName: string } },
  ): ResourceResponse {
    return {
      id: row.id,
      projectId: row.projectId,
      type: resourceTypeToFrench(row.type),
      label: row.label,
      unitCost: Number(row.unitCost),
      quantity: Number(row.quantity),
      totalPlanned: Number(row.totalPlanned),
      notes: row.notes ?? undefined,
      createdByName: `${row.createdBy.firstName} ${row.createdBy.lastName}`,
      createdAt: formatDateFr(row.createdAt),
    };
  }

  private mapExpense(
    row: ProjectExpense & { createdBy: { firstName: string; lastName: string } },
  ): ExpenseResponse {
    return {
      id: row.id,
      projectId: row.projectId,
      category: expenseCategoryToFrench(row.category),
      label: row.label,
      amount: Number(row.amount),
      expenseDate: formatDateFr(row.expenseDate),
      supplier: row.supplier ?? undefined,
      invoiceReference: row.invoiceReference ?? undefined,
      status: expenseStatusToFrench(row.status),
      notes: row.notes ?? undefined,
      createdByName: `${row.createdBy.firstName} ${row.createdBy.lastName}`,
      createdAt: formatDateFr(row.createdAt),
    };
  }

  private parseResourceType(value: string): ResourceType {
    const type =
      RESOURCE_TYPE_FROM_FRENCH[value] ??
      (Object.values(ResourceType).includes(value as ResourceType)
        ? (value as ResourceType)
        : undefined);
    if (!type) {
      throw new BadRequestException('Type de ressource invalide.');
    }
    return type;
  }

  private parseExpenseCategory(value: string): ExpenseCategory {
    const category =
      EXPENSE_CATEGORY_FROM_FRENCH[value] ??
      (Object.values(ExpenseCategory).includes(value as ExpenseCategory)
        ? (value as ExpenseCategory)
        : undefined);
    if (!category) {
      throw new BadRequestException('Catégorie de dépense invalide.');
    }
    return category;
  }

  private assertPositiveAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Le montant de la dépense doit être strictement positif.');
    }
  }

  private async findResourceOrThrow(
    projectId: string,
    resourceId: string,
  ): Promise<ProjectResource> {
    const row = await this.prisma.projectResource.findFirst({
      where: { id: resourceId, projectId },
    });
    if (!row) {
      throw new NotFoundException('Ressource introuvable.');
    }
    return row;
  }

  private async findExpenseOrThrow(
    projectId: string,
    expenseId: string,
  ): Promise<ProjectExpense> {
    const row = await this.prisma.projectExpense.findFirst({
      where: { id: expenseId, projectId },
    });
    if (!row) {
      throw new NotFoundException('Dépense introuvable.');
    }
    return row;
  }

  private async assertCanReadProject(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<void> {
    if (role === 'DIRECTION' || role === 'ASSISTANTE_ADMINISTRATIVE') {
      await this.ensureProjectExists(projectId);
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
    throw new ForbiddenException('Accès refusé pour ce rôle.');
  }

  private async assertCanWriteProject(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<void> {
    if (role === 'ASSISTANTE_ADMINISTRATIVE') {
      await this.ensureProjectExists(projectId);
      return;
    }
    if (role === 'CONDUCTEUR_TRAVAUX') {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, conductorId: userId },
      });
      if (!project) {
        throw new ForbiddenException('Action réservée au conducteur référent du chantier.');
      }
      return;
    }
    throw new ForbiddenException('Action réservée au conducteur ou à l\'assistante administrative.');
  }

  private async ensureProjectExists(projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      throw new NotFoundException('Chantier introuvable.');
    }
  }
}
