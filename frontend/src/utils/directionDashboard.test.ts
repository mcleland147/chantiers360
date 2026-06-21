import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { mockChantiers } from "../data/mockChantiers";
import { mockChantierReserves } from "../data/mockChantierTabs";
import type { Chantier } from "../types/domain";
import {
  computeBudgetOverview,
  computeDirectionKpis,
  filterMonthlyTrend,
  getAtRiskChantiers,
  groupChantiersByConductor,
  groupChantiersByStatus,
  hasCriticalOpenReserve,
} from "./directionDashboard";

const TREND_FIXTURE = [
  { label: "Jan 2025", activeChantiers: 6, openReserves: 8 },
  { label: "Fév 2025", activeChantiers: 6, openReserves: 7 },
  { label: "Mar 2025", activeChantiers: 7, openReserves: 6 },
  { label: "Avr 2025", activeChantiers: 7, openReserves: 6 },
  { label: "Mai 2025", activeChantiers: 7, openReserves: 5 },
  { label: "Juin 2025", activeChantiers: 7, openReserves: 5 },
];

describe("directionDashboard — Phase F règles métier", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-20"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("T-F-RG-001 — agrège les KPI consolidés depuis les mocks", () => {
    const kpis = computeDirectionKpis(mockChantiers, mockChantierReserves);

    expect(kpis.totalChantiers).toBe(8);
    expect(kpis.lateChantiers).toBe(2);
    expect(kpis.openReserves).toBe(5);
    expect(kpis.criticalReserves).toBe(2);
  });

  it("T-F-RG-002 — identifie les chantiers à risque (retard ou réserve critique)", () => {
    const atRisk = getAtRiskChantiers(mockChantiers, mockChantierReserves);
    const ids = atRisk.map((c) => c.id);

    expect(ids).toContain("c-3");
    expect(ids).toContain("c-6");
    expect(atRisk).toHaveLength(2);

    const c3 = atRisk.find((c) => c.id === "c-3");
    expect(c3?.reasons).toContain("RETARD");
    expect(c3?.reasons).toContain("RESERVE_CRITIQUE");
    expect(c3?.criticalReservesCount).toBe(2);

    const c6 = atRisk.find((c) => c.id === "c-6");
    expect(c6?.reasons).toEqual(["RETARD"]);
  });

  it("T-F-RG-003 — retard RG-001 exclut les chantiers Clôture", () => {
    const closedLate: Chantier = {
      ...mockChantiers[7],
      expectedEndDate: "01/01/2020",
      status: "Clôture",
    };
    const kpis = computeDirectionKpis(
      [...mockChantiers.slice(0, 7), closedLate],
      mockChantierReserves,
    );

    expect(kpis.lateChantiers).toBe(2);
    expect(
      getAtRiskChantiers(
        [...mockChantiers.slice(0, 7), closedLate],
        mockChantierReserves,
      ).some((c) => c.id === "c-8"),
    ).toBe(false);
  });

  it("T-F-RG-004 — répartition par statut et conducteur", () => {
    const byStatus = groupChantiersByStatus(mockChantiers);
    const statusTotal = byStatus.reduce((sum, s) => sum + s.count, 0);

    expect(statusTotal).toBe(8);
    expect(byStatus.some((s) => s.status === "Réalisation")).toBe(true);
    expect(byStatus.some((s) => s.status === "Exécution" as never)).toBe(
      false,
    );

    const byConductor = groupChantiersByConductor(mockChantiers);
    expect(byConductor).toHaveLength(3);
    expect(byConductor[0].chantierCount).toBeGreaterThanOrEqual(
      byConductor[1].chantierCount,
    );
  });

  it("T-F-RG-005 — réserve critique uniquement si Ouverte ou En cours", () => {
    expect(hasCriticalOpenReserve("c-3", mockChantierReserves)).toBe(true);
    expect(hasCriticalOpenReserve("c-1", mockChantierReserves)).toBe(false);
  });

  it("T-F-RG-006 — filtre tendance mensuelle par période", () => {
    expect(filterMonthlyTrend(TREND_FIXTURE, "month")).toHaveLength(1);
    expect(filterMonthlyTrend(TREND_FIXTURE, "quarter")).toHaveLength(3);
  });

  it("T-F-RG-007 — agrège le budget consolidé", () => {
    const budget = computeBudgetOverview(mockChantiers);

    expect(budget.chantierCount).toBe(8);
    expect(budget.totalBudget).toBeGreaterThan(0);
    expect(budget.totalSpent).toBeGreaterThan(0);
    expect(budget.totalSpent).toBeLessThanOrEqual(budget.totalBudget);
  });
});
