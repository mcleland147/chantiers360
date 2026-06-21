import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectStatus } from '@prisma/client';
import { BusinessRuleException } from '../common/exceptions/business-rule.exception';
import {
  formatDateFr,
  parseIsoDate,
  statusToFrench,
  statusFromFrench,
} from '../common/mappers/chantier.mapper';
import { buildChantierResponse } from '../common/builders/chantier-response.builder';
import {
  getInitialProjectStatus,
  validateChantierFields,
  validateChantierClosure,
  validateStatusChange,
} from '../common/rules/chantier-data.rules';
import { HistoryService } from '../history/history.service';
import { PrismaService } from '../prisma/prisma.service';
import { ChangeChantierStatusDto } from './dto/change-chantier-status.dto';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';
import {
  ProjectWithRelations,
  ProjectsRepository,
} from './repositories/projects.repository';

export interface ChantierResponse {
  id: string;
  reference: string;
  name: string;
  client: string;
  address: string;
  conductorId: string;
  conductorName: string;
  status: string;
  startDate: string;
  expectedEndDate: string;
  receptionDate?: string;
  budget?: number;
  budgetSpent: number;
  openReservesCount: number;
  progressPercent?: number;
  description: string;
}

export interface HistoryEventResponse {
  id: string;
  date: string;
  authorName: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly historyService: HistoryService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<ChantierResponse[]> {
    const projects = await this.projectsRepository.findAll();
    return projects.map((p) => this.toResponse(p));
  }

  async findAssigned(userId: string): Promise<ChantierResponse[]> {
    const assignments = await this.prisma.assignment.findMany({
      where: { userId, isActive: true },
      select: { projectId: true },
    });
    const projectIds = [...new Set(assignments.map((a) => a.projectId))];
    const projects = await this.projectsRepository.findByIds(projectIds);
    return projects.map((p) => this.toResponse(p));
  }

  async findOne(id: string): Promise<ChantierResponse> {
    const project = await this.projectsRepository.findById(id);
    if (!project) {
      throw new NotFoundException('Chantier introuvable.');
    }
    return this.toResponse(project);
  }

  async create(
    dto: CreateChantierDto,
    userId: string,
  ): Promise<ChantierResponse> {
    const startDate = parseIsoDate(dto.startDate);
    const expectedEndDate = parseIsoDate(dto.expectedEndDate);
    const validationError = validateChantierFields({
      reference: dto.reference,
      name: dto.name,
      client: dto.client,
      address: dto.address,
      conductorId: dto.conductorId,
      startDate,
      expectedEndDate,
    });
    if (validationError) {
      throw new BusinessRuleException('RG-DATA-001', validationError);
    }

    const existing = await this.projectsRepository.findByReference(
      dto.reference.trim(),
    );
    if (existing) {
      throw new ConflictException('Cette référence chantier existe déjà.');
    }

    const initialStatus = getInitialProjectStatus();
    const project = await this.projectsRepository.create({
      reference: dto.reference.trim(),
      name: dto.name.trim(),
      client: dto.client.trim(),
      address: dto.address.trim(),
      startDate,
      expectedEndDate,
      budget: dto.budget,
      status: initialStatus,
      conductor: { connect: { id: dto.conductorId } },
    });

    await this.historyService.recordEvent({
      projectId: project.id,
      userId,
      action: 'Création chantier',
      newValue: `${project.reference} — ${project.name}`,
    });

    return this.toResponse(project);
  }

  async update(
    id: string,
    dto: UpdateChantierDto,
    userId: string,
  ): Promise<ChantierResponse> {
    const existing = await this.projectsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Chantier introuvable.');
    }

    const startDate = dto.startDate
      ? parseIsoDate(dto.startDate)
      : existing.startDate;
    const expectedEndDate = dto.expectedEndDate
      ? parseIsoDate(dto.expectedEndDate)
      : existing.expectedEndDate;

    const validationError = validateChantierFields({
      reference: existing.reference,
      name: dto.name ?? existing.name,
      client: dto.client ?? existing.client,
      address: dto.address ?? existing.address,
      conductorId: dto.conductorId ?? existing.conductorId,
      startDate,
      expectedEndDate,
    });
    if (validationError) {
      throw new BusinessRuleException('RG-DATA-001', validationError);
    }

    const project = await this.projectsRepository.update(id, {
      name: dto.name?.trim(),
      client: dto.client?.trim(),
      address: dto.address?.trim(),
      startDate: dto.startDate ? startDate : undefined,
      expectedEndDate: dto.expectedEndDate ? expectedEndDate : undefined,
      budget: dto.budget,
      conductor: dto.conductorId
        ? { connect: { id: dto.conductorId } }
        : undefined,
    });

    await this.historyService.recordEvent({
      projectId: project.id,
      userId,
      action: 'Modification chantier',
      oldValue: existing.name,
      newValue: project.name,
    });

    return this.toResponse(project);
  }

  async changeStatus(
    id: string,
    dto: ChangeChantierStatusDto,
    userId: string,
  ): Promise<ChantierResponse> {
    const existing = await this.projectsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Chantier introuvable.');
    }

    const nextStatus = statusFromFrench(dto.status);
    const openReservesCount = existing._count?.issues ?? 0;
    const validationError = validateStatusChange(
      existing.status,
      nextStatus,
      dto.reason,
      openReservesCount,
    );
    if (validationError) {
      const isClosureBlock =
        nextStatus === 'CLOTURE' &&
        validateChantierClosure(openReservesCount) === validationError;
      if (isClosureBlock) {
        await this.historyService.recordEvent({
          projectId: id,
          userId,
          action: 'Tentative clôture refusée',
          oldValue: statusToFrench(existing.status),
          newValue: statusToFrench('CLOTURE'),
          reason: validationError,
        });
        throw new BusinessRuleException('RG-REC-013', validationError);
      }
      const ruleCode = validationError.includes('RG-DATA-004')
        ? 'RG-DATA-004'
        : 'RG-DATA-003';
      throw new BusinessRuleException(ruleCode, validationError);
    }

    let receptionDate = existing.receptionDate;
    if (nextStatus === 'RECEPTION') {
      receptionDate = new Date();
    } else if (existing.status === 'RECEPTION') {
      receptionDate = null;
    }

    const project = await this.projectsRepository.updateStatus(
      id,
      nextStatus,
      receptionDate,
    );

    await this.historyService.recordEvent({
      projectId: project.id,
      userId,
      action: 'Changement de statut',
      oldValue: statusToFrench(existing.status),
      newValue: statusToFrench(nextStatus as ProjectStatus),
      reason: dto.reason?.trim(),
    });

    return this.toResponse(project);
  }

  async getHistory(id: string): Promise<HistoryEventResponse[]> {
    const existing = await this.projectsRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Chantier introuvable.');
    }

    const events = await this.historyService.findByProject(id);
    const authorIds = [...new Set(events.map((e) => e.userId))];
    const authors = await this.prisma.user.findMany({
      where: { id: { in: authorIds } },
    });
    const authorMap = new Map(
      authors.map((a) => [a.id, `${a.firstName} ${a.lastName}`]),
    );

    return events.map((event) => ({
      id: event.id,
      date: formatDateFr(event.createdAt) + ' ' + formatTime(event.createdAt),
      authorName: authorMap.get(event.userId) ?? 'Utilisateur',
      action: event.action,
      oldValue: event.oldValue ?? undefined,
      newValue: event.newValue ?? undefined,
      reason: event.reason ?? undefined,
    }));
  }

  private toResponse(project: ProjectWithRelations): ChantierResponse {
    return buildChantierResponse(project);
  }
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
