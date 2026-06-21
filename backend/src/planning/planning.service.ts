import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScheduleStatus, UserRoleName } from '@prisma/client';
import {
  computeOccupationPercent,
  findScheduleConflict,
  hoursBetween,
  validateScheduleInterval,
  weekCountBetween,
} from '../common/rules/planning-conflicts.rules';
import { formatDateFr, formatTimeFr } from '../common/mappers/chantier.mapper';
import { HistoryService } from '../history/history.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkersService } from '../workers/workers.service';
import type {
  ConflictQueryDto,
  CreateScheduleSlotDto,
  PlanningQueryDto,
  UpdateScheduleSlotDto,
} from './dto/planning.dto';

export interface ScheduleSlotResponse {
  id: string;
  workerId: string;
  workerName: string;
  projectId: string;
  projectReference: string;
  projectName: string;
  startAt: string;
  endAt: string;
  status: string;
  notes?: string;
  createdByName: string;
}

export interface OccupationKpiResponse {
  from: string;
  to: string;
  plannedHours: number;
  referenceHoursPerWeek: number;
  occupationPercent: number;
  workers: Array<{
    workerId: string;
    workerName: string;
    plannedHours: number;
    occupationPercent: number;
  }>;
}

const STATUS_TO_FRENCH: Record<ScheduleStatus, string> = {
  PLANNED: 'Planifié',
  CONFIRMED: 'Confirmé',
  CANCELLED: 'Annulé',
};

const STATUS_FROM_FRENCH: Record<string, ScheduleStatus> = {
  Planifié: 'PLANNED',
  Confirmé: 'CONFIRMED',
  Annulé: 'CANCELLED',
};

type SlotRow = {
  id: string;
  workerId: string;
  projectId: string;
  startAt: Date;
  endAt: Date;
  status: ScheduleStatus;
  notes: string | null;
  worker: { firstName: string; lastName: string; isActive: boolean };
  project: { reference: string; name: string };
  createdBy: { firstName: string; lastName: string };
};

@Injectable()
export class PlanningService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workersService: WorkersService,
    private readonly historyService: HistoryService,
  ) {}

  async findSlots(
    query: PlanningQueryDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ScheduleSlotResponse[]> {
    const from = new Date(query.from);
    const to = new Date(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      throw new BadRequestException('Plage de dates invalide.');
    }

    const projectScope = await this.buildProjectScopeForRole(userId, role);
    if (projectScope.length === 0 && role === 'CHEF_CHANTIER') {
      return [];
    }

    const where: import('@prisma/client').Prisma.WorkerScheduleWhereInput = {
      startAt: { lt: to },
      endAt: { gt: from },
    };

    if (projectScope.length > 0) {
      where.projectId = { in: projectScope };
    }
    if (query.projectId) {
      if (projectScope.length > 0 && !projectScope.includes(query.projectId)) {
        return [];
      }
      where.projectId = query.projectId;
    }
    if (query.workerId) {
      where.workerId = query.workerId;
    }

    const rows = await this.prisma.workerSchedule.findMany({
      where,
      include: {
        worker: true,
        project: true,
        createdBy: true,
      },
      orderBy: [{ startAt: 'asc' }],
    });

    return rows.map((row) => this.mapSlot(row));
  }

  async createSlot(
    dto: CreateScheduleSlotDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ScheduleSlotResponse> {
    await this.assertCanWriteProject(dto.projectId, userId, role);

    const startAt = new Date(dto.startAt);
    const endAt = new Date(dto.endAt);
    const intervalError = validateScheduleInterval(startAt, endAt);
    if (intervalError) {
      throw new BadRequestException(intervalError);
    }

    await this.workersService.ensureActiveForScheduling(dto.workerId);
    await this.ensureProjectExists(dto.projectId);
    await this.assertNoConflict(dto.workerId, startAt, endAt);

    const status = dto.status
      ? STATUS_FROM_FRENCH[dto.status] ?? 'PLANNED'
      : 'PLANNED';

    const row = await this.prisma.workerSchedule.create({
      data: {
        workerId: dto.workerId,
        projectId: dto.projectId,
        startAt,
        endAt,
        status,
        notes: dto.notes?.trim() || null,
        createdById: userId,
      },
      include: { worker: true, project: true, createdBy: true },
    });

    await this.historyService.recordEvent({
      projectId: dto.projectId,
      userId,
      action: 'Affectation planning',
      newValue: `${row.worker.firstName} ${row.worker.lastName} (${formatDateFr(startAt)} ${formatTimeFr(startAt)}–${formatTimeFr(endAt)})`,
    });

    return this.mapSlot(row);
  }

  async updateSlot(
    id: string,
    dto: UpdateScheduleSlotDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ScheduleSlotResponse> {
    const existing = await this.prisma.workerSchedule.findUnique({
      where: { id },
      include: { worker: true, project: true, createdBy: true },
    });
    if (!existing) {
      throw new NotFoundException('Créneau introuvable.');
    }

    await this.assertCanWriteProject(existing.projectId, userId, role);

    const workerId = dto.workerId ?? existing.workerId;
    const projectId = dto.projectId ?? existing.projectId;
    const startAt = dto.startAt ? new Date(dto.startAt) : existing.startAt;
    const endAt = dto.endAt ? new Date(dto.endAt) : existing.endAt;

    if (dto.projectId && dto.projectId !== existing.projectId) {
      await this.assertCanWriteProject(projectId, userId, role);
      await this.ensureProjectExists(projectId);
    }

    const intervalError = validateScheduleInterval(startAt, endAt);
    if (intervalError) {
      throw new BadRequestException(intervalError);
    }

    if (dto.workerId || existing.status !== 'CANCELLED') {
      await this.workersService.ensureActiveForScheduling(workerId);
    }

    const nextStatus = dto.status
      ? STATUS_FROM_FRENCH[dto.status]
      : existing.status;
    if (dto.status && !nextStatus) {
      throw new BadRequestException('Statut de créneau invalide.');
    }

    if (nextStatus !== 'CANCELLED') {
      await this.assertNoConflict(workerId, startAt, endAt, id);
    }

    const row = await this.prisma.workerSchedule.update({
      where: { id },
      data: {
        workerId,
        projectId,
        startAt,
        endAt,
        status: nextStatus,
        notes: dto.notes === undefined ? undefined : dto.notes?.trim() || null,
      },
      include: { worker: true, project: true, createdBy: true },
    });

    await this.historyService.recordEvent({
      projectId: row.projectId,
      userId,
      action: 'Modification planning',
      newValue: `${row.worker.firstName} ${row.worker.lastName} (${formatDateFr(startAt)} ${formatTimeFr(startAt)}–${formatTimeFr(endAt)})`,
    });

    return this.mapSlot(row);
  }

  async cancelSlot(
    id: string,
    userId: string,
    role: UserRoleName,
  ): Promise<ScheduleSlotResponse> {
    const existing = await this.prisma.workerSchedule.findUnique({
      where: { id },
      include: { worker: true, project: true, createdBy: true },
    });
    if (!existing) {
      throw new NotFoundException('Créneau introuvable.');
    }

    await this.assertCanWriteProject(existing.projectId, userId, role);

    const row =
      existing.status === 'CANCELLED'
        ? existing
        : await this.prisma.workerSchedule.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: { worker: true, project: true, createdBy: true },
          });

    if (existing.status !== 'CANCELLED') {
      await this.historyService.recordEvent({
        projectId: row.projectId,
        userId,
        action: 'Annulation planning',
        newValue: `${row.worker.firstName} ${row.worker.lastName} (${formatDateFr(row.startAt)} ${formatTimeFr(row.startAt)}–${formatTimeFr(row.endAt)})`,
      });
    }

    return this.mapSlot(row);
  }

  async findConflicts(query: ConflictQueryDto): Promise<{ hasConflict: boolean; conflict?: ScheduleSlotResponse }> {
    const startAt = new Date(query.startAt);
    const endAt = new Date(query.endAt);
    const intervalError = validateScheduleInterval(startAt, endAt);
    if (intervalError) {
      throw new BadRequestException(intervalError);
    }

    const conflict = await this.findConflictRow(
      query.workerId,
      startAt,
      endAt,
      query.excludeSlotId,
    );

    return {
      hasConflict: Boolean(conflict),
      conflict: conflict ? this.mapSlot(conflict) : undefined,
    };
  }

  async getOccupationKpi(
    fromIso: string,
    toIso: string,
    userId: string,
    role: UserRoleName,
  ): Promise<OccupationKpiResponse> {
    const from = new Date(fromIso);
    const to = new Date(toIso);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
      throw new BadRequestException('Plage de dates invalide.');
    }

    const slots = (await this.findSlots({ from: fromIso, to: toIso }, userId, role)).filter(
      (slot) => slot.status !== 'Annulé',
    );

    const weeks = weekCountBetween(from, to);
    const workerHours = new Map<string, { name: string; hours: number }>();

    for (const slot of slots) {
      const hours = hoursBetween(new Date(slot.startAt), new Date(slot.endAt));
      const current = workerHours.get(slot.workerId) ?? {
        name: slot.workerName,
        hours: 0,
      };
      current.hours += hours;
      workerHours.set(slot.workerId, current);
    }

    const workers = [...workerHours.entries()].map(([workerId, data]) => ({
      workerId,
      workerName: data.name,
      plannedHours: Math.round(data.hours * 10) / 10,
      occupationPercent: computeOccupationPercent(data.hours, weeks),
    }));

    const totalHours = workers.reduce((sum, w) => sum + w.plannedHours, 0);

    return {
      from: from.toISOString(),
      to: to.toISOString(),
      plannedHours: Math.round(totalHours * 10) / 10,
      referenceHoursPerWeek: 35,
      occupationPercent: computeOccupationPercent(totalHours, weeks),
      workers,
    };
  }

  private formatConflictMessage(slot: ScheduleSlotResponse): string {
    const start = new Date(slot.startAt);
    const end = new Date(slot.endAt);
    return (
      `Conflit de planning — ${slot.workerName} est déjà affecté sur ${slot.projectReference} (${slot.projectName}) ` +
      `le ${formatDateFr(start)} de ${formatTimeFr(start)} à ${formatTimeFr(end)}.`
    );
  }

  private async assertNoConflict(
    workerId: string,
    startAt: Date,
    endAt: Date,
    excludeSlotId?: string,
  ) {
    const conflict = await this.findConflictRow(workerId, startAt, endAt, excludeSlotId);
    if (conflict) {
      const mapped = this.mapSlot(conflict);
      throw new ConflictException({
        message: this.formatConflictMessage(mapped),
        conflict: mapped,
      });
    }
  }

  private async findConflictRow(
    workerId: string,
    startAt: Date,
    endAt: Date,
    excludeSlotId?: string,
  ): Promise<SlotRow | null> {
    const rows = await this.prisma.workerSchedule.findMany({
      where: {
        workerId,
        status: { not: 'CANCELLED' },
        startAt: { lt: endAt },
        endAt: { gt: startAt },
        ...(excludeSlotId ? { id: { not: excludeSlotId } } : {}),
      },
      include: { worker: true, project: true, createdBy: true },
    });

    const conflict = findScheduleConflict(
      { id: excludeSlotId, startAt, endAt, status: 'PLANNED' },
      rows.map((row) => ({
        id: row.id,
        startAt: row.startAt,
        endAt: row.endAt,
        status: row.status,
      })),
    );

    if (!conflict) return null;
    return rows.find((row) => row.id === conflict.id) ?? null;
  }

  private async buildProjectScopeForRole(
    userId: string,
    role: UserRoleName,
  ): Promise<string[]> {
    if (role === 'DIRECTION' || role === 'ASSISTANTE_ADMINISTRATIVE') {
      return [];
    }
    if (role === 'CONDUCTEUR_TRAVAUX') {
      const projects = await this.prisma.project.findMany({
        where: { conductorId: userId },
        select: { id: true },
      });
      return projects.map((p) => p.id);
    }
    if (role === 'CHEF_CHANTIER') {
      const assignments = await this.prisma.assignment.findMany({
        where: { userId, isActive: true },
        select: { projectId: true },
      });
      return assignments.map((a) => a.projectId);
    }
    return [];
  }

  private async assertCanWriteProject(
    projectId: string,
    userId: string,
    role: UserRoleName,
  ) {
    if (role !== 'CONDUCTEUR_TRAVAUX') {
      throw new ForbiddenException('Action réservée au conducteur de travaux.');
    }
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, conductorId: userId },
    });
    if (!project) {
      throw new ForbiddenException('Accès chantier refusé.');
    }
  }

  private async ensureProjectExists(projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundException('Chantier introuvable.');
    }
    return project;
  }

  private mapSlot(row: SlotRow): ScheduleSlotResponse {
    return {
      id: row.id,
      workerId: row.workerId,
      workerName: `${row.worker.firstName} ${row.worker.lastName}`,
      projectId: row.projectId,
      projectReference: row.project.reference,
      projectName: row.project.name,
      startAt: row.startAt.toISOString(),
      endAt: row.endAt.toISOString(),
      status: STATUS_TO_FRENCH[row.status],
      notes: row.notes ?? undefined,
      createdByName: `${row.createdBy.firstName} ${row.createdBy.lastName}`,
    };
  }
}
