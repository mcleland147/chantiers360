import { Injectable } from '@nestjs/common';
import { IssueStatus, Prisma, Project, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const projectInclude = {
  conductor: { include: { role: true } },
  issues: { select: { status: true } },
  progress: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: { progressRatio: true },
  },
  _count: {
    select: {
      issues: {
        where: { status: { in: ['OUVERTE', 'EN_COURS'] as IssueStatus[] } },
      },
    },
  },
} satisfies Prisma.ProjectInclude;

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  include: typeof projectInclude;
}>;

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<ProjectWithRelations[]> {
    return this.prisma.project.findMany({
      include: projectInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findByIds(ids: string[]): Promise<ProjectWithRelations[]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this.prisma.project.findMany({
      where: { id: { in: ids } },
      include: projectInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findById(id: string): Promise<ProjectWithRelations | null> {
    return this.prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });
  }

  findByReference(reference: string): Promise<Project | null> {
    return this.prisma.project.findUnique({ where: { reference } });
  }

  create(data: Prisma.ProjectCreateInput): Promise<ProjectWithRelations> {
    return this.prisma.project.create({
      data,
      include: projectInclude,
    });
  }

  update(
    id: string,
    data: Prisma.ProjectUpdateInput,
  ): Promise<ProjectWithRelations> {
    return this.prisma.project.update({
      where: { id },
      data,
      include: projectInclude,
    });
  }

  updateStatus(
    id: string,
    status: ProjectStatus,
    receptionDate?: Date | null,
  ): Promise<ProjectWithRelations> {
    return this.prisma.project.update({
      where: { id },
      data: {
        status,
        receptionDate,
      },
      include: projectInclude,
    });
  }
}
