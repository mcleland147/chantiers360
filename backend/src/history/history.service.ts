import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(input: {
    projectId: string;
    userId: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
  }) {
    return this.prisma.historyEvent.create({
      data: {
        projectId: input.projectId,
        userId: input.userId,
        action: input.action,
        oldValue: input.oldValue,
        newValue: input.newValue,
        reason: input.reason,
      },
    });
  }

  findByProject(projectId: string) {
    return this.prisma.historyEvent.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
