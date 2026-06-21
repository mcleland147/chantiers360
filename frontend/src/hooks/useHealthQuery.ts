import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data } = await apiClient.get("/health");
      return data;
    },
    retry: false,
  });
}
