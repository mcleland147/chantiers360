import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Issue, IssuePriority, IssueStatus, Project, User, UserRoleName } from '@prisma/client';
import { BusinessRuleException } from '../common/exceptions/business-rule.exception';
import {
  formatDateFr,
  issuePriorityFromFrench,
  issuePriorityToFrench,
  issueStatusFromFrench,
  issueStatusToFrench,
  photoCategoryFromFrench,
  photoCategoryToFrench,
} from '../common/mappers/chantier.mapper';
import {
  canAddPhoto,
  canAddProgressUpdate,
  canAssignMember,
  canCreateReserve,
  canTakeChargeReserve,
  canValidateReserveLevee,
  validateAssignmentFields,
  validatePhotoFields,
  validateProgressComment,
  validateProgressPercent,
  validateReserveFields,
  validateReserveLeveeTransition,
  validateReservePriseEnChargeTransition,
} from '../common/rules/chantier-tabs.rules';
import { HistoryService } from '../history/history.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsRepository } from './repositories/projects.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { CreateProgressDto } from './dto/create-progress.dto';
import { CreateReserveDto } from './dto/create-reserve.dto';

export interface AssignmentResponse {
  id: string;
  chantierId: string;
  collaboratorName: string;
  jobTitle: string;
  assignedAt: string;
  isActive: boolean;
}

export interface ProgressResponse {
  id: string;
  chantierId: string;
  date: string;
  authorName: string;
  comment: string;
  percent?: number;
}

export interface ReserveResponse {
  id: string;
  chantierId: string;
  reference: string;
  title: string;
  chantierReference: string;
  chantierName: string;
  priority: string;
  status: string;
  assigneeName: string;
  createdByName: string;
  createdAt: string;
  takenAt?: string;
  closedAt?: string;
}

export interface GlobalReserveFilters {
  search?: string;
  status?: string;
  priority?: string;
  chantierId?: string;
  assigneeId?: string;
}

export interface GlobalPhotoFilters {
  chantierId?: string;
  category?: string;
  authorId?: string;
}

export interface PhotoResponse {
  id: string;
  chantierId: string;
  chantierReference: string;
  chantierName: string;
  category: string;
  fileName: string;
  fileUrl: string;
  authorName: string;
  date: string;
  comment?: string;
}

@Injectable()
export class ChantierTabsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly historyService: HistoryService,
    private readonly prisma: PrismaService,
  ) {}

  async getAssignments(projectId: string): Promise<AssignmentResponse[]> {
    await this.ensureProjectExists(projectId);
    const rows = await this.prisma.assignment.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { assignmentDate: 'desc' },
    });
    return rows.map((row) => ({
      id: row.id,
      chantierId: row.projectId,
      collaboratorName: `${row.user.firstName} ${row.user.lastName}`,
      jobTitle: row.functionLabel,
      assignedAt: formatDateFr(row.assignmentDate),
      isActive: row.isActive,
    }));
  }

  async createAssignment(
    projectId: string,
    dto: CreateAssignmentDto,
    userId: string,
    role: UserRoleName,
  ): Promise<AssignmentResponse> {
    if (!canAssignMember(role)) {
      throw new ForbiddenException('Action réservée au conducteur de travaux.');
    }

    const validationError = validateAssignmentFields({
      userId: dto.userId,
      functionLabel: dto.functionLabel,
    });
    if (validationError) {
      throw new BusinessRuleException('RG-TABS-006', validationError);
    }

    await this.ensureProjectExists(projectId);

    const collaborator = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!collaborator) {
      throw new NotFoundException('Collaborateur introuvable.');
    }

    const row = await this.prisma.assignment.create({
      data: {
        projectId,
        userId: dto.userId,
        functionLabel: dto.functionLabel.trim(),
      },
      include: { user: true },
    });

    await this.historyService.recordEvent({
      projectId,
      userId,
      action: 'Affectation équipe',
      newValue: `${row.user.firstName} ${row.user.lastName} — ${row.functionLabel}`,
    });

    return {
      id: row.id,
      chantierId: row.projectId,
      collaboratorName: `${row.user.firstName} ${row.user.lastName}`,
      jobTitle: row.functionLabel,
      assignedAt: formatDateFr(row.assignmentDate),
      isActive: row.isActive,
    };
  }

  async getProgress(projectId: string): Promise<ProgressResponse[]> {
    await this.ensureProjectExists(projectId);
    const rows = await this.prisma.progressUpdate.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    const authorIds = [...new Set(rows.map((r) => r.authorId))];
    const authors = await this.prisma.user.findMany({
      where: { id: { in: authorIds } },
    });
    const authorMap = new Map(
      authors.map((a) => [a.id, `${a.firstName} ${a.lastName}`]),
    );

    return rows.map((row) => ({
      id: row.id,
      chantierId: row.projectId,
      date: formatDateFr(row.createdAt),
      authorName: authorMap.get(row.authorId) ?? 'Utilisateur',
      comment: row.comment,
      percent: row.progressRatio ?? undefined,
    }));
  }

  async createProgress(
    projectId: string,
    dto: CreateProgressDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ProgressResponse> {
    if (!canAddProgressUpdate(role)) {
      throw new ForbiddenException(
        'Action réservée au conducteur ou au chef de chantier.',
      );
    }

    const commentError = validateProgressComment(dto.comment);
    if (commentError) {
      throw new BusinessRuleException('RG-TABS-001', commentError);
    }
    const percentError = validateProgressPercent(dto.percent);
    if (percentError) {
      throw new BusinessRuleException('RG-TABS-002', percentError);
    }

    await this.ensureProjectExists(projectId);

    const row = await this.prisma.progressUpdate.create({
      data: {
        projectId,
        authorId: userId,
        comment: dto.comment.trim(),
        progressRatio: dto.percent,
      },
    });

    const author = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.historyService.recordEvent({
      projectId,
      userId,
      action: 'Mise à jour avancement',
      newValue: dto.percent !== undefined ? `${dto.percent} %` : undefined,
      reason: dto.comment.trim(),
    });

    return {
      id: row.id,
      chantierId: row.projectId,
      date: formatDateFr(row.createdAt),
      authorName: author
        ? `${author.firstName} ${author.lastName}`
        : 'Utilisateur',
      comment: row.comment,
      percent: row.progressRatio ?? undefined,
    };
  }

  async getReserves(projectId: string): Promise<ReserveResponse[]> {
    const project = await this.ensureProjectExists(projectId);
    const rows = await this.prisma.issue.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return this.mapIssuesToReserves(rows, project);
  }

  async findAllReserves(
    filters: GlobalReserveFilters,
    userId: string,
    role: UserRoleName,
  ): Promise<ReserveResponse[]> {
    const projectScope = await this.buildProjectScopeForRole(userId, role);
    if (projectScope.length === 0 && role === 'CHEF_CHANTIER') {
      return [];
    }

    const where: import('@prisma/client').Prisma.IssueWhereInput = {};

    if (projectScope.length > 0) {
      where.projectId = { in: projectScope };
    }
    if (filters.chantierId) {
      if (projectScope.length > 0 && !projectScope.includes(filters.chantierId)) {
        return [];
      }
      where.projectId = filters.chantierId;
    }
    if (filters.status) {
      try {
        where.status = issueStatusFromFrench(filters.status);
      } catch {
        return [];
      }
    }
    if (filters.priority) {
      try {
        where.priority = issuePriorityFromFrench(filters.priority);
      } catch {
        return [];
      }
    }
    if (filters.assigneeId) {
      where.assignedToId = filters.assigneeId;
    }
    if (filters.search?.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const rows = await this.prisma.issue.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    const projects = new Map(rows.map((r) => [r.projectId, r.project]));
    return rows.map((row) => {
      const project = projects.get(row.projectId)!;
      return this.mapIssueToReserve(row, project, 0);
    });
  }

  async findAllPhotos(
    filters: GlobalPhotoFilters,
    userId: string,
    role: UserRoleName,
  ): Promise<PhotoResponse[]> {
    const projectScope = await this.buildProjectScopeForRole(userId, role);
    if (projectScope.length === 0 && role === 'CHEF_CHANTIER') {
      return [];
    }

    const where: import('@prisma/client').Prisma.PhotoWhereInput = {};

    if (projectScope.length > 0) {
      where.projectId = { in: projectScope };
    }
    if (filters.chantierId) {
      if (projectScope.length > 0 && !projectScope.includes(filters.chantierId)) {
        return [];
      }
      where.projectId = filters.chantierId;
    }
    if (filters.category) {
      try {
        where.category = photoCategoryFromFrench(filters.category);
      } catch {
        return [];
      }
    }
    if (filters.authorId) {
      where.addedById = filters.authorId;
    }

    const rows = await this.prisma.photo.findMany({
      where,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    const authorIds = [...new Set(rows.map((r) => r.addedById))];
    const authors = await this.prisma.user.findMany({
      where: { id: { in: authorIds } },
    });
    const authorMap = new Map(
      authors.map((a) => [a.id, `${a.firstName} ${a.lastName}`]),
    );

    return rows.map((row) => ({
      id: row.id,
      chantierId: row.projectId,
      chantierReference: row.project.reference,
      chantierName: row.project.name,
      category: photoCategoryToFrench(row.category),
      fileName: row.fileName,
      fileUrl: row.fileUrl,
      authorName: authorMap.get(row.addedById) ?? 'Utilisateur',
      date: formatDateFr(row.createdAt),
      comment: row.comment ?? undefined,
    }));
  }

  async createReserve(
    projectId: string,
    dto: CreateReserveDto,
    userId: string,
    role: UserRoleName,
  ): Promise<ReserveResponse> {
    if (!canCreateReserve(role)) {
      throw new ForbiddenException(
        'Action réservée au conducteur ou au chef de chantier.',
      );
    }

    let priority;
    try {
      priority = issuePriorityFromFrench(dto.priority);
    } catch {
      throw new BusinessRuleException(
        'RG-TABS-003',
        'Priorité de réserve invalide.',
      );
    }

    const validationError = validateReserveFields({
      title: dto.title,
      priority,
    });
    if (validationError) {
      throw new BusinessRuleException('RG-TABS-003', validationError);
    }

    const project = await this.ensureProjectExists(projectId);

    const row = await this.prisma.issue.create({
      data: {
        projectId,
        title: dto.title.trim(),
        description: dto.description?.trim() ?? dto.title.trim(),
        priority,
        createdById: userId,
      },
    });

    const creator = await this.prisma.user.findUnique({ where: { id: userId } });
    const count = await this.prisma.issue.count({ where: { projectId } });

    await this.historyService.recordEvent({
      projectId,
      userId,
      action: 'Création réserve',
      newValue: `${dto.title.trim()} (${dto.priority})`,
    });

    return {
      id: row.id,
      chantierId: row.projectId,
      reference: this.buildReserveReference(project.reference, count - 1, row.id),
      title: row.title,
      chantierReference: project.reference,
      chantierName: project.name,
      priority: issuePriorityToFrench(row.priority),
      status: issueStatusToFrench(row.status),
      assigneeName: 'Non assigné',
      createdByName: creator
        ? `${creator.firstName} ${creator.lastName}`
        : 'Utilisateur',
      createdAt: formatDateFr(row.createdAt),
    };
  }

  async takeReserveCharge(
    projectId: string,
    reserveId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<ReserveResponse> {
    if (!canTakeChargeReserve(role)) {
      throw new ForbiddenException(
        'Action réservée au conducteur ou au chef de chantier.',
      );
    }

    const project = await this.ensureProjectExists(projectId);
    const issue = await this.prisma.issue.findFirst({
      where: { id: reserveId, projectId },
    });
    if (!issue) {
      throw new NotFoundException('Réserve introuvable.');
    }

    const transitionError = validateReservePriseEnChargeTransition(issue.status);
    if (transitionError) {
      throw new BusinessRuleException('RG-TABS-008', transitionError);
    }

    const now = new Date();
    const updated = await this.prisma.issue.update({
      where: { id: reserveId },
      data: {
        status: 'EN_COURS',
        assignedToId: userId,
        takenAt: now,
      },
    });

    const assignee = await this.prisma.user.findUnique({ where: { id: userId } });
    const creator = await this.prisma.user.findUnique({
      where: { id: updated.createdById },
    });

    await this.historyService.recordEvent({
      projectId,
      userId,
      action: 'Prise en charge réserve',
      oldValue: issueStatusToFrench('OUVERTE'),
      newValue: issueStatusToFrench('EN_COURS'),
      reason: updated.title,
    });

    return this.mapIssueToReserve(updated, project, 0, assignee, creator);
  }

  async validateReserveLevee(
    projectId: string,
    reserveId: string,
    userId: string,
    role: UserRoleName,
  ): Promise<ReserveResponse> {
    if (!canValidateReserveLevee(role)) {
      throw new ForbiddenException('Action réservée au conducteur de travaux.');
    }

    const project = await this.ensureProjectExists(projectId);
    const issue = await this.prisma.issue.findFirst({
      where: { id: reserveId, projectId },
    });
    if (!issue) {
      throw new NotFoundException('Réserve introuvable.');
    }

    const transitionError = validateReserveLeveeTransition(issue.status);
    if (transitionError) {
      throw new BusinessRuleException('RG-TABS-004', transitionError);
    }

    const updated = await this.prisma.issue.update({
      where: { id: reserveId },
      data: {
        status: 'LEVEE',
        closedById: userId,
        closedAt: new Date(),
      },
    });

    const creator = await this.prisma.user.findUnique({
      where: { id: updated.createdById },
    });
    const assignee = updated.assignedToId
      ? await this.prisma.user.findUnique({ where: { id: updated.assignedToId } })
      : null;

    await this.historyService.recordEvent({
      projectId,
      userId,
      action: 'Levée réserve validée',
      oldValue: issueStatusToFrench('EN_COURS'),
      newValue: issueStatusToFrench('LEVEE'),
      reason: updated.title,
    });

    return this.mapIssueToReserve(updated, project, 0, assignee, creator);
  }

  async getPhotos(projectId: string): Promise<PhotoResponse[]> {
    const project = await this.ensureProjectExists(projectId);
    const rows = await this.prisma.photo.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    const authorIds = [...new Set(rows.map((r) => r.addedById))];
    const authors = await this.prisma.user.findMany({
      where: { id: { in: authorIds } },
    });
    const authorMap = new Map(
      authors.map((a) => [a.id, `${a.firstName} ${a.lastName}`]),
    );

    return rows.map((row) => ({
      id: row.id,
      chantierId: row.projectId,
      chantierReference: project.reference,
      chantierName: project.name,
      category: photoCategoryToFrench(row.category),
      fileName: row.fileName,
      fileUrl: row.fileUrl,
      authorName: authorMap.get(row.addedById) ?? 'Utilisateur',
      date: formatDateFr(row.createdAt),
      comment: row.comment ?? undefined,
    }));
  }

  async createPhoto(
    projectId: string,
    dto: CreatePhotoDto,
    userId: string,
    role: UserRoleName,
  ): Promise<PhotoResponse> {
    if (!canAddPhoto(role)) {
      throw new ForbiddenException(
        'Action réservée au conducteur ou au chef de chantier.',
      );
    }

    const validationError = validatePhotoFields({
      fileName: dto.fileName,
      category: dto.category,
    });
    if (validationError) {
      throw new BusinessRuleException('RG-TABS-005', validationError);
    }

    let category;
    try {
      category = photoCategoryFromFrench(dto.category);
    } catch {
      throw new BusinessRuleException(
        'RG-TABS-005',
        'Catégorie photo invalide.',
      );
    }

    const project = await this.ensureProjectExists(projectId);

    const row = await this.prisma.photo.create({
      data: {
        projectId,
        fileName: dto.fileName.trim(),
        fileUrl: dto.fileUrl?.trim() ?? `/uploads/${dto.fileName.trim()}`,
        category,
        comment: dto.comment?.trim(),
        addedById: userId,
      },
    });

    const author = await this.prisma.user.findUnique({ where: { id: userId } });

    await this.historyService.recordEvent({
      projectId,
      userId,
      action: 'Ajout photo',
      newValue: `${dto.fileName.trim()} (${dto.category})`,
    });

    return {
      id: row.id,
      chantierId: row.projectId,
      chantierReference: project.reference,
      chantierName: project.name,
      category: photoCategoryToFrench(row.category),
      fileName: row.fileName,
      fileUrl: row.fileUrl,
      authorName: author
        ? `${author.firstName} ${author.lastName}`
        : 'Utilisateur',
      date: formatDateFr(row.createdAt),
      comment: row.comment ?? undefined,
    };
  }

  private async buildProjectScopeForRole(
    userId: string,
    role: UserRoleName,
  ): Promise<string[]> {
    if (role === 'DIRECTION') {
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

  private async mapIssuesToReserves(
    rows: Issue[],
    project: Project,
  ): Promise<ReserveResponse[]> {
    const userIds = [
      ...new Set([
        ...rows.map((r) => r.createdById),
        ...rows.filter((r) => r.assignedToId).map((r) => r.assignedToId!),
      ]),
    ];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return rows.map((row, index) =>
      this.mapIssueToReserve(
        row,
        project,
        index,
        row.assignedToId ? userMap.get(row.assignedToId) : undefined,
        userMap.get(row.createdById),
      ),
    );
  }

  private mapIssueToReserve(
    row: Issue,
    project: Project,
    index: number,
    assignee?: User | null,
    creator?: User | null,
  ): ReserveResponse {
    return {
      id: row.id,
      chantierId: row.projectId,
      reference: this.buildReserveReference(project.reference, index, row.id),
      title: row.title,
      chantierReference: project.reference,
      chantierName: project.name,
      priority: issuePriorityToFrench(row.priority),
      status: issueStatusToFrench(row.status),
      assigneeName: assignee
        ? `${assignee.firstName} ${assignee.lastName}`
        : 'Non assigné',
      createdByName: creator
        ? `${creator.firstName} ${creator.lastName}`
        : 'Utilisateur',
      createdAt: formatDateFr(row.createdAt),
      takenAt: row.takenAt ? formatDateFr(row.takenAt) : undefined,
      closedAt: row.closedAt ? formatDateFr(row.closedAt) : undefined,
    };
  }

  private async ensureProjectExists(projectId: string) {
    const project = await this.projectsRepository.findById(projectId);
    if (!project) {
      throw new NotFoundException('Chantier introuvable.');
    }
    return project;
  }

  private buildReserveReference(
    projectReference: string,
    index: number,
    issueId: string,
  ): string {
    const suffix = issueId.slice(-3).toUpperCase();
    const projectNum = projectReference.replace(/\D/g, '').padStart(3, '0');
    return `RSV-${projectNum}-${suffix}`;
  }
}
