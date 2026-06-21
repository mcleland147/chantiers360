import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsRepository } from '../projects/repositories/projects.repository';
import {
  buildAlertsFromData,
  computeBudgetOverview,
  computeConducteurKpis,
  computeDirectionKpisFromData,
  computeMonthlyTrend,
  ConducteurDashboardResponse,
  DirectionDashboardResponse,
  getAtRiskFromData,
  groupByConductor,
  groupByStatus,
  mapIssuesToReserves,
  mapProjectsToChantiers,
} from './dashboard.helpers';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsRepository: ProjectsRepository,
  ) {}

  async getConducteurDashboard(
    conductorId: string,
  ): Promise<ConducteurDashboardResponse> {
    const projects = (await this.projectsRepository.findAll()).filter(
      (p) => p.conductorId === conductorId,
    );
    const chantiers = mapProjectsToChantiers(projects);
    const projectIds = projects.map((p) => p.id);

    const issues = await this.prisma.issue.findMany({
      where: { projectId: { in: projectIds } },
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    const usersById = await this.loadUsersForIssues(issues);
    const openIssues = issues.filter(
      (i) => i.status === 'OUVERTE' || i.status === 'EN_COURS',
    );

    return {
      kpis: computeConducteurKpis(chantiers, issues),
      alerts: buildAlertsFromData(chantiers, issues),
      recentChantiers: chantiers.slice(0, 4),
      recentReserves: mapIssuesToReserves(
        openIssues
          .filter(
            (i) => i.priority === 'HAUTE' || i.priority === 'CRITIQUE',
          )
          .slice(0, 10),
        usersById,
      ),
    };
  }

  async getDirectionDashboard(): Promise<DirectionDashboardResponse> {
    const projects = await this.projectsRepository.findAll();
    const chantiers = mapProjectsToChantiers(projects);

    const issues = await this.prisma.issue.findMany({
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      kpis: computeDirectionKpisFromData(chantiers, issues),
      atRiskChantiers: getAtRiskFromData(chantiers, issues),
      statusDistribution: groupByStatus(chantiers),
      conductorDistribution: groupByConductor(chantiers),
      monthlyTrend: computeMonthlyTrend(projects, issues),
      budget: computeBudgetOverview(chantiers),
    };
  }

  assertRole(userRole: string, allowed: string[]): void {
    if (!allowed.includes(userRole)) {
      throw new ForbiddenException('Accès refusé pour ce rôle.');
    }
  }

  private async loadUsersForIssues(
    issues: Array<{ createdById: string }>,
  ) {
    const ids = [...new Set(issues.map((i) => i.createdById))];
    const users = await this.prisma.user.findMany({ where: { id: { in: ids } } });
    return new Map(users.map((u) => [u.id, u]));
  }
}
