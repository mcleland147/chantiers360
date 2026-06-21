import type { Alert, Chantier, DashboardKpis, Reserve } from "../types/domain";
import type {
  AtRiskChantier,
  BudgetOverview,
  ConductorRow,
  DirectionKpis,
  DirectionPeriod,
  MonthlyTrendPoint,
  StatusSlice,
} from "../types/directionDashboard";
import { apiClient } from "./apiClient";

export interface ConducteurDashboardData {
  kpis: DashboardKpis;
  alerts: Alert[];
  recentChantiers: Chantier[];
  recentReserves: Reserve[];
}

export interface DirectionDashboardData {
  kpis: DirectionKpis;
  atRiskChantiers: AtRiskChantier[];
  statusDistribution: StatusSlice[];
  conductorDistribution: ConductorRow[];
  monthlyTrend: MonthlyTrendPoint[];
  budget: BudgetOverview;
}

export async function fetchConducteurDashboard(): Promise<ConducteurDashboardData> {
  const { data } = await apiClient.get<ConducteurDashboardData>(
    "/dashboard/conducteur",
  );
  return data;
}

export async function fetchDirectionDashboard(
  period: DirectionPeriod = "quarter",
): Promise<DirectionDashboardData> {
  const { data } = await apiClient.get<DirectionDashboardData>(
    "/dashboard/direction",
    { params: { period } },
  );
  return data;
}
