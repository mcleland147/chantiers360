import type { Chantier, ChantierStatus } from "./domain";

export type DirectionPeriod = "month" | "quarter";

export interface DirectionKpis {
  totalChantiers: number;
  lateChantiers: number;
  openReserves: number;
  criticalReserves: number;
}

export interface StatusSlice {
  status: ChantierStatus;
  count: number;
}

export interface ConductorRow {
  conductorName: string;
  chantierCount: number;
  lateCount: number;
  openReservesCount: number;
}

export interface MonthlyTrendPoint {
  label: string;
  activeChantiers: number;
  openReserves: number;
}

export interface BudgetOverview {
  totalBudget: number;
  totalSpent: number;
  chantierCount: number;
}

export type AtRiskReason = "RETARD" | "RESERVE_CRITIQUE";

export interface AtRiskChantier extends Chantier {
  reasons: AtRiskReason[];
  criticalReservesCount: number;
}
