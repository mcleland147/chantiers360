import { CHANTIER_STATUSES } from "../config/chantierStatuses";
import type { Chantier, ChantierReserve } from "../types/domain";
import type {
  AtRiskChantier,
  AtRiskReason,
  BudgetOverview,
  ConductorRow,
  DirectionKpis,
  DirectionPeriod,
  MonthlyTrendPoint,
  StatusSlice,
} from "../types/directionDashboard";
import { isChantierLateFromEntity } from "./chantierRules";

const OPEN_RESERVE_STATUSES = new Set<ChantierReserve["status"]>([
  "Ouverte",
  "En cours",
]);

export function isReserveOpen(status: ChantierReserve["status"]): boolean {
  return OPEN_RESERVE_STATUSES.has(status);
}

export function hasCriticalOpenReserve(
  chantierId: string,
  reserves: ChantierReserve[],
): boolean {
  return reserves.some(
    (r) =>
      r.chantierId === chantierId &&
      r.priority === "Critique" &&
      isReserveOpen(r.status),
  );
}

export function countCriticalOpenReserves(reserves: ChantierReserve[]): number {
  return reserves.filter(
    (r) => r.priority === "Critique" && isReserveOpen(r.status),
  ).length;
}

export function countOpenReserves(reserves: ChantierReserve[]): number {
  return reserves.filter((r) => isReserveOpen(r.status)).length;
}

export function computeDirectionKpis(
  chantiers: Chantier[],
  reserves: ChantierReserve[],
): DirectionKpis {
  return {
    totalChantiers: chantiers.length,
    lateChantiers: chantiers.filter(isChantierLateFromEntity).length,
    openReserves: countOpenReserves(reserves),
    criticalReserves: countCriticalOpenReserves(reserves),
  };
}

export function getAtRiskChantiers(
  chantiers: Chantier[],
  reserves: ChantierReserve[],
): AtRiskChantier[] {
  return chantiers
    .map((chantier) => {
      const reasons: AtRiskReason[] = [];
      if (isChantierLateFromEntity(chantier)) {
        reasons.push("RETARD");
      }
      const criticalCount = reserves.filter(
        (r) =>
          r.chantierId === chantier.id &&
          r.priority === "Critique" &&
          isReserveOpen(r.status),
      ).length;
      if (criticalCount > 0) {
        reasons.push("RESERVE_CRITIQUE");
      }
      if (reasons.length === 0) return null;
      return { ...chantier, reasons, criticalReservesCount: criticalCount };
    })
    .filter((c): c is AtRiskChantier => c !== null)
    .sort((a, b) => b.reasons.length - a.reasons.length);
}

export function groupChantiersByStatus(chantiers: Chantier[]): StatusSlice[] {
  return CHANTIER_STATUSES.map((status) => ({
    status,
    count: chantiers.filter((c) => c.status === status).length,
  })).filter((slice) => slice.count > 0);
}

export function groupChantiersByConductor(chantiers: Chantier[]): ConductorRow[] {
  const byConductor = new Map<string, ConductorRow>();

  for (const chantier of chantiers) {
    const existing = byConductor.get(chantier.conductorName) ?? {
      conductorName: chantier.conductorName,
      chantierCount: 0,
      lateCount: 0,
      openReservesCount: 0,
    };
    existing.chantierCount += 1;
    if (isChantierLateFromEntity(chantier)) existing.lateCount += 1;
    existing.openReservesCount += chantier.openReservesCount;
    byConductor.set(chantier.conductorName, existing);
  }

  return [...byConductor.values()].sort(
    (a, b) => b.chantierCount - a.chantierCount,
  );
}

export function filterMonthlyTrend(
  points: MonthlyTrendPoint[],
  period: DirectionPeriod,
): MonthlyTrendPoint[] {
  const count = period === "month" ? 1 : 3;
  return points.slice(-count);
}

export function computeBudgetOverview(
  chantiers: Array<Chantier & { budget?: number; budgetSpent?: number }>,
): BudgetOverview {
  const withBudget = chantiers.filter(
    (c) => c.budget !== undefined && (c.budget ?? 0) > 0,
  );
  const totalBudget = withBudget.reduce((sum, c) => sum + (c.budget ?? 0), 0);
  const totalSpent = withBudget.reduce(
    (sum, c) => sum + (c.budgetSpent ?? 0),
    0,
  );
  const totalRemaining = Math.max(0, totalBudget - totalSpent);
  const consumptionPercent =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0;

  let chantiersOver80 = 0;
  let chantiersOver100 = 0;
  for (const chantier of withBudget) {
    const envelope = chantier.budget ?? 0;
    if (envelope <= 0) continue;
    const percent = ((chantier.budgetSpent ?? 0) / envelope) * 100;
    if (percent >= 80) chantiersOver80 += 1;
    if (percent >= 100) chantiersOver100 += 1;
  }

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    consumptionPercent,
    chantierCount: withBudget.length,
    chantiersOver80,
    chantiersOver100,
  };
}
