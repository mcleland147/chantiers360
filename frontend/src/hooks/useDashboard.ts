import { useQuery } from "@tanstack/react-query";
import type { DirectionPeriod } from "../types/directionDashboard";
import {
  fetchConducteurDashboard,
  fetchDirectionDashboard,
} from "../services/dashboardService";

export const dashboardKeys = {
  conducteur: ["dashboard", "conducteur"] as const,
  direction: (period: DirectionPeriod) =>
    ["dashboard", "direction", period] as const,
};

export function useConducteurDashboardQuery() {
  return useQuery({
    queryKey: dashboardKeys.conducteur,
    queryFn: fetchConducteurDashboard,
  });
}

export function useDirectionDashboardQuery(period: DirectionPeriod = "quarter") {
  return useQuery({
    queryKey: dashboardKeys.direction(period),
    queryFn: () => fetchDirectionDashboard(period),
  });
}
