import {
  AlertResponse,
  buildChantierResponse,
  buildReserveResponse,
  ChantierResponse,
  isCriticalPriority,
  isOpenIssueStatus,
  ReserveResponse,
  userDisplayName,
} from '../common/builders/chantier-response.builder';
import {
  isActiveProject,
  isProjectLate,
} from '../common/rules/chantier-late.rules';
import { formatDateFr, statusToFrench } from '../common/mappers/chantier.mapper';
import { Issue, Project, ProjectStatus, User } from '@prisma/client';
import { ProjectWithRelations } from '../projects/repositories/projects.repository';

export interface ConducteurDashboardResponse {
  kpis: {
    activeChantiers: number;
    lateChantiers: number;
    openReserves: number;
    criticalReserves: number;
  };
  alerts: AlertResponse[];
  recentChantiers: ChantierResponse[];
  recentReserves: ReserveResponse[];
}

export interface DirectionDashboardResponse {
  kpis: {
    totalChantiers: number;
    lateChantiers: number;
    openReserves: number;
    criticalReserves: number;
  };
  atRiskChantiers: Array<
    ChantierResponse & {
      reasons: Array<'RETARD' | 'RESERVE_CRITIQUE'>;
      criticalReservesCount: number;
    }
  >;
  statusDistribution: Array<{ status: string; count: number }>;
  conductorDistribution: Array<{
    conductorName: string;
    chantierCount: number;
    lateCount: number;
    openReservesCount: number;
  }>;
  monthlyTrend: Array<{
    label: string;
    activeChantiers: number;
    openReserves: number;
  }>;
  budget: {
    totalBudget: number;
    totalSpent: number;
    chantierCount: number;
  };
}

type IssueWithProject = Issue & { project: Project };

const STATUS_ORDER: ProjectStatus[] = [
  'PREPARATION',
  'PLANIFICATION',
  'DEMARRAGE',
  'REALISATION',
  'RECEPTION',
  'CLOTURE',
];

export function mapProjectsToChantiers(
  projects: ProjectWithRelations[],
): ChantierResponse[] {
  return projects.map(buildChantierResponse);
}

export function computeConducteurKpis(
  chantiers: ChantierResponse[],
  issues: IssueWithProject[],
  now: Date = new Date(),
): ConducteurDashboardResponse['kpis'] {
  const openIssues = issues.filter((i) => isOpenIssueStatus(i.status));
  return {
    activeChantiers: chantiers.filter((c) => c.status !== 'Clôture').length,
    lateChantiers: chantiers.filter((c) =>
      isProjectLate(parseFrenchDate(c.expectedEndDate), frenchToStatus(c.status), now),
    ).length,
    openReserves: openIssues.length,
    criticalReserves: openIssues.filter((i) => isCriticalPriority(i.priority))
      .length,
  };
}

export function computeDirectionKpisFromData(
  chantiers: ChantierResponse[],
  issues: IssueWithProject[],
  now: Date = new Date(),
): DirectionDashboardResponse['kpis'] {
  const openIssues = issues.filter((i) => isOpenIssueStatus(i.status));
  return {
    totalChantiers: chantiers.length,
    lateChantiers: chantiers.filter((c) =>
      isProjectLate(parseFrenchDate(c.expectedEndDate), frenchToStatus(c.status), now),
    ).length,
    openReserves: openIssues.length,
    criticalReserves: openIssues.filter((i) => isCriticalPriority(i.priority))
      .length,
  };
}

export function buildAlertsFromData(
  chantiers: ChantierResponse[],
  issues: IssueWithProject[],
  now: Date = new Date(),
): AlertResponse[] {
  const alerts: AlertResponse[] = [];

  for (const chantier of chantiers) {
    if (
      isProjectLate(
        parseFrenchDate(chantier.expectedEndDate),
        frenchToStatus(chantier.status),
        now,
      )
    ) {
      alerts.push({
        id: `alert-late-${chantier.id}`,
        type: 'RETARD_CHANTIER',
        message: 'Date de fin prévue dépassée',
        chantierReference: chantier.reference,
        chantierName: chantier.name,
        createdAt: formatDateFr(now),
      });
    }
  }

  const criticalByProject = new Map<string, IssueWithProject>();
  for (const issue of issues) {
    if (
      isOpenIssueStatus(issue.status) &&
      isCriticalPriority(issue.priority) &&
      !criticalByProject.has(issue.projectId)
    ) {
      criticalByProject.set(issue.projectId, issue);
    }
  }

  for (const issue of criticalByProject.values()) {
    alerts.push({
      id: `alert-crit-${issue.id}`,
      type: 'RESERVE_CRITIQUE',
      message: 'Réserve critique non levée',
      chantierReference: issue.project.reference,
      chantierName: issue.project.name,
      createdAt: formatDateFr(issue.createdAt),
    });
  }

  return alerts.slice(0, 10);
}

export function getAtRiskFromData(
  chantiers: ChantierResponse[],
  issues: IssueWithProject[],
  now: Date = new Date(),
): DirectionDashboardResponse['atRiskChantiers'] {
  return chantiers
    .map((chantier) => {
      const reasons: Array<'RETARD' | 'RESERVE_CRITIQUE'> = [];
      if (
        isProjectLate(
          parseFrenchDate(chantier.expectedEndDate),
          frenchToStatus(chantier.status),
          now,
        )
      ) {
        reasons.push('RETARD');
      }
      const criticalCount = issues.filter(
        (i) =>
          i.projectId === chantier.id &&
          isOpenIssueStatus(i.status) &&
          isCriticalPriority(i.priority),
      ).length;
      if (criticalCount > 0) reasons.push('RESERVE_CRITIQUE');
      if (reasons.length === 0) return null;
      return { ...chantier, reasons, criticalReservesCount: criticalCount };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.reasons.length - a.reasons.length);
}

export function groupByStatus(
  chantiers: ChantierResponse[],
): DirectionDashboardResponse['statusDistribution'] {
  return STATUS_ORDER.map((status) => ({
    status: statusToFrench(status),
    count: chantiers.filter((c) => c.status === statusToFrench(status)).length,
  })).filter((slice) => slice.count > 0);
}

export function groupByConductor(
  chantiers: ChantierResponse[],
  now: Date = new Date(),
): DirectionDashboardResponse['conductorDistribution'] {
  const byConductor = new Map<
    string,
    DirectionDashboardResponse['conductorDistribution'][number]
  >();

  for (const chantier of chantiers) {
    const existing = byConductor.get(chantier.conductorName) ?? {
      conductorName: chantier.conductorName,
      chantierCount: 0,
      lateCount: 0,
      openReservesCount: 0,
    };
    existing.chantierCount += 1;
    if (
      isProjectLate(
        parseFrenchDate(chantier.expectedEndDate),
        frenchToStatus(chantier.status),
        now,
      )
    ) {
      existing.lateCount += 1;
    }
    existing.openReservesCount += chantier.openReservesCount;
    byConductor.set(chantier.conductorName, existing);
  }

  return [...byConductor.values()].sort(
    (a, b) => b.chantierCount - a.chantierCount,
  );
}

export function computeBudgetOverview(
  chantiers: ChantierResponse[],
): DirectionDashboardResponse['budget'] {
  const withBudget = chantiers.filter((c) => c.budget !== undefined);
  return {
    totalBudget: withBudget.reduce((sum, c) => sum + (c.budget ?? 0), 0),
    totalSpent: withBudget.reduce((sum, c) => sum + c.budgetSpent, 0),
    chantierCount: withBudget.length,
  };
}

export function computeMonthlyTrend(
  projects: ProjectWithRelations[],
  issues: IssueWithProject[],
  months = 6,
  now: Date = new Date(),
): DirectionDashboardResponse['monthlyTrend'] {
  const points: DirectionDashboardResponse['monthlyTrend'] = [];

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const label = monthDate.toLocaleDateString('fr-FR', {
      month: 'short',
      year: 'numeric',
    });

    const activeChantiers = projects.filter(
      (p) =>
        isActiveProject(p.status) &&
        p.startDate <= monthEnd &&
        p.createdAt <= monthEnd,
    ).length;

    const openReserves = issues.filter(
      (i) =>
        isOpenIssueStatus(i.status) &&
        i.createdAt <= monthEnd &&
        (!i.closedAt || i.closedAt > monthEnd),
    ).length;

    points.push({ label, activeChantiers, openReserves });
  }

  return points;
}

export function mapIssuesToReserves(
  issues: IssueWithProject[],
  usersById: Map<string, User>,
): ReserveResponse[] {
  return issues.map((issue) =>
    buildReserveResponse(
      issue,
      usersById.get(issue.createdById)
        ? userDisplayName(usersById.get(issue.createdById)!)
        : 'Utilisateur',
    ),
  );
}

function parseFrenchDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

function frenchToStatus(label: string): ProjectStatus {
  const map: Record<string, ProjectStatus> = {
    Préparation: 'PREPARATION',
    Planification: 'PLANIFICATION',
    Démarrage: 'DEMARRAGE',
    Réalisation: 'REALISATION',
    Réception: 'RECEPTION',
    Clôture: 'CLOTURE',
  };
  return map[label] ?? 'PREPARATION';
}
